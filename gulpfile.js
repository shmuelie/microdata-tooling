import gulp from 'gulp'
import ts from 'gulp-typescript'
import sourcemaps from 'gulp-sourcemaps'
import terser from 'gulp-terser'
import del from 'del'
import merge from 'merge2'
import fs from 'fs'
import fsa from 'fs/promises'
import rename from 'gulp-rename'

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
    /**
     * @type {false | fs.Stats}
     */
    const stat = await fsa.stat("dist").catch(/** @param {NodeJS.ErrnoException | null} err */(err) => {
        if (err && err.code === "ENOENT") {
            return false;
        }
        throw err;
    });
    if (stat && stat.isDirectory()) {
        await del("dist/*.*");
    }
});

gulp.task("build", gulp.series(["clean", "ts-build", "minify"]));