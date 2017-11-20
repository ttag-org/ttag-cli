import * as ora from "ora";
import * as fs from "fs";
import { extractAll } from "../lib/extract";
import * as c3poTypes from "../types";
import { parse } from "../lib/parser";

async function check(pofile: string, paths: string[], locale: string) {
    const untranslated: Array<string> = [];

    function unTranslatedFound(str: string): void {
        untranslated.push(str);
        progress.warn(`Translation '${str}' is not found in ${pofile}`);
    }

    const progress: c3poTypes.Progress = ora(
        `[c-3po] checking translations from ${paths} ...`
    );

    const existingTranslations = parse(fs.readFileSync(pofile).toString());

    progress.start();
    const resultPot = await extractAll(paths, locale, progress);
    const extractedStrs = parse(resultPot);

    for (const context of Object.keys(extractedStrs.translations)) {
        for (const msgid of Object.keys(extractedStrs.translations[context])) {
            const translation = extractedStrs.translations[context][msgid];
            const existingContext = existingTranslations.translations[context];

            if (existingContext && existingContext[translation.msgid]) {
                const msgstr = existingContext[translation.msgid].msgstr;
                const translations = msgstr.filter(s => !!s);
                if (!translations.length) {
                    unTranslatedFound(translation.msgid);
                }
            } else {
                unTranslatedFound(translation.msgid);
            }
        }
    }

    if (untranslated.length) {
        progress.fail(
            `[c-3po] has found ${untranslated.length} untranslated strings`
        );
        process.exit(1);
    } else {
        progress.succeed(`[c-3po] checked`);
    }
}

export default check;
