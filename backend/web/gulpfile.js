'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del');
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var concat = require('gulp-concat');
var minifyCSS = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
var runSequence = require('run-sequence');
var changed = require('gulp-changed');
var minifyHtml = require('gulp-minify-html');
var templateCache = require('gulp-angular-templatecache');
var buffer = require('vinyl-buffer');
var browserSync = require('browser-sync');
var watchify = require('watchify');
var browserify = require('browserify');
var envify = require('envify/custom');
var source = require('vinyl-source-stream');

var _ = require('lodash');

var production = process.argv[2] === 'build';

var handleError = function(task) {
	return function(err) {

		gutil.log(gutil.colors.bgRed(task + ' error:'), gutil.colors.red(err));

		this.emit('end');
	};
};

var browserifyBundlerApplyLibs = function(bundler, includeLibs) {

	try {
		var packageManifest = require('./package.json');

		var libs = packageManifest.controlFrontLibs || [];

		_.each(libs, function(lib) {

			if (includeLibs) bundler = bundler.require(lib);
			else bundler = bundler.external(lib);
		});
	} catch (e) {}

	return bundler;
};

var tasks = {
	clean: function(cb) {
		del(['build/**/*'], cb);
	},

	styles: function() {
		return gulp.src('./styles/*.css')
			.pipe(concat('bundle.css'))
			.pipe(gulpif(production, minifyCSS()))
			.pipe(gulp.dest('./build'));
	},

	template: function() {
		return gulp.src('./templates/**/*.html')
			.pipe(minifyHtml({
				empty: true,
				spare: true,
				quotes: true
			}))
			.pipe(templateCache('templates.js', {
				root: './templates/'
			}))
			.pipe(uglify())
			.pipe(gulp.dest('./build'));
	},

	fonts: function() {
		return gulp.src('./fonts/**/*')
			.pipe(changed('./build/fonts'))
			.pipe(gulp.dest('./build/fonts'));
	},

	images: function() {
		return gulp.src('./images/**/*')
			.pipe(changed('./build/images'))
			.pipe(gulp.dest('./build/images'));
	},

	bower: function() {
		return gulp.src([
				'./bower_components/jquery/dist/jquery.min.js',
				'./bower_components/jquery-mousewheel/jquery.mousewheel.min.js',
				'./bower_components/bootstrap/dist/js/bootstrap.min.js',
				'./bower_components/moment/moment.js',
				'./bower_components/bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js',
				'./bower_components/bootstrap-datepicker/dist/locales/bootstrap-datepicker.ru.min.js',
				'./bower_components/bootstrap-datepaginator/public/js/bootstrap-datepaginator.js',
				'./bower_components/owl.carousel/dist/owl.carousel.js'
			])
			.pipe(concat('plugins.js'))
			.pipe(gulp.dest('./build'));
	},

	browserify: function() {

		var debug = !production;

		var bundler = browserify('./scripts/app.js', {
			debug: debug
		});

		bundler = browserifyBundlerApplyLibs(bundler, false);

		if (debug) {
			bundler = watchify(bundler);
			bundler.transform(envify({
				NODE_ENV: 'dev'
			}));
		}
		else {
			bundler.transform(envify({
				NODE_ENV: 'prod'
			}));
		}

		var rebundle = function() {

			return bundler.bundle()
				.on('error', handleError('Browserify'))
				.pipe(source('bundle.js'))
				.pipe(buffer())
				.pipe(gulpif(debug, sourcemaps.init({loadMaps: true})))
				.pipe(gulpif(!debug, uglify({mangle: false})))
				.pipe(concat('bundle.js'))
				.pipe(gulpif(debug, sourcemaps.write('./', {debug: true})))
				.pipe(gulp.dest('build/'));
		};

		bundler.on('update', rebundle);

		return rebundle();
	},

	browserifyLibs: function() {

		var debug = !production;

		var bundler = browserify();

		bundler = browserifyBundlerApplyLibs(bundler, true);

		if (debug) {

			bundler = watchify(bundler);
		}

		var rebundle = function() {

			return bundler.bundle()
				.on('error', handleError('Browserify'))
				.pipe(source('bundle-libs.js'))
				.pipe(buffer())
				.pipe(uglify())
				.pipe(gulp.dest('build/'));
		};

		bundler.on('update', rebundle);

		return rebundle();
	}
};

gulp.task('browser-sync', function() {
	browserSync({
		proxy: 'control.ordr.ru',
		port: 3011
	});
});

gulp.task('reload-styles', ['styles'], function(){
	browserSync.reload();
});

gulp.task('reload-js', ['browserify'], function(){
	browserSync.reload();
});

gulp.task('reload-template', ['template'], function(){
	browserSync.reload();
});

gulp.task('reload-images', ['images'], function(){
	browserSync.reload();
});

gulp.task('clean', tasks.clean);

gulp.task('styles', tasks.styles);
gulp.task('fonts', tasks.fonts);
gulp.task('images', tasks.images);
gulp.task('browserify', tasks.browserify);
gulp.task('browserify-libs', tasks.browserifyLibs);
gulp.task('bower', tasks.bower);
gulp.task('template', tasks.template);

gulp.task('watch', ['clean'], function(callback) {

	runSequence(['fonts', 'images', 'template', 'styles'], 'browserify', 'browserify-libs', 'bower', callback);

	gulp.watch('./backend/web/styles/*.css', ['reload-styles']);

	gulp.watch(['./backend/web/scripts/**/*.jsx', './backend/web/scripts/**/*.js', './backend/web/libs/**/*.js'], ['reload-js']);

	gulp.watch('./backend/web/templates/**/*.html', ['reload-template']);

	gulp.watch('./backend/web/images/*', ['reload-images']);

	gutil.log(gutil.colors.bgGreen('Watching for changes...'));
});

gulp.task('build', function(callback) {
	runSequence('clean', ['fonts', 'images', 'template', 'styles'], 'browserify', 'browserify-libs', callback);
});

gulp.task('default', ['watch']);

gulp.task('watch-livereload', ['watch', 'browser-sync']);