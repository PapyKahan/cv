const gulp = require('gulp');
const pug = require('gulp-pug2');
const run = require("gulp-run");
const clean = require('gulp-clean');

gulp.task('copy', function() {
    return gulp.src(['documents/images/**', 'documents/styles/**'], { base: 'documents'})
    .pipe(gulp.dest('.build/'));
});

gulp.task('compile', ['copy'], function() {
    return gulp.src('documents/*.pug')
        .pipe(pug())
        .pipe(gulp.dest('.build/'))
});


gulp.task('generate', ['compile'], function() {
    return run('phantomjs ./generate.js ./.build ./output \"A4\" \"0.55\"', {verbosity: 0, cwd: './'}).exec();
});

gulp.task('clean', ['generate'], function() {
    return gulp.src('.build/', {read:false})
    .pipe(clean());
});

gulp.task('default', ['copy', 'compile', "generate", "clean"]);