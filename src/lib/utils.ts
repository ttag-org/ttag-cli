import { Translations, Message, PoData, PoDataCompact } from "./parser";
import generate from "@babel/generator";
import { Node } from "@babel/types";
import { globSync } from "glob";
import * as fs from "fs";
const isGlob = require("is-glob");

const pluralNumRegex = /^nplurals ?= ?(\d);/;

export function getPluralFormsNumber(pluralFormsHeader: string): number {
    const match = pluralNumRegex.exec(pluralFormsHeader);
    if (match === null) {
        throw new Error(
            `Failed to parse plural-form header ${pluralFormsHeader}`
        );
    }
    let pluralFnCount = match[1];
    if (pluralFnCount[pluralFnCount.length - 1] === ";") {
        pluralFnCount = pluralFnCount.slice(0, -1);
    }
    return parseInt(pluralFnCount, 10);
}

/* Iterate translations from all contexts in a serial run */
export function* iterateTranslations(
    translations: Translations
): IterableIterator<Message> {
    for (const ctxtId of Object.keys(translations)) {
        const ctxt = translations[ctxtId];
        for (const msgid of Object.keys(ctxt)) {
            yield ctxt[msgid];
        }
    }
}

export function ast2Str(ast: Node): string {
    return generate(ast).code;
}

export function convert2Compact(poData: PoData): PoDataCompact {
    const compactPo: PoDataCompact = {
        headers: {
            "plural-forms": "",
            language: "en"
        },
        contexts: {
            "": {}
        }
    };
    const pluralHeader =
        poData.headers["plural-forms"] || poData.headers["Plural-Forms"];
    if (!pluralHeader) {
        throw new Error('Bad .po file. "Plural-Forms" header is missing ');
    }
    compactPo.headers["plural-forms"] = pluralHeader;
    compactPo.headers.language = poData.headers.language;
    Object.entries(poData.translations).forEach(
        ([context, ctxtTranslations]) => {
            Object.entries(ctxtTranslations).forEach(([msgid, msgidData]) => {
                if (msgidData.comments && msgidData.comments.flag == "fuzzy") {
                    return;
                }
                if (!msgidData.msgstr.length) {
                    return;
                }
                if (!compactPo.contexts[context]) {
                    compactPo.contexts[context] = {};
                }
                compactPo.contexts[context][msgid] = msgidData.msgstr;
            });
        }
    );
    delete compactPo.contexts[""][""];
    return compactPo;
}

/**
 * Helper function that calculates all the file paths from a src array with optional ignore paths.
 * The folder paths are ignored, since further directory traversing is not necessary.
 */
export function resolvePaths(
    /** Regular paths or globs */
    src: string[],
    /**
     * Could be a string or an array of strings, depending on how many paths are passed by the cli.
     *
     * `--ignore path1` => 'path1'
     *
     * `--ignore path1 --ignore path2` => ['path1', 'path2']
     */
    ignore?: string | string[]
): string[] {
    const toGlob = (path: string): string => {
        if (fs.lstatSync(path).isDirectory()) {
            if (!path.endsWith("/")) {
                path = `${path}/`;
            }
            return `${path}**/*`;
        } else {
            return path;
        }
    };

    /** All paths are internally transformed to globs, to keep backwards compatibility with 'src' paths */
    const srcGlob = src.map(path => (isGlob(path) ? path : toGlob(path)));
    if (typeof ignore === "string") {
        ignore = [ignore];
    }
    const ignoreGlob = ignore?.map(path =>
        isGlob(path) ? path : toGlob(path)
    );

    return globSync(srcGlob, {
        absolute: true,
        nodir: true,
        ignore: ignoreGlob
    });
}
