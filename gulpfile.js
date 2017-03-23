var gulp = require('gulp');
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var webserver = require('gulp-webserver');

var apiProject = ts.createProject('api/tsconfig.json');
var appProject = ts.createProject('app/tsconfig.json');

function tscTask(project, destination) {
    var tsResult = project.src()
        .pipe(sourcemaps.init()) 
        .pipe(project());

    return tsResult.js
        .pipe(sourcemaps.write()) 
        .pipe(gulp.dest(destination));
}

gulp.task('typescript-api', function() { return tscTask(apiProject, 'api'); });
gulp.task('typescript-app', function() { return tscTask(appProject, 'app'); });

gulp.task('build-watch', function() {
    gulp.watch('api/**/*.ts', ['typescript-api']);
    gulp.watch('app/**/*.ts', ['typescript-app']);
});

gulp.task('webserver', function () {
    gulp.src('app')
        .pipe(webserver({
            livereload: true,
            open: true
        }));
});
