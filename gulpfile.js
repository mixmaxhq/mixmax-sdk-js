var gulp = require('gulp');
var awspublish = require('gulp-awspublish');
var awspublishRouter = require('gulp-awspublish-router');
var jshint = require('gulp-jshint');
var merge = require('merge-stream');
var webserver = require('gulp-webserver');
var declare = require('gulp-declare');
var plumber = require('gulp-plumber');
var argv = require('yargs').argv;
var runSequence = require('run-sequence');
const concurrentTransform = require('concurrent-transform');

// Upload to S3.
gulp.task('upload', function() {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('Environment variables required.');
  }

  var publisher = awspublish.create({
    params: {
      Bucket: 'mixmax-sdk-js'
    }
  });

  return gulp.src('./src/**/*')
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


// Run JSHint.
gulp.task('js-hint', function() {
  return gulp.src(['src/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
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
    // Watch changes to rebuild, and run the webserver now that everything's ready.
    // It's especially important to build _before_ running the webserver so that the livereload
    // filter considers all files (and ignores those appropriate).
    ['webserver'],
    cb);
});
