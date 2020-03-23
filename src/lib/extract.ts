import "../declarations";
import * as babel from "@babel/core";
import * as fs from "fs";
import * as tmp from "tmp";
import { extname } from "path";
import { Parser } from "htmlparser2";
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
            if (extname(filepath) === ".vue") {
                let shouldExtractCode = false;
                const jsCodes: string[] = [];
                const parser = new Parser(
                    {
                        onopentag(name, attrs) {
                            const isJavaScript =
                                !attrs.type || attrs.type === "text/javascript";
                            if (name === "script" && isJavaScript) {
                                shouldExtractCode = true;
                            }
                        },
                        ontext(text) {
                            shouldExtractCode && jsCodes.push(text);
                        },
                        onclosetag(tagname) {
                            if (tagname === "script") {
                                shouldExtractCode = false;
                            }
                        }
                    },
                    { decodeEntities: true }
                );
                parser.write(fs.readFileSync(filepath).toString());
                parser.end();

                jsCodes.map(script =>
                    babel.transformSync(script, {
                        filename: filepath,
                        ...babelOptions
                    })
                );
            } else {
                babel.transformFileSync(filepath, babelOptions);
            }
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
