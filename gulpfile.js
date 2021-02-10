import gulp from 'gulp'
import merge from 'merge2'
import rename from 'gulp-rename'
import rimraf from 'rimraf'
import sourcemaps from 'gulp-sourcemaps'
import terser from 'gulp-terser'
import ts from 'gulp-typescript'
import typedoc from 'gulp-typedoc'

gulp.task("docs", function () {
    return gulp.src("src/index.ts").pipe(typedoc({
        out: "docs",
        excludeExternals: true,
        excludePrivate: true,
        excludeInternal: true,
        entryPoints: ["src/index.ts"]
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
    rimraf("dist/*.*", function ()  {});
});

gulp.task("build", gulp.series(["clean", "ts-build", "minify"]));