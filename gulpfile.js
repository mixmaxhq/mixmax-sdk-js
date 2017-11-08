const _ = require('underscore');
var gulp = require('gulp');
var awspublish = require('gulp-awspublish');
var awspublishRouter = require('gulp-awspublish-router');
var jshint = require('gulp-jshint');
var merge = require('merge-stream');
const MultiBuild = require('multibuild');
var webserver = require('gulp-webserver');
var declare = require('gulp-declare');
const del = require('del');
var plumber = require('gulp-plumber');
var argv = require('yargs').argv;
const rename = require('gulp-rename');
var runSequence = require('run-sequence');
const concurrentTransform = require('concurrent-transform');

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

  return gulp.src(`dist/**/*`)
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
        "^.+$": "$&"
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
      console.error(e);
    } else {
      // Throw so that gulp exits.
      throw e;
    }
  },
  entry: (target) => {
    const [name, format] = target.split('.');
    return `src/${name}.js`;
  },
  rollupOptions: (target) => {
    const [name, format] = target.split('.');
    return {
      format,
      // No worries about users loading multiple submodules individually, Rollup will merge e.g.
      // `Mixmax.editor` and `Mixmax.widgets` into a single `Mixmax` module, because Rollup is awesome.
      moduleName: name === 'Mixmax' ? 'Mixmax' : `Mixmax.${target}`,
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
})

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


// Run JSHint.
// TODO(jeff): Convert to ESLint.
gulp.task('js-hint', function() {
  return gulp.src(['src/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
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
