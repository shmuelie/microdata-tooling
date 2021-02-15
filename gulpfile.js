import gulp from 'gulp'
import merge from 'merge2'
import rename from 'gulp-rename'
import rimraf from 'rimraf'
import sourcemaps from 'gulp-sourcemaps'
import terser from 'gulp-terser'
import ts from 'gulp-typescript'
import typedoc from 'gulp-typedoc'
import fsa from 'fs/promises'
import rewriteImports from 'gulp-rewrite-imports'
import path from 'path'

/** @type {{version:string}} */
const pj = await fsa.readFile("package.json").then(jsonString => JSON.parse(jsonString));
const unpkgRoot = "https://unpkg.com/microdata-tooling@" + pj.version + "/dist/";
/** @type {{[k:string]: string}} */
const importMappings = {};
for (const srcFile of await fsa.readdir("src/")) {
    const name = path.basename(srcFile, ".ts");
    importMappings["./" + name + ".js"] = unpkgRoot + name + ".min.js";
}

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
    pj.version
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
        pipe(rewriteImports({
            noRequire: true,
            noImport: true,
            experimentalEnableStreams: true,
            mappings: importMappings
        })).
        pipe(terser()).
        pipe(rename({ extname: ".min.js" })).
        pipe(sourcemaps.write(".", { includeContent: false, sourceRoot: "." })).
        pipe(gulp.dest("dist"));
});

gulp.task("clean", async function () {
    rimraf("dist/*.*", function ()  {});
});

gulp.task("build", gulp.series(["clean", "ts-build", "minify"]));