import gulp from 'gulp'
import ts from 'gulp-typescript'
import sourcemaps from 'gulp-sourcemaps'
import terser from 'gulp-terser'
import del from 'del'
import merge from 'merge2'

const tsProject = ts.createProject("tsconfig.json");

gulp.task("clean", function () {
    return del("dist/*.*");
});

gulp.task("ts-build", function () {
    const js = tsProject.src().pipe(sourcemaps.init()).pipe(tsProject());
    return merge([
        js.js.
        //pipe(terser()).
        pipe(sourcemaps.write(".", { includeContent: false, sourceRoot: "../src" })).pipe(gulp.dest("dist")),
        js.dts.pipe(gulp.dest("dist"))
    ]);
});

gulp.task("build", gulp.series(["clean", "ts-build"]));