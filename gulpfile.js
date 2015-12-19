var gulp = require('gulp'),
    webserver = require('gulp-webserver'),
    livereload = require('gulp-livereload');

gulp.task('shaders', function() {
    gulp.src('shaders/*.glsl')
        .pipe(livereload());
});

gulp.task('javascripts', function() {
    gulp.src('webgl/*.js')
        .pipe(livereload());
});

gulp.task('index', function() {
    gulp.src('index.html')
        .pipe(livereload());
});

gulp.task('webserver', function() {
    gulp.src('.')
        .pipe(webserver({
            host: 'localhost',
            port: 1338,
            path: '/'
        }));
});

gulp.task('watch', function() {
    livereload.listen();
    gulp.watch('shaders/*.glsl', ['shaders']);
    gulp.watch('webgl/*.js', ['javascripts']);
    gulp.watch('index.html', ['index']);
});
