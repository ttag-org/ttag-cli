import * as babel from "babel-core";
import "../declarations";
import * as fs from "fs";
import * as walk from "walk";
import * as path from "path";
import { getPluralFormsHeader } from "plural-forms";
import * as ora from "ora";

type C3POOpts = {
    extract: Object;
    defaultHeaders?: Object;
};

type Progress = {
    text: string;
    start(text?: string | undefined): any;
    succeed(text?: string | undefined): any;
};

function extractFile(
    filepath: string,
    babelOpts: babel.TransformOptions,
    progress: Progress
) {
    const extname = path.extname(filepath);
    if (extname === ".js" || extname === ".jsx") {
        progress.text = filepath;
        babel.transformFileSync(filepath, babelOpts);
    }
}

async function extractDir(
    dirpath: string,
    babelOpts: babel.TransformOptions,
    progress: Progress
) {
    const walker = walk.walk(dirpath);
    walker.on("file", (root: string, fileState: any, next: any) => {
        extractFile(path.join(root, fileState.name), babelOpts, progress);
        next();
    });
    return new Promise(res => {
        walker.on("end", () => res());
    });
}

async function extract(output: string, paths: string[], locale: string = "en") {
    const progress: Progress = ora(
        `[c-3po] extracting translations to ${output} ...`
    );
    progress.start();
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
                await extractDir(filePath, babelOptions, progress);
            } else {
                extractFile(filePath, babelOptions, progress);
            }
        })
    );

    progress.succeed(`[c-3po] translations extracted to ${output}`);
}

export default extract;
