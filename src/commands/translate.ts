import * as fs from "fs";
import { parse, Message, Translations, Comments } from "../lib/parser";
import { serialize } from "../lib/serializer";
import * as readlineSync from "readline-sync";
import * as colors from "colors/safe";

function* untranslatedStream(
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

function formatPrompt(msgid: string): string {
    return `${colors.yellow("msgid:")} "${colors.white(msgid)}\n${colors.yellow(
        "msgstr:"
    )}`;
}

function printComments(comments: Comments) {
    if (!comments.reference) {
        return;
    }
    for (const comment of comments.reference.split("\n")) {
        console.log(colors.blue(`#${comment}`));
    }
}

function printContext(ctxt: string) {
    if (ctxt != "") {
        console.log("CONTEXT:", ctxt);
    }
}

export default function translate(path: string, output: string) {
    const poData = parse(fs.readFileSync(path).toString());

    const stream = untranslatedStream(poData.translations);
    // skip first message(empty msgid in header)
    stream.next();
    var { value, done } = stream.next("");
    while (!done) {
        let [ctxt, msg] = value;
        printComments(msg.comments);
        printContext(ctxt);
        const translation = readlineSync.question(formatPrompt(msg.msgid));
        const data = stream.next(translation);
        [value, done] = [data.value, data.done];
    }
    fs.writeFileSync(output, serialize(poData));
    console.log(`Translations written to ${output}`);
}
