var gulp = require('gulp'),
  path = require('path'),
  browserify = require('browserify'),
  buffer = require('vinyl-buffer'),
  source = require('vinyl-source-stream'),
  sourcemaps = require('gulp-sourcemaps'),
  babelify = require('babelify'),
  compass = require('gulp-compass'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  chalk = require('chalk'),
  notifier = require('node-notifier'),
  gls = require('gulp-live-server');

var server = gls.new('app.js');

gulp.task('serve', function() {
  server.start();
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
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('public/scripts'))
    .pipe(server.notify());
});

gulp.task('compass', function() {
  return gulp.src(['app/client/styles/**/*.scss', '!app/client/styles/**/_*.scss'])
    .pipe(compass({
      style: 'compressed',
      project: path.join(__dirname, 'app/client/styles/'),
      css: path.join(__dirname, 'public/styles'),
      sass: path.join(__dirname, 'app/client/styles/')
    }))
    .on('error', swallowError)
    .pipe(gulp.dest('public/styles'))
    .pipe(server.notify());
});

gulp.task('compress', function() {
  return gulp.src(['public/scripts/*.js', '!public/scripts/*.min.js'])
    .pipe(uglify())
    .pipe(rename(function(path) {
      path.extname = '.min' + path.extname;
    }))
    .pipe(gulp.dest('public/scripts'));
});

gulp.task('watch', function() {
  gulp.watch(['app/client/styles/**/*.scss'], ['compass']);
  gulp.watch(['app/client/**/*.js', 'config/client.json', 'app/shared/**/*.js'], ['browserify']);
  gulp.watch(['app/server/**/*.js', 'app/server/**/*.nunj'], ['serve']);
});

function swallowError(error) {
  notifier.notify({
    title: error.name,
    message: error.message
  });

  var message = chalk.magenta(error.message);

  if (error.plugin)
    message = 'Error in plugin \'' + chalk.cyan(error.plugin) + '\': ' + message;

  console.log(message);

  this.emit('end');
}

gulp.task('default', ['serve', 'compass', 'browserify', 'watch']);