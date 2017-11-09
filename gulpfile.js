const _ = require('underscore');
const argv = require('yargs').argv;
const awspublish = require('gulp-awspublish');
const awspublishRouter = require('gulp-awspublish-router');
const babel = require('rollup-plugin-babel');
const concurrentTransform = require('concurrent-transform');
const commonjs = require('rollup-plugin-commonjs');
const del = require('del');
const gulp = require('gulp');
const MultiBuild = require('multibuild');
const nodeResolve = require('rollup-plugin-node-resolve');
const webserver = require('gulp-webserver');
const rename = require('gulp-rename');
const replace = require('rollup-plugin-replace');
const rootImport = require('rollup-plugin-root-import');
const runSequence = require('run-sequence');


const ENVIRONMENT = process.env.NODE_ENV || 'development';
const VERSION = require('./package.json').version;


// Upload to S3.
gulp.task('upload', ['build'], function() {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('Environment variables required.');
  }

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

const build = new MultiBuild({
  gulp,
  targets: _.flatten([
    'Mixmax',
    'editor',
    'widgets'
  ].map((name) => [`${name}.umd`, `${name}.es`])),
  errorHandler(e) {
    if (ENVIRONMENT !== 'production') {
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
    const [name, format] = target.split('.');
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
            (ENVIRONMENT === 'development') ?  null : [ 'es2015', { modules: false } ],
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
      // Only generate source maps when building for production in order to lower build times.
      sourceMap: (ENVIRONMENT === 'production')
    };
  },
  output: (target, input) => {
    const [name, format] = target.split('.');
    return input
      .pipe(rename({
        basename: name,
        extname: `.${format}.js`
      }))
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
  let tasks = [];
  if (argv['use-prebuilt-js']) {
    // If the JS was prebuilt, we shouldn't clean, and only need to build the assets.
    tasks.push('build-assets');
  } else {
    tasks.push('clean', ['build-js', 'build-assets']);
  }
  runSequence(...tasks, done);
});


gulp.task('watch', function() {
  gulp.watch('src/**/*', (file) => build.changed(file.path));
  gulp.watch('assets/**/*', ['build-assets']);
});


// Runs a local webserver.
gulp.task('webserver', function() {
  gulp.src('.')
    .pipe(webserver({
      directoryListing: true,
      port: 9000
    }));
});


// The default task (called when you run `gulp` from cli)
gulp.task('default', function(cb) {
  runSequence(
    'build',
    ['watch', 'webserver'],
    cb);
});
