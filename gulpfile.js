var gulp = require('gulp'),
  browserify = require('browserify'),
  buffer = require('vinyl-buffer'),
  source = require('vinyl-source-stream'),
  sourcemaps = require('gulp-sourcemaps'),
  reactify = require('reactify'),
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
    debug: true,
    entries: 'app/client/index.js',
    transform: [reactify]
  });

  return b.bundle()
    .pipe(source('index.js', 'app/client'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    //.pipe(uglify())
    .on('error', swallowError)
    .pipe(sourcemaps.write('./'))
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

gulp.task('watch', function() {
  gulp.watch('app/client/styles/**/*.scss', function(event) {
    gulp.start('sass');
    server.notify(event);
  });
  gulp.watch(['app/client/**/*.js', 'app/client/**/*.json', 'app/shared/**/*.js'], function(event) {
    gulp.start('browserify');
    server.notify(event);
  });
  gulp.watch(['app/server/**/*.js', 'app/server/**/*.nunj'], function() {
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

gulp.task('default', ['serve', 'browserify', 'sass', 'watch']);