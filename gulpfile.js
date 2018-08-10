const gulp = require('gulp');
const filter = require('gulp-filter');
const rev = require('gulp-rev');
const revRewrite = require('gulp-rev-rewrite');
const revDelete = require('gulp-rev-delete-original');
const revCss = require('gulp-rev-css-url');
const del = require('del');
const browserSync = require('browser-sync').create();

/**
 *
 * REVISION ASSET FILE NAMES
 *
 */

gulp.task('rev', () => {

  const assetFilter = filter([
    '**/*',
    '!**/index.html',
    '!**/sw.js',
    '!**/rev-manifest.json'
  ], {
    restore: true
  });

  return gulp.src('src/**')
    .pipe(assetFilter)
    // Copy original assets to build dir
    .pipe(gulp.dest('dist'))
    .pipe(rev())
    .pipe(revCss())
    .pipe(revDelete())
    // Write rev'd to dist dir
    .pipe(gulp.dest('dist'))
    .pipe(rev.manifest())
    .pipe(assetFilter.restore)
    // Write manifest to dist dir
    .pipe(gulp.dest('dist'));

});

/**
 *
 * REWRITE THE INDEX FILE
 *
 */

gulp.task('rewrite', ['rev'], () => {

  const manifest = gulp.src('dist/rev-manifest.json');

  return gulp.src('dist/*.html')
    .pipe(revRewrite({
      manifest
    }))
    .pipe(gulp.dest('dist'));

});

/**
 *
 * CLEAN DIST FOLDER
 *
 */

gulp.task('clean', () => {

  // Delete synchronously to prevent mistakes
  del.sync(['dist']);

});

/**
 *
 * BUILD
 *
 */

gulp.task('build', ['clean', 'rewrite']);

/**
 *
 * SERVE
 *
 */

gulp.task('serve', () => {
  browserSync.init({
    server: {
      baseDir: './src'
    }
  });

  // Watch all source files
  gulp.watch('src/**/*', () => {
    browserSync.reload();
  });
});
