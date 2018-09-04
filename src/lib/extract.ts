import "../declarations";
import * as babel from "@babel/core";
import * as fs from "fs";
import * as tmp from "tmp";
import babelPluginTtag from "babel-plugin-ttag";
import * as babelPresetReact from "@babel/preset-react";
import * as babelPresetFlow from "@babel/preset-flow";
import babelPluginClassProperties from "@babel/plugin-proposal-class-properties";
import babelPluginRestSpread from "@babel/plugin-proposal-object-rest-spread";
import babelPluginDecorators from "@babel/plugin-proposal-decorators";
import * as ttagTypes from "../types";
import { TransformFn, pathsWalk } from "./pathsWalk";

export async function extractAll(
    paths: string[],
    lang: string,
    progress: ttagTypes.Progress
): Promise<string> {
    const tmpFile = tmp.fileSync();
    let c3pOptions: ttagTypes.TtagOpts = { extract: { output: tmpFile.name } };
    if (lang !== "en") {
        c3pOptions.defaultLang = lang;
    }
    const babelOptions = {
        presets: [babelPresetReact, babelPresetFlow],
        plugins: [
            babelPluginRestSpread,
            [babelPluginDecorators, { legacy: true }],
            babelPluginClassProperties,
            [babelPluginTtag, c3pOptions]
        ]
    };
    const transformFn: TransformFn = filepath => {
        try {
            babel.transformFileSync(filepath, babelOptions);
        } catch (err) {
            if (err.codeFrame) {
                console.error(err.codeFrame);
            } else {
                console.error(err);
            }
            progress.fail("Failed to extract translations");
            process.exit(1);
            return;
        }
    };
    await pathsWalk(paths, progress, transformFn);
    const result = fs.readFileSync(tmpFile.name).toString();
    tmpFile.removeCallback();
    return result;
}
