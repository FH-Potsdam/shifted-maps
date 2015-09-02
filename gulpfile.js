var gulp = require('gulp'),
  browserify = require('browserify'),
  buffer = require('vinyl-buffer'),
  source = require('vinyl-source-stream'),
  sourcemaps = require('gulp-sourcemaps'),
  babelify = require('babelify'),
  sass = require('gulp-sass'),
  uglify = require('gulp-uglify'),
  chalk = require('chalk'),
  notifier = require('node-notifier'),
  server = require('gulp-express');

gulp.task('serve', function() {
  server.run();
});

gulp.task('browserify', function() {
  var b = browserify({
    entries: 'app/client/index.js',
    transform: [babelify]
  });

  return b.bundle()
    .on('error', swallowError)
    .pipe(source('index.js', 'app/client'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    //.pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('public/scripts'))
    .pipe(server.notify());
});

gulp.task('sass', function() {
  return gulp.src(['app/client/styles/**/*.scss', '!app/client/styles/**/_*.scss'])
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .on('error', swallowError)
    .pipe(gulp.dest('public/styles'))
    .pipe(server.notify());
});

gulp.task('watch', function() {
  gulp.watch(['app/client/styles/**/*.scss'], ['sass']);
  gulp.watch(['app/client/**/*.js', 'config/client.json', 'app/shared/**/*.js'], ['browserify']);
  gulp.watch(['app/server/**/*.js', 'app/server/**/*.nunj'], ['serve']);
});

function swallowError(error) {
  notifier.notify({
    title: error.name,
    message: error.message
  });

  console.log('Error in plugin \'' + chalk.cyan(error.plugin) + '\': ' + chalk.magenta(error.message));

  this.emit('end');
}

gulp.task('default', ['serve', 'watch']);