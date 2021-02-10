import gulp from 'gulp'
import ts from 'gulp-typescript'
import sourcemaps from 'gulp-sourcemaps'
import terser from 'gulp-terser'
import merge from 'merge2'
import rename from 'gulp-rename'
import typedoc from 'gulp-typedoc'
import rimraf from 'rimraf'

gulp.task("docs", function () {
    return gulp.src("dist/*.d.ts").pipe(typedoc({
        out: "docs",
        excludeExternals: true,
        includeDeclarations: true
    }));
});

gulp.task("ts-build", function () {
    const tsProject = ts.createProject("tsconfig.json");
    const result = tsProject.src().
        pipe(sourcemaps.init()).
        pipe(tsProject());
    return merge([
        result.js.
            pipe(sourcemaps.write(".", { includeContent: false, sourceRoot: "../src" })).
            pipe(gulp.dest("dist")),
        result.dts.
            pipe(gulp.dest("dist"))
    ]);
});

gulp.task("minify", function () {
    return gulp.src("dist/*.js").
        pipe(sourcemaps.init()).
        pipe(terser()).
        pipe(rename({ extname: ".min.js" })).
        pipe(sourcemaps.write(".", { includeContent: false, sourceRoot: "." })).
        pipe(gulp.dest("dist"));
});

gulp.task("clean", async function () {
    rimraf("dist/*.*");
});

gulp.task("build", gulp.series(["clean", "ts-build", "minify"]));