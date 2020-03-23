import "../declarations";
import * as babel from "@babel/core";
import * as fs from "fs";
import * as tmp from "tmp";
import { extname } from "path";
import { Parser } from "htmlparser2";
import { walk } from "estree-walker";
import { parse as parseSvelte } from "svelte/compiler";
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
            switch (extname(filepath)) {
                case ".vue": {
                    let shouldExtractCode = false;
                    const jsCodes: string[] = [];
                    const parser = new Parser(
                        {
                            onopentag(name, attrs) {
                                const isJavaScript =
                                    !attrs.type ||
                                    attrs.type === "text/javascript";
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
                    break;
                }
                case ".svelte": {
                    const source = fs.readFileSync(filepath).toString();
                    const jsCodes: string[] = [];
                    const { html, instance } = parseSvelte(source);

                    // <script> tag should include `import {t } from 'ttag'`
                    // We put this in the front
                    walk(instance, {
                        enter(node) {
                            if (node.type !== "Program") return;
                            jsCodes.push(source.slice(node.start, node.end));
                        }
                    });

                    // Collect t`...` in {...} in template
                    walk(html, {
                        enter(node) {
                            if (
                                node.type !== "MustacheTag" &&
                                node.type !== "RawMustacheTag"
                            )
                                return;
                            jsCodes.push(
                                source.slice(
                                    node.expression.start,
                                    node.expression.end
                                )
                            );
                        }
                    });

                    babel.transformSync(jsCodes.join("\n"), {
                        filename: filepath,
                        ...babelOptions
                    });
                    break;
                }
                default:
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
