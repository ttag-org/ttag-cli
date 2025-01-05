import "../declarations";
import * as ora from "ora";
import * as c3poTypes from "../types";
import { makeBabelConf } from "../defaults";
import * as babel from "@babel/core";
import * as path from "path";
import * as fs from "fs";
import { TransformFn, pathsWalk } from "../lib/pathsWalk";
import * as mkdirp from "mkdirp";

async function replace(
    pofile: string,
    out: string,
    srcPath: string,
    overrideOpts?: c3poTypes.TtagOpts
) {
    const progress: c3poTypes.Progress = ora(
        `[ttag] replacing source files with translations ...`
    );
    progress.start();
    let ttagOpts: c3poTypes.TtagOpts = {
        resolve: { translations: pofile }
    };

    if (overrideOpts) {
        ttagOpts = Object.assign(ttagOpts, overrideOpts);
    }
    const babelOptions = makeBabelConf(ttagOpts);
    const transformFn: TransformFn = async file => {
        const relativePath = path.relative(srcPath, file);
        const resultPath = path.join(out, relativePath);
        const result = await babel.transformFileAsync(file, babelOptions);
        const dir = path.dirname(resultPath);
        if (dir !== ".") {
            mkdirp.sync(dir);
        }
        if (!result) {
            progress.fail("Failed to replace");
            return;
        }
        await fs.promises.writeFile(resultPath, result.code);
    };

    await pathsWalk([srcPath], progress, transformFn);
    progress.succeed(`[ttag] replace is done`);
}

export default replace;
