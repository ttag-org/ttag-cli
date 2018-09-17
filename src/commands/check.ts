/*
Compare designated pofile with pot file extracted from all files in all paths
*/

import * as ora from "ora";
import * as fs from "fs";
import { extractAll } from "../lib/extract";
import * as c3poTypes from "../types";
import { parse, PoData } from "../lib/parser";

/*
Run any string in stream through warning first
*/
function* warningPipe(
    pofile: string,
    progress: c3poTypes.Progress,
    stream: IterableIterator<string>
): IterableIterator<string> {
    for (const str of stream) {
        progress.warn(`Translation '${str}' is not found in ${pofile}`);
        yield str;
    }
}

/*
Unpack pofile into contextKey/messageId pairs
*/
function* unpackPoData(poData: PoData): IterableIterator<[string, string]> {
    for (const contextKey of Object.keys(poData.translations)) {
        for (const msgid of Object.keys(poData.translations[contextKey])) {
            const keyMsg = poData.translations[contextKey][msgid];
            yield [contextKey, keyMsg.msgid];
        }
    }
}

/*
Find untranslated string by extracting from translations(pofile)
using key/context from keys(pot file).
*/
function* getUntranslated(
    translations: PoData,
    keysOnly: PoData
): IterableIterator<string> {
    for (const [contextKey, msgid] of unpackPoData(keysOnly)) {
        const context = translations.translations[contextKey];
        if (!context || !context[msgid]) {
            yield msgid;
            continue;
        }
        const msgstr = context[msgid].msgstr;
        if (msgstr.filter(s => !!s).length == 0) {
            yield msgid;
        }
    }
}

/*
Check all keys from pots(keys only files) are present in pofile(files with translations)
*/
async function check(
    pofile: string,
    paths: string[],
    lang: string,
    overrideOpts?: c3poTypes.TtagOpts
) {
    const progress: c3poTypes.Progress = ora(
        `[ttag] checking translations from ${paths} ...`
    );
    // progress.start();

    const translations = parse(fs.readFileSync(pofile).toString());
    const keysOnly = parse(
        await extractAll(paths, lang, progress, overrideOpts)
    );

    let untranslatedStream = getUntranslated(translations, keysOnly);
    untranslatedStream = warningPipe(pofile, progress, untranslatedStream);
    const untranslated = Array.from(untranslatedStream);

    if (untranslated.length) {
        progress.fail(
            `[ttag] has found ${untranslated.length} untranslated string(s)`
        );
        process.exit(1);
    } else {
        // progress.succeed(`[ttag] checked`);
    }
}

export default check;
