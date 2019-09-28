import "../declarations";
import * as babel from "@babel/core";
import * as fs from "fs";
import * as tmp from "tmp";
import { makeBabelConf } from "../defaults";
import * as ttagTypes from "../types";
import { TransformFn, pathsWalk } from "./pathsWalk";
import { mergeOpts } from "./ttagPluginOverride";

export async function extractAll(
    paths: string[],
    lang: string,
    progress: ttagTypes.Progress,
    overrideOpts?: ttagTypes.TtagOpts
): Promise<string> {
    const tmpFile = tmp.fileSync();
    let ttagOpts: ttagTypes.TtagOpts = {
        extract: { output: tmpFile.name },
        sortByMsgid: overrideOpts && overrideOpts.sortByMsgid,
        addComments: true
    };
    if (lang !== "en") {
        ttagOpts.defaultLang = lang;
    }
    if (overrideOpts) {
        ttagOpts = mergeOpts(ttagOpts, overrideOpts);
    }
    const babelOptions = makeBabelConf(ttagOpts);
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
