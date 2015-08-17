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
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');

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

		var libs = packageManifest.ordrFrontLibs || [];

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
			.pipe(imagemin({
				progressive: true,
				svgoPlugins: [{removeViewBox: false}],
				use: [pngquant()]
			}))
			.pipe(gulp.dest('./build/images'));
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
		proxy: 'ordr.ru',
		port: 3010
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

gulp.task('penthouse', tasks.penthouse);
gulp.task('critical', tasks.critical);
gulp.task('styles', tasks.styles);
gulp.task('fonts', tasks.fonts);
gulp.task('images', tasks.images);
gulp.task('browserify', tasks.browserify);
gulp.task('browserify-libs', tasks.browserifyLibs);
gulp.task('template', tasks.template);

gulp.task('watch', ['clean'], function(callback) {

	runSequence(['fonts', 'images', 'template', 'styles'], 'browserify', 'browserify-libs', callback);

	gulp.watch('./frontend/web/styles/*.css', ['reload-styles']);

	gulp.watch(['./frontend/web/scripts/**/*.jsx', './frontend/web/scripts/**/*.js', './frontend/web/libs/**/*.js'], ['reload-js']);

	gulp.watch('./frontend/web/templates/**/*.html', ['reload-template']);

	gulp.watch('./frontend/web/images/*', ['reload-images']);

	gutil.log(gutil.colors.bgGreen('Watching for changes...'));
});

gulp.task('build', function(callback) {
	runSequence('clean', ['fonts', 'images', 'template', 'styles'], 'browserify', 'browserify-libs', callback);
});

gulp.task('default', ['watch']);

gulp.task('watch-livereload', ['watch', 'browser-sync']);