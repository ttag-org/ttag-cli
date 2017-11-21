import * as ora from "ora";
import * as fs from "fs";
import { extractAll } from "../lib/extract";
import * as c3poTypes from "../types";
import { parse, PoData } from "../lib/parser";

function* warningPipe(
    pofile: string,
    progress: c3poTypes.Progress,
    stream: IterableIterator<string>
): IterableIterator<string> {
    /*
    Run any string in stream through warning first
    */
    for (const str of stream) {
        progress.warn(`Translation '${str}' is not found in ${pofile}`);
        yield str;
    }
}

function* unpackPoData(poData: PoData): IterableIterator<[string, string]> {
    /*
    Unpack pofile into contextKey/messageId pairs
    */
    for (const contextKey of Object.keys(poData.translations)) {
        for (const msgid of Object.keys(poData.translations[contextKey])) {
            const keyMsg = poData.translations[contextKey][msgid];
            yield [contextKey, keyMsg.msgid];
        }
    }
}

function* getUntranslated(
    translations: PoData,
    keysOnly: PoData
): IterableIterator<string> {
    /*
    Find untranslated string by extracting from translations(pofile)
    using key/context from keys(pot file).
     */
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

async function check(pofile: string, paths: string[], locale: string) {
    /*
    Check all keys from pots(keys only files) are present in pofile(files with translations)
    */

    const progress: c3poTypes.Progress = ora(
        `[c-3po] checking translations from ${paths} ...`
    );
    progress.start();
    const translations = parse(fs.readFileSync(pofile).toString());
    const keysOnly = parse(await extractAll(paths, locale, progress));

    let untranslatedStream = getUntranslated(translations, keysOnly);
    untranslatedStream = warningPipe(pofile, progress, untranslatedStream);
    const untranslated = Array.from(untranslatedStream);

    if (untranslated.length) {
        progress.fail(
            `[c-3po] has found ${untranslated.length} untranslated string(s)`
        );
        process.exit(1);
    } else {
        progress.succeed(`[c-3po] checked`);
    }
}

export default check;
