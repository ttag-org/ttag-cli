import * as fs from "fs";
import { parse, Message, Translations, Comments, PoData } from "../lib/parser";
import { serialize } from "../lib/serializer";
import * as readlineSync from "readline-sync";
import * as colors from "colors/safe";

/* Generate untranslated messages along with context */
export function* untranslatedStream(
    translations: Translations
): IterableIterator<[string, Message]> {
    for (const contextKey of Object.keys(translations)) {
        const context = translations[contextKey];
        for (const msgid of Object.keys(context)) {
            const msg = context[msgid];
            msg.msgstr = yield [contextKey, msg];
        }
    }
}

export function read(path: string): PoData {
    return parse(fs.readFileSync(path).toString());
}

/* Stream translations for each form if many(plural) */
function* translationStream(msgstr: string[]): IterableIterator<string> {
    if (msgstr.length > 1) {
        for (let i = 0; i < msgstr.length; i++) {
            yield readlineSync.question(colors.yellow(`msgstr[${i}]: `));
        }
    } else {
        yield readlineSync.question(colors.yellow(`msgstr: `));
    }
}

/* Print formatted comments if exists */
function printComments(comments: Comments | undefined) {
    if (!comments) {
        return;
    }
    if (!comments.reference) {
        return;
    }
    for (const comment of comments.reference.split("\n")) {
        console.log(colors.blue(`#${comment}`));
    }
}

/* Print formatted context if exists */
function printContext(ctxt: string) {
    if (ctxt != "") {
        console.log(`${colors.yellow("msgctxt")} "${ctxt}"`);
    }
}
/* Print formatted msgid */
function printMsgid(msgid: string) {
    console.log(`${colors.yellow("msgid:")} "${msgid}"`);
}

/* Print formatted msgid plural*/
function printMsgidPlural(msgid_plural: string | undefined) {
    if (!msgid_plural) {
        return;
    }
    console.log(`${colors.yellow("msgid_plural:")} "${msgid_plural}"`);
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
