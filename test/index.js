import assert from 'assert'
import JSDOM from 'jsdom'
import { jsonify, parse } from '../dist/index.js'
import fs from 'fs/promises'

suite("microdata-tooling", function () {
    test("jsonify", async function () {
        const dom = await JSDOM.JSDOM.fromFile("test/jsonify.htm", {
            url: "https://blog.example.com/progress-report"
        });
        const document = dom.window.document;
        const actual = jsonify(Array.from(document.body.children));
        const expected = JSON.parse((await fs.readFile("test/jsonify.json")).toString());
        assert.deepStrictEqual(actual, expected);
    });

    test("parse", async function () {
        const dom = await JSDOM.JSDOM.fromFile("test/jsonify.htm", {
            url: "https://blog.example.com/progress-report"
        });
        const document = dom.window.document;
        const actual = parse(document.getElementsByTagName("html")[0]);
        const expected = JSON.parse((await fs.readFile("test/parse.json")).toString());
        assert.deepStrictEqual(actual, expected);
    });
})