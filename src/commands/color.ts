import chalk from "chalk";
import * as fs from "fs";
import { parse } from "../lib/parser";
import { iterateTranslations } from "../lib/utils";
import { printHeader, printMsg } from "../lib/print";

export default function color(path: string) {
    // Force color output even on tty, otherwise this command is useless
    chalk.enabled = true;
    chalk.level = 1;

    const data = fs.readFileSync(path).toString();
    const poData = parse(data);
    printMsg({ msgid: "", msgstr: [""] });
    printHeader(poData.headers);
    process.stdout.write("\n");
    const messages = iterateTranslations(poData.translations);
    messages.next(); // skip empty translation
    for (const msg of messages) {
        printMsg(msg);
        process.stdout.write("\n");
    }
}
