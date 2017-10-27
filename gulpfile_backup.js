var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync'),
    concat = require('gulp-concat'),
    autoprefixer = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),
    imagemin = require('gulp-imagemin'),
    plumber = require('gulp-plumber'),
    del = require('del'),
    cleanCSS = require('gulp-clean-css'),
    useref = require('gulp-useref'),
    staticHash = require('gulp-static-hash'),

    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    streamify = require('gulp-streamify'),

    gutil = require('gulp-util'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    babel = require('gulp-babel');

gulp.task('browser-sync', function() {
  browserSync({
    server: { baseDir: 'src' },
    notify: false
  })
})

gulp.task('css', function () {
  gulp.src('src/scss/main.scss')
      .pipe(plumber())
      .pipe(sass())
      .pipe(autoprefixer({ browsers: ['last 3 versions'], cascade: false }))
      .pipe(gulp.dest('src/css'))
      .pipe(browserSync.reload({stream: true}))
})

gulp.task('browserify', function() {

   browserify('src/js/calculator.js')
        .bundle()
        .pipe(source('calculator.min.js'))
        .pipe(streamify(babel({ presets: ['es2015'] })))
        .pipe(gulp.dest('src/js'))
        .pipe(browserSync.reload({stream: true}))

   browserify('src/js/main.js')
        .bundle()
        .pipe(source('app.js'))
        .pipe(streamify(babel({ presets: ['es2015'] })))
        .pipe(gulp.dest('src/js'))
        .pipe(browserSync.reload({stream: true}))
})

gulp.task('clean', function() {
  del.sync('build')
})

gulp.task('images', function() {
  gulp.src('src/img/**/*')
      .pipe(plumber())
      .pipe(gulp.dest('build/img'))
})

gulp.task('imagemin', function() {
  gulp.src('src/img/**/*')
      .pipe(plumber())
      .pipe(imagemin())
      .pipe(gulp.dest('src/img'))
})

gulp.task('watch', ['css', 'browserify', 'browser-sync'], function() {
  gulp.watch('src/scss/**/*.+(sass|scss)', ['css'])
  gulp.watch('src/*.html', browserSync.reload)
  gulp.watch('src/js/main.js', ['browserify'])
  gulp.watch('src/js/calculator.js', ['browserify'])
  gulp.watch('src/js/mc-validate.js', ['browserify'])
})

gulp.task('build', ['clean', 'css', 'browserify', 'images'], function() {

  gulp.src(['src/css/main.css'])
      .pipe(cleanCSS({compatibility: 'ie9'}))
      .pipe(gulp.dest('build/css'))

  gulp.src(['src/js/polyfill.min.js','src/js/mc-validate.js','src/js/calculator.min.js', 'src/js/app.js'])
      .pipe(uglify())
      .on('error', gutil.log)
      .pipe(gulp.dest('build/js'))

  gulp.src('src/*.html')
      .pipe(useref({ noAssets:true }))
      .pipe(staticHash({asset: 'static'}))
      .pipe(gulp.dest('build'))

  gulp.src('src/fonts/**/*')
      .pipe(gulp.dest('build/fonts'))

  gulp.src('src/*.php')
      .pipe(useref({ noAssets:true }))
      .pipe(gulp.dest('build'))
})

gulp.task('default', ['watch'])
