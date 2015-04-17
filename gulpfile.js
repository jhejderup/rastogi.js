'use strict';

var gulp = require('gulp');
var notify = require('gulp-notify');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var plumber = require('gulp-plumber');
var gutil = require('gulp-util');
var mocha = require('gulp-mocha');
var git = require('gulp-git');
var bump = require('gulp-bump');
var config = require('./config/config.test');

var onError = function (err) {
	gutil.beep();
	gutil.beep();
	gutil.beep();
	gutil.log(gutil.colors.green(err));
};


gulp.task('jscs', function () {
    gulp.src(config.gulp.src)
        .pipe(plumber({errorHandler: onError}))
        .pipe(jscs({preset: config.jscs.preset}))
        .pipe(notify({
            title: 'JSCS',
            message: 'JSCS Task Completed!'
        }));
});

gulp.task('lint', function () {
    return gulp.src(config.gulp.src)
        .pipe(plumber({errorHandler: onError}))
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'))
        .pipe(notify({
            title: 'JSHint',
            message: 'JSHint Task Completed'
        }));
});

gulp.task('mocha', function () {
    return gulp.src(config.gulp.tests)
        .pipe(plumber({errorHandler: onError}))
        .pipe(mocha({reporter: 'list'}))
        .pipe(notify({
            title: 'Mocha',
            message: 'Testing Task Completed'
        }));
    
});

gulp.task('serve', function () {
    //watch for changes	
    gulp.watch(config.gulp.src, ['lint']);
    gulp.watch(config.gulp.src, ['jscs']);

});

gulp.task('bump', function () {
    var bumpType = process.env.BUMP || 'patch'; // major.minor.patch
    return gulp.src(['./package.json', './bower.json'])
        .pipe(bump({ type: bumpType }))
        .pipe(gulp.dest('./'));
});

gulp.task('tag', ['build'], function () {
    var pkg = require('./package.json');
    var v = 'v' + pkg.version;
    var message = 'Release ' + v;
    return gulp.src('./')
        .pipe(git.commit(message))
        .pipe(git.tag(v, message))
        .pipe(git.push('origin', 'master', '--tags'))
        .pipe(gulp.dest('./'));
});

gulp.task('npm', ['tag'], function (done) {
    require('child_process').spawn('npm', ['publish'], { stdio: 'inherit' })
    .on('close', done);
});

gulp.task('build', ['lint', 'jscs', 'mocha']);
gulp.task('ci', ['build']);
gulp.task('release', ['npm']);

gulp.task('default', function () {
	return gulp.start('build');
});
