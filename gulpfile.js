const browserify = require('browserify');
const gulp = require('gulp');
const concat = require('gulp-concat');
const eslint = require('gulp-eslint');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');
const watchify = require('watchify');

function compile(watch) {
	let bundler = watchify(browserify({
		entries: [ 'src/index.js' ],
		debug: true
	}).transform('babelify', {
		presets: [
			['env', {
				targets: {
					uglify: true
				}
			}]
		]
	}));

	function rebundle() {
		bundler.bundle()
			.on('error', console.error)
			.pipe(source('build.js'))
			.pipe(buffer())
			.pipe(sourcemaps.init({ loadMaps: true }))
			.pipe(uglify())
			.pipe(sourcemaps.write(''))
			.pipe(gulp.dest(''));

		gulp.src(['src/header.js', 'build.js'])
			.pipe(sourcemaps.init({ loadMaps: true }))
			.pipe(concat('topiclive.user.js'))
			.pipe(sourcemaps.write(''))
			.pipe(gulp.dest(''));

		lint();
	}

	if(watch) {
		bundler.on('update', rebundle);
	}

	rebundle();
}

function lint() {
	return gulp.src(['gulpfile.js', 'src/*.js'])
		.pipe(eslint())
		.pipe(eslint.format());
}

gulp.task('build', () => compile(false));
gulp.task('watch', () => compile(true));
gulp.task('default', ['watch']);
