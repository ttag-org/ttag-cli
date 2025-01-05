import "../declarations";
import * as babel from "@babel/core";
import * as fs from "fs";
import * as path from "path";
import * as tmp from "tmp";
import { pathToFileURL } from "url";
import { extname } from "path";
import { parseComponent } from "vue-sfc-parser";
import { walk } from "estree-walker";
import {
    parse as parseSvelte,
    preprocess as preprocessSvelte
} from "svelte/compiler";
import ignore from "ignore";
import { TemplateNode } from "svelte/types/compiler/interfaces";
import { makeBabelConf } from "../defaults";
import * as ttagTypes from "../types";
import { TransformFn, pathsWalk } from "./pathsWalk";
import { mergeOpts } from "./ttagPluginOverride";

async function getSvelteConfigFile(searchDir: string): Promise<string | null> {
    const filePath = path.resolve(searchDir, "svelte.config.js");
    try {
        const stat = await fs.promises.stat(filePath);

        if (stat.isFile()) {
            return filePath;
        }
    } catch {
        // Ignored
    }

    const parentDir = path.resolve(searchDir, "..");
    return parentDir === searchDir
        ? null
        : await getSvelteConfigFile(parentDir);
}

// https://github.com/microsoft/TypeScript/issues/43329
async function dynamicImport(filename: string) {
    const url = pathToFileURL(filename).toString();
    return eval(`import("${url}")`);
}

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
    const transformFn: TransformFn = async filepath => {
        try {
            switch (extname(filepath)) {
                case ".vue": {
                    const sourceBuffer = await fs.promises.readFile(filepath);
                    const source = sourceBuffer.toString();
                    const script = parseComponent(source).script;
                    if (script) {
                        const lineCount =
                            source.slice(0, script.start).split(/\r\n|\r|\n/)
                                .length - 1;
                        await babel.transformAsync(
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
                    const sourceBuffer = await fs.promises.readFile(filepath);
                    let source = sourceBuffer.toString();
                    const jsCodes: string[] = [];
                    const configFilePath = await getSvelteConfigFile(".");
                    if (configFilePath) {
                        const config = await dynamicImport(configFilePath);
                        const preprocess = config?.default?.preprocess;
                        if (
                            Array.isArray(preprocess) &&
                            preprocess.length > 0
                        ) {
                            const preprocessed = await preprocessSvelte(
                                source,
                                preprocess,
                                {
                                    filename: filepath
                                }
                            );
                            source = preprocessed.code;
                        }
                    }

                    const { html, instance, module } = parseSvelte(source);

                    // <script> tag should include `import { t } from 'ttag'`
                    // We put this in the front.
                    // FIXME: Because we need to put imports first,
                    // the extracted line numbers will be messed up.
                    //
                    if (module) {
                        walk(module, {
                            enter(node: TemplateNode) {
                                if (node.type !== "Program") return;
                                jsCodes.push(
                                    source.slice(node.start, node.end)
                                );
                            }
                        });
                    }

                    if (instance) {
                        walk(instance, {
                            enter(node: TemplateNode) {
                                if (node.type !== "Program") return;
                                jsCodes.push(
                                    source.slice(node.start, node.end)
                                );
                            }
                        });
                    }

                    // Collect t`...` in {...} in template
                    walk(html, {
                        enter(node: TemplateNode) {
                            if (
                                node.type !== "MustacheTag" &&
                                node.type !== "RawMustacheTag"
                            )
                                return;
                            // Attributes can be any valid Javascript expression,
                            // thus wrap in `(...);` and collect them in `jsCodes`
                            jsCodes.push(
                                `(${source.slice(
                                    node.expression.start,
                                    node.expression.end
                                )});`
                            );
                        }
                    });

                    await babel.transformAsync(jsCodes.join("\n"), {
                        filename: filepath,
                        ...babelOptions
                    });
                    break;
                }
                default:
                    await babel.transformFileAsync(filepath, babelOptions);
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
    return rcOpts?.extractor?.paths || originPaths;
}

function decorateTransformFn(
    originFunc: TransformFn,
    rcOpts?: ttagTypes.TtagRc
): TransformFn {
    const ignoreFiles = rcOpts?.extractor?.ignoreFiles;
    if (ignoreFiles) {
        const ig = ignore().add(ignoreFiles);
        return async function(filename: string): Promise<void> {
            if (ig.ignores(filename) === false) {
                await originFunc(filename);
            }
        };
    }
    return originFunc;
}
