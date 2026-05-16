import * as fs from "fs";
import * as readlineSync from "readline-sync";
import chalk from "chalk";
import { parse, Translations, PoData } from "../lib/parser";
import { serialize } from "../lib/serializer";
import {
    printComments,
    printContext,
    printMsgid,
    printMsgidPlural
} from "../lib/print";

/* Generate untranslated messages along with context */
export function* untranslatedStream(translations: Translations): any {
    for (const contextKey of Object.keys(translations)) {
        const context = translations[contextKey];
        for (const msgid of Object.keys(context)) {
            const msg = context[msgid];
            if (msg.msgstr.includes("") || !msgid) {
                msg.msgstr = yield [contextKey, msg];
            }
        }
    }
}

/* Read file and parse it shorthand */
export function read(path: string): PoData {
    return parse(fs.readFileSync(path).toString());
}

/* Stream translations for each form if many(plural) */
function* translationStream(msgstr: string[]): IterableIterator<string> {
    if (msgstr.length > 1) {
        for (let i = 0; i < msgstr.length; i++) {
            yield readlineSync.question(chalk.yellow(`msgstr[${i}]: `));
        }
    } else {
        yield readlineSync.question(chalk.yellow(`msgstr: `));
    }
}

export default function translate(path: string, output: string) {
    const poData = read(path);
    const stream = untranslatedStream(poData.translations);
    // skip first message(empty msgid in header)
    stream.next();
    var { value, done } = stream.next("");
    while (!done) {
        let [ctxt, msg] = value;
        printComments(msg.comments);
        printContext(ctxt);
        printMsgid(msg.msgid);
        printMsgidPlural(msg.msgid_plural);
        const translation = Array.from(translationStream(msg.msgstr));
        const data = stream.next(translation);
        [value, done] = [data.value, data.done];
        console.log();
    }
    fs.writeFileSync(output, serialize(poData));
    console.log(`Translations written to ${output}`);
}
