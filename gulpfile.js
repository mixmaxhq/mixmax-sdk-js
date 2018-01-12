const _ = require('underscore');
const argv = require('yargs').argv;
const awspublish = require('gulp-awspublish');
const awspublishRouter = require('gulp-awspublish-router');
const babel = require('rollup-plugin-babel');
const concurrentTransform = require('concurrent-transform');
const commonjs = require('rollup-plugin-commonjs');
const del = require('del');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const MultiBuild = require('multibuild');
const nodeResolve = require('rollup-plugin-node-resolve');
const webserver = require('gulp-webserver');
const rename = require('gulp-rename');
const replace = require('rollup-plugin-replace');
const rootImport = require('rollup-plugin-root-import');
const runSequence = require('run-sequence');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify-es').default;
const webdriver = require('gulp-webdriver');
const waitFor = require('gulp-waitfor');
const request = require('request');


const ENVIRONMENT = process.env.NODE_ENV || 'development';
const VERSION = require('./package.json').version;


// Upload to S3.
gulp.task('upload', ['build'], function() {
  var publisher = awspublish.create({
    params: {
      Bucket: 'mixmax-sdk-js'
    }
  });

  return gulp.src('dist/**/*')
    .pipe(rename({ dirname: `v${VERSION}` }))
    .pipe(awspublishRouter({
      cache: {
        cacheTime: 315360000 // 1 yr
      },
      routes: {
        '\.js$': {
          'Content-Type': 'application/javascript; charset=UTF-8',
          gzip: true
        },

        '\.css$': {
          'Content-Type': 'text/css; charset=UTF-8',
          gzip: true
        },
        '\.svg$': {

          gzip: true
        },

        // pass-through for anything that wasn't matched by routes above, to be uploaded with default options
        '^.+$': '$&'
      }
    }))
    // Upload up to 50 objects to S3 concurrently.
    .pipe(concurrentTransform(publisher.publish(), 50))
    .pipe(awspublish.reporter());
});


gulp.task('clean', () => del('dist'));

function formatTargets(targets) {
  return _.chain(targets)
    .map((name) => {
      // Generate both UMD (global/CommonJS) modules and ES modules.
      return [`${name}.umd`, `${name}.es`];
    })
    .flatten()
    .map((target) => {
      if (ENVIRONMENT === 'development') {
        return target;
      } else {
        // Generate minified versions in production and test.
        return [target, `${target}.min`];
      }
    })
    .flatten()
    .value();
}

const build = new MultiBuild({
  gulp,
  targets: formatTargets([
    'Mixmax',
    'editor',
    'analytics',
    'widgets',
    'sidebar'
  ]),
  errorHandler(e) {
    if (ENVIRONMENT === 'development') {
      // Keep watching for changes on failure.
      // eslint-disable-next-line no-console
      console.error(e);
    } else {
      // Throw so that gulp exits.
      throw e;
    }
  },
  entry: (target) => {
    const [name, ] = target.split('.');
    return `src/${name}.js`;
  },
  rollupOptions: (target) => {
    const [name, format, ] = target.split('.');
    return {
      plugins: [
        rootImport({
          root: `${__dirname}/src`,
          extensions: '.js'
        }),
        replace({
          delimiters: ['{{', '}}'],
          VERSION
        }),
        nodeResolve(),
        commonjs({
          include: 'node_modules/**',
          namedExports: {
            'es6-promise': ['Promise']
          }
        }),
        babel({
          presets: _.compact([
            /**
             * Don't run the `es2015` transformations when developing in order to speed up
             * incremental builds. Since all engineers run the latest version of Chrome when
             * developing, we don't need the `es2015` transformations.
             *
             * Disable module transformation per https://github.com/rollup/rollup-plugin-babel#modules.
             */
            (ENVIRONMENT === 'development') ? null : [ 'es2015', { modules: false } ],
          ]),
          plugins: [
            'external-helpers'
          ],
          include: 'src/**/*.js',
          /**
           * Don't transpile node_modules because they should already be transpiled and skipping
           * them will be faster.
           */
          exclude: ['node_modules/**']
        })
      ],
      format,
      // No worries about users loading multiple submodules individually, Rollup will merge e.g.
      // `Mixmax.editor` and `Mixmax.widgets` into a single `Mixmax` module, because Rollup is awesome.
      moduleName: name === 'Mixmax' ? 'Mixmax' : `Mixmax.${name}`,
      // Only generate source maps when building for production (and test) in order to lower build times.
      // Note that we generate sourcemaps even for the non-minified targets since we transpile.
      sourceMap: ENVIRONMENT !== 'development'
    };
  },
  output: (target, input) => {
    let [name, format, min] = target.split('.');

    // `min` must be a boolean, otherwise `gulp-if` will decide it's a regex against which to match
    // file names: https://github.com/robrich/gulp-match/blob/a1049b4/index.js#L18
    min = !!min;

    return input
      .pipe(gulpif(min, sourcemaps.init({ loadMaps: true })))
      .pipe(gulpif(min, uglify({ compress: true })))
      .pipe(rename({
        basename: name,
        extname: `.${format}${min ? '.min' : ''}.js`
      }))
      .pipe(gulpif(min, sourcemaps.write('.')))
      .pipe(gulp.dest('dist'));
  }
});

gulp.task('build-js', (done) => build.runAll(done));

gulp.task('build-assets', function() {
  // Building the assets (everything that's not JS) is just a matter of copying
  // them from the assets directory into `dist`.
  return gulp.src('assets/**/*').pipe(gulp.dest('dist'));
});

gulp.task('build', function(done) {
  runSequence('clean', ['build-js', 'build-assets'], done);
});


gulp.task('watch', function() {
  gulp.watch('src/**/*', (file) => build.changed(file.path));
  gulp.watch('assets/**/*', ['build-assets']);
});


// Runs a local webserver.
let ws;
gulp.task('webserver', function() {
  // Expose the webserver so we can kill it later (see below).
  ws = gulp.src('.')
    .pipe(webserver({
      directoryListing: true,
      port: 9000
    }));
});


gulp.task('webdriver', function() {
  return gulp
    .src('wdio.conf.js')
    // Repeatedly attempt to connect to the gulp-webserver. Gives up after a minute, by default.
    // This ensures that our sauce labs tests can reach the webserver.
    .pipe(waitFor((cb) => {
      request({
        url: 'http://localhost:9000',
        method: 'HEAD',
        timeout: 5 * 1000
      }, (err, res) => {
        cb(!err && res.statusCode === 200);
      });
    }))
    .pipe(webdriver())
    .on('end', function() {
      // If the stream ends, kill the webserver. We do this in particular for test:e2e, where the
      // webdriver will fail if the tests fail. When this happens, we want to have gulp exit,
      // because the testing is over.
      ws.emit('kill');
    });
});


gulp.task('test:e2e', function(cb) {
  runSequence(
    'build',
    ['webserver', 'webdriver'],
    cb);
});


// The default task (called when you run `gulp` from cli)
gulp.task('default', function(cb) {
  runSequence(
    'build',
    ['watch', 'webserver'],
    cb);
});
