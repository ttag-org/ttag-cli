import "../declarations";
import * as babel from "babel-core";
import * as fs from "fs";
import * as tmp from "tmp";
import { getPluralFormsHeader } from "plural-forms";
import babelPluginC3po from "babel-plugin-c-3po";
import * as babelPresetReact from "babel-preset-react";
import * as c3poTypes from "../types";
import { TransformFn, pathsWalk } from "./pathsWalk";

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
    const transformFn: TransformFn = filepath => {
        babel.transformFileSync(filepath, babelOptions);
    };
    await pathsWalk(paths, progress, transformFn);
    const result = fs.readFileSync(tmpFile.name).toString();
    tmpFile.removeCallback();
    return result;
}
