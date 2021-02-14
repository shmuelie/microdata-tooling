import gulp from 'gulp'
import merge from 'merge2'
import rename from 'gulp-rename'
import rimraf from 'rimraf'
import sourcemaps from 'gulp-sourcemaps'
import terser from 'gulp-terser'
import ts from 'gulp-typescript'
import typedoc from 'gulp-typedoc'
import fsa from 'fs/promises'
import map from 'vinyl-map2'

/** @type {{version:string}} */
const pj = await fsa.readFile("package.json").then(jsonString => JSON.parse(jsonString));

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
        pipe(map(/** @param {string | Buffer} code @param {string} filename @returns {string | null} */(code, filename) => {
            code = code.toString();
            // Yeah... not a great idea but it works ¯\_(ツ)_/¯
            const rewrite = {
                "./apply.js": "https://unpkg.com/browse/microdata-tooling@" + pj.version + "/dist/apply.min.js",
                "./errors.js": "https://unpkg.com/browse/microdata-tooling@" + pj.version + "/dist/errors.min.js",
                "./jsonify.js": "https://unpkg.com/browse/microdata-tooling@" + pj.version + "/dist/jsonify.min.js",
                "./parse.js": "https://unpkg.com/browse/microdata-tooling@" + pj.version + "/dist/parse.min.js",
                "./schema-simple.js": "https://unpkg.com/browse/microdata-tooling@" + pj.version + "/dist/schema-simple.min.js",
                "./sort-nodes.js": "https://unpkg.com/browse/microdata-tooling@" + pj.version + "/dist/sort-nodes.min.js",
                "./utils.js": "https://unpkg.com/browse/microdata-tooling@" + pj.version + "/dist/utils.min.js"
            };
            for (const imp in rewrite) {
                code = code.replace(imp, rewrite[imp]);
            }
            return code;
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