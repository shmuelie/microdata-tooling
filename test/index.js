import assert from 'assert'
import JSDOM from 'jsdom'
import { apply, jsonify, parse } from '../dist/index.js'
import fs from 'fs/promises'

async function getDocument(path) {
    const dom = await getDOM(path);
    return dom.window.document;
}

async function getDOM(path) {
    return await JSDOM.JSDOM.fromFile(path, {
        url: "https://blog.example.com/progress-report"
    });
}

async function parseJsonFile(path) {
    const buffer = await fs.readFile(path);
    return JSON.parse(buffer.toString());
}

suite("microdata-tooling", function () {
    test("jsonify", async function () {
        const document = await getDocument("test/jsonify.htm");
        const actual = jsonify(Array.from(document.body.children));
        const expected = await parseJsonFile("test/jsonify.json");
        assert.deepStrictEqual(actual, expected);
    });

    test("parse", async function () {
        const document = await getDocument("test/jsonify.htm");
        const actual = parse(document.getElementsByTagName("html")[0]);
        const expected = await parseJsonFile("test/parse.json");
        assert.deepStrictEqual(actual, expected);
    });

    test("apply", async function () {
        const dom = await getDOM("test/apply.htm");
        const data = await parseJsonFile("test/apply.json");
        apply(data, dom.window.document.body);
        const expected = await getDOM("test/applyExpected.htm");
        await fs.writeFile("test/applyExpected.htm", dom.serialize());
    });
})