var gulp = require('gulp'),
  browserify = require('gulp-browserify'),
  sass = require('gulp-sass'),
  uglify = require('gulp-uglify'),
  rename = require("gulp-rename"),
  watch = require('gulp-watch'),
  chalk = require('chalk'),
  notifier = require('node-notifier'),
  server = require('gulp-express');

gulp.task('serve', function() {
  server.run();
});

gulp.task('browserify', function() {
  gulp.src('app/client/index.js')
    .pipe(browserify({
      debug: true
    }))
    .on('error', swallowError)
    .pipe(gulp.dest('public/scripts'));
});

gulp.task('sass', function() {
  gulp.src(['app/client/styles/**/*.scss', '!app/client/styles/**/_*.scss'])
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .on('error', swallowError)
    .pipe(gulp.dest('public/styles'));
});

gulp.task('compress', function() {
  gulp.src(['public/scripts/*.js', '!public/scripts/*.min.js'])
    .pipe(uglify())
    .on('error', swallowError)
    .pipe(rename(function (path) {
      path.extname = '.min' + path.extname;
    }))
    .pipe(gulp.dest('public/scripts'));
});

gulp.task('watch', function() {
  gulp.watch('app/client/styles/**/*.scss', function(event) {
    gulp.start(['sass', 'compress']);
    server.notify(event);
  });
  gulp.watch(['app/client/**/*.js', 'app/client/**/*.json', 'app/shared/**/*.js'], function(event) {
    gulp.start(['browserify', 'compress']);
    server.notify(event);
  });
  gulp.watch('app/server/**/*.js', function() {
    gulp.start('serve');
  });
});

function swallowError(error) {
  notifier.notify({
    title: error.name,
    message: error.message
  });

  console.log('Error in plugin \'' + chalk.cyan(error.plugin) + '\': ' + chalk.magenta(error.message));

  this.emit('end');
}

gulp.task('default', ['serve', 'browserify', 'sass', 'compress', 'watch']);