'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del');
var gulpif = require('gulp-if');
var browserSync = require('browser-sync');
var runSequence = require('run-sequence');
var changed = require('gulp-changed');

// javascript
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var browserify = require('browserify');
var envify = require('envify/custom');
var removeCode = require('gulp-remove-code');

// css
var minifyCSS = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');

//images
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var webp = require('gulp-webp');

//html
var minifyHtml = require('gulp-minify-html');
var templateCache = require('gulp-angular-templatecache');

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
		var packageManifest = require('../../package.json');

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

	criticalStyles: function() {
		return gulp.src('./styles/critical.css')
			.pipe(concat('bundle.css'))
			.pipe(gulpif(production, autoprefixer({
				browsers: ['last 2 versions'],
				cascade: false
			})))
			.pipe(gulpif(production, minifyCSS()))
			.pipe(gulp.dest('./build'));
	},

	uncriticalStyles: function() {

		return gulp.src(['./styles/*.css', '!./styles/critical.css', '!./styles/fonts.css'])
			.pipe(concat('bundle-uncritical.css'))
			.pipe(gulpif(production, autoprefixer({
				browsers: ['last 2 versions'],
				cascade: false
			})))
			.pipe(gulpif(production, minifyCSS()))
			.pipe(gulp.dest('./build'));
	},

	fontsStyles: function() {
		return gulp.src(['./styles/fonts.css'])
			.pipe(concat('fonts.css'))
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

	imagesWebP: function() {
		return gulp.src('./images/**/*')
			.pipe(webp())
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
					.pipe(gulpif(!debug, removeCode({production: true})))
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

gulp.task('reload-styles', ['criticalStyles', 'uncriticalStyles', 'fontsStyles'], function(){
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

gulp.task('criticalStyles', tasks.criticalStyles);
gulp.task('uncriticalStyles', tasks.uncriticalStyles);
gulp.task('fontsStyles', tasks.fontsStyles);
gulp.task('fonts', tasks.fonts);
gulp.task('images', tasks.images);
gulp.task('imagesWebP', tasks.imagesWebP);
gulp.task('browserify', tasks.browserify);
gulp.task('browserify-libs', tasks.browserifyLibs);
gulp.task('template', tasks.template);

gulp.task('watch', ['clean'], function(callback) {

	runSequence(['fonts', 'images', 'imagesWebP', 'template', 'criticalStyles', 'uncriticalStyles', 'fontsStyles'], 'browserify', 'browserify-libs', callback);

	gulp.watch('./styles/*.css', ['reload-styles']);

	gulp.watch(['./scripts/**/*.jsx', './scripts/**/*.js', './libs/**/*.js'], ['reload-js']);

	gulp.watch('./templates/**/*.html', ['reload-template']);

	gulp.watch('./images/*', ['reload-images']);

	gutil.log(gutil.colors.bgGreen('Watching for changes...'));
});

gulp.task('build', function(callback) {
	runSequence('clean', ['fonts', 'images', 'imagesWebP', 'template', 'criticalStyles', 'uncriticalStyles', 'fontsStyles'], 'browserify', 'browserify-libs', callback);
});

gulp.task('default', ['watch']);

gulp.task('watch-livereload', ['watch', 'browser-sync']);