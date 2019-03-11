import * as fs from "fs";
import { iterateTranslations } from "../lib/utils";
import { parse } from "../lib/parser";
import { printHeader, printMsg } from "../lib/print";

export default function pseudo(path: string) {
    const poData = parse(fs.readFileSync(path).toString());

    printMsg({ msgid: "", msgstr: [""] });
    printHeader(poData.headers);

    process.stdout.write("\n");
    const messages = iterateTranslations(poData.translations);
    messages.next(); // skip empty translation
    for (const msg of messages) {
        printMsg(msg);
        process.stdout.write("\n");
    }

    /*
    for (const msg of messages) {
        let invalid = false;
        for (let i = 0; i < msg.msgstr.length; i++) {
            if (!msg.msgstr[i]) {
                continue;
            }
            const result = checkFormat(msg.msgid, msg.msgstr[0]);
            if (!result.valid) {
                invalid = true;
                const missing = result.missing.length
                    ? `missing ${result.missing.join(" and ")}`
                    : "";
                const redundant = result.redundant.length
                    ? `redundant ${result.redundant.join(" and ")}`
                    : "";
                const explanation = [missing, redundant].filter(s => !!s).join(" but ");
                msg.msgstr[i] += ` <--- ${explanation};`;
            }
            if (invalid) {
                //hasErrors = true;
                printMsg(msg);
                console.log("\n");
            }
        }
    }
*/
}
