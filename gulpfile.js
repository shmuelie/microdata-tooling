import gulp from 'gulp'
import ts from 'gulp-typescript'
import sourcemaps from 'gulp-sourcemaps'
import terser from 'gulp-terser'
import del from 'del'
import merge from 'merge2'
import fs from 'fs'
import fsa from 'fs/promises'

const mainDest = "dist";
/**
 * @type {{target: string, dest: string}[]}
 */
const configs = JSON.parse(fs.readFileSync("configurations.json").toString());

/**
 * @type {string[]}
 */
const tsBuilds = [
];
/**
 * @type {string[]}
 */
const cleanBuilds = [];
for (const config of configs) {
    const tsName = "ts-build-" + config.target;
    gulp.task(tsName, function () {
        const tsProject = ts.createProject("tsconfig.json", {
            target: config.target
        });
        const result = tsProject.src().pipe(sourcemaps.init()).pipe(tsProject());
        return merge([
            result.js.pipe(terser()).pipe(sourcemaps.write(".", { includeContent: false, sourceRoot: "../src" })).pipe(gulp.dest(config.dest)),
            result.dts.pipe(gulp.dest(config.dest))
        ]);
    });
    tsBuilds.push(tsName);
    const cleanName = "clean-" + config.target;
    gulp.task(cleanName, async function () {
        /**
         * @type {false | fs.Stats}
         */
        const stat = await fsa.stat(config.dest).catch(/** @param {NodeJS.ErrnoException | null} err */(err) => {
            if (err && err.code === "ENOENT") {
                return false;
            }
            throw err;
        });
        if (stat && stat.isDirectory()) {
            await del(config.dest + "/*.*");
        }
    });
    cleanBuilds.push(cleanName);
}

gulp.task("ts-build", gulp.series(tsBuilds));
gulp.task("clean", gulp.series(cleanBuilds));
gulp.task("build", gulp.series(["clean", "ts-build"]));