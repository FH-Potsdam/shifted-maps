var gulp = require('gulp'),
  gulpUtil = require('gulp-util'),
  path = require('path'),
  browserify = require('browserify'),
  watchify = require('watchify'),
  source = require('vinyl-source-stream'),
  babelify = require('babelify'),
  compass = require('gulp-compass'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  gls = require('gulp-live-server');

var server = gls.new('app.js');

function bundler(watch) {
  var bundler = browserify({
    debug: true,
    entries: ['app/client/index.js'],
    transform: [
      babelify.configure({
        optional: ['runtime', 'es7.classProperties']
      })
    ]
  });

  if (watch) {
    bundler = watchify(bundler)
      .on('update', function() {
        bundle(bundler);
      })
      .on('log', gulpUtil.log);
  }

  return bundle(bundler);
}

function bundle(bundler) {
  return bundler.bundle()
    .on('error', (error) => gulpUtil.log(error.message))
    .pipe(source('index.js'))
    .pipe(gulp.dest('public/scripts'));
}

gulp.task('serve', function() {
  server.start();
});

gulp.task('browserify', function() {
  return bundler(false);
});

gulp.task('compass', function() {
  return gulp.src(['app/client/styles/**/*.scss', '!app/client/styles/**/_*.scss'])
    .pipe(compass({
      style: 'compressed',
      project: path.join(__dirname, 'app/client/styles/'),
      css: path.join(__dirname, 'public/styles'),
      sass: path.join(__dirname, 'app/client/styles/')
    }))
    .on('error', gulpUtil.log)
    .pipe(gulp.dest('public/styles'));
});

gulp.task('compress', ['browserify'], function() {
  return gulp.src(['public/scripts/*.js', '!public/scripts/*.min.js'])
    .pipe(uglify())
    .pipe(rename(function(path) {
      path.extname = '.min' + path.extname;
    }))
    .pipe(gulp.dest('public/scripts'));
});

gulp.task('watch', function() {
  gulp.watch(['app/client/styles/**/*.scss'], ['compass']);
  gulp.watch(['app/server/**/*.js', 'app/server/**/*.nunj'], ['serve']);

  bundler(true);
});

gulp.task('default', ['serve', 'compass', 'browserify', 'watch']);