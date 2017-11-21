import "../declarations";
import * as walk from "walk";
import * as path from "path";
import * as babel from "babel-core";
import * as fs from "fs";
import * as tmp from "tmp";
import { getPluralFormsHeader } from "plural-forms";
import babelPluginC3po from "babel-plugin-c-3po";
import * as babelPresetReact from "babel-preset-react";
import * as c3poTypes from "../types";

function extractFile(
    filepath: string,
    babelOpts: babel.TransformOptions,
    progress: c3poTypes.Progress
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
    progress: c3poTypes.Progress
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

export async function extractAll(
    paths: string[],
    lang: string,
    progress: c3poTypes.Progress
): Promise<string> {
    const tmpFile = tmp.fileSync();
    let c3pOptions: c3poTypes.C3POOpts = { extract: { output: tmpFile.name } };
    if (lang !== "en") {
        const pluralHeaders = getPluralFormsHeader(lang);
        c3pOptions.defaultHeaders = { "plural-forms": pluralHeaders };
    }
    const babelOptions = {
        presets: [babelPresetReact],
        plugins: [[babelPluginC3po, c3pOptions]]
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
    const result = fs.readFileSync(tmpFile.name).toString();
    tmpFile.removeCallback();
    return result;
}
