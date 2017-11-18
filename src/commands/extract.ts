import * as babel from "babel-core";
import "../declarations";
import * as fs from "fs";
import * as walk from "walk";
import * as path from "path";
import { getPluralFormsHeader } from "plural-forms";

function extractFile(filepath: string, babelOpts: babel.TransformOptions) {
    const extname = path.extname(filepath);
    if (extname === ".js" || extname === ".jsx") {
        babel.transformFileSync(filepath, babelOpts);
    }
}

async function extractDir(dirpath: string, babelOpts: babel.TransformOptions) {
    const walker = walk.walk(dirpath);
    walker.on("file", (root: string, fileState: any, next: any) => {
        extractFile(path.join(root, fileState.name), babelOpts);
        next();
    });
    return new Promise(res => {
        walker.on("end", () => {
            res();
        });
    });
}

type C3POOpts = {
    extract: Object;
    defaultHeaders?: Object;
};

async function extract(output: string, paths: string[], locale: string = "en") {
    console.log(`[c-3po] started extraction from ${paths} to ${output} ...`);
    let c3pOptions: C3POOpts = { extract: { output } };
    if (locale !== "en") {
        const pluralHeaders = getPluralFormsHeader(locale);
        c3pOptions.defaultHeaders = { "plural-forms": pluralHeaders };
    }
    const babelOptions = {
        presets: ["react"],
        plugins: [["c-3po", c3pOptions]]
    };

    await Promise.all(
        paths.map(async filePath => {
            if (fs.lstatSync(filePath).isDirectory()) {
                await extractDir(filePath, babelOptions);
            } else {
                extractFile(filePath, babelOptions);
            }
        })
    );

    console.log(`[c-3po] has successfully extracted translations to ${output}`);
}

export default extract;
