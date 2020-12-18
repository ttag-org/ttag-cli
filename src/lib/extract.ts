import "../declarations";
import * as babel from "@babel/core";
import * as fs from "fs";
import * as tmp from "tmp";
import { extname } from "path";
import { parseComponent } from "vue-sfc-parser";
import { walk } from "estree-walker";
import { parse as parseSvelte } from "svelte/compiler";
import ignore from "ignore";
import { TemplateNode } from "svelte/types/compiler/interfaces";
import { makeBabelConf } from "../defaults";
import * as ttagTypes from "../types";
import { TransformFn, pathsWalk } from "./pathsWalk";
import { mergeOpts } from "./ttagPluginOverride";

export async function extractAll(
    paths: string[],
    lang: string,
    progress: ttagTypes.Progress,
    overrideOpts?: ttagTypes.TtagOpts,
    rcOpts?: ttagTypes.TtagRc
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
                    const source = fs.readFileSync(filepath).toString();
                    const script = parseComponent(source).script;
                    if (script) {
                        const lineCount =
                            source.slice(0, script.start).split(/\r\n|\r|\n/)
                                .length - 1;
                        babel.transformSync(
                            "\n".repeat(lineCount) + script.content,
                            {
                                filename: filepath,
                                ...babelOptions
                            }
                        );
                    }
                    break;
                }
                case ".svelte": {
                    const source = fs.readFileSync(filepath).toString();
                    const jsCodes: string[] = [];
                    const { html, instance } = parseSvelte(source);

                    // <script> tag should include `import {t } from 'ttag'`
                    // We put this in the front
                    walk(instance, {
                        enter(node: TemplateNode) {
                            if (node.type !== "Program") return;
                            jsCodes.push(source.slice(node.start, node.end));
                        }
                    });

                    // Collect t`...` in {...} in template
                    walk(html, {
                        enter(node: TemplateNode) {
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
    await pathsWalk(
        getWalkingPaths(paths, rcOpts),
        progress,
        decorateTransformFn(transformFn, rcOpts)
    );
    const result = fs.readFileSync(tmpFile.name).toString();
    tmpFile.removeCallback();
    return result;
}

function getWalkingPaths(
    originPaths: string[],
    rcOpts?: ttagTypes.TtagRc
): string[] {
    try {
        return rcOpts.extractor.paths || originPaths;
    } catch (err) {
        return originPaths;
    }
}

function decorateTransformFn(
    originFunc: TransformFn,
    rcOpts?: ttagTypes.TtagRc
): TransformFn {
    const ignoreFiles =
        "extractor" in rcOpts && "ignoreFiles" in rcOpts.extractor
            ? rcOpts.extractor.ignoreFiles
            : null;
    if (ignoreFiles) {
        const ig = ignore().add(ignoreFiles);
        return function(filename: string): void {
            return ig.ignores(filename) === false
                ? originFunc(filename)
                : undefined;
        };
    }
    return originFunc;
}
