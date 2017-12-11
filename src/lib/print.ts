import * as chalk from "chalk";
import { Comments, Message, Headers } from "./parser";
import { generateHeader } from "gettext-parser/lib/shared";

/* Print formatted header */
export function printHeader(headers: Headers) {
    process.stdout.write(chalk.blue(generateHeader(headers)));
}

/* Print formatted comments if exists */
export function printComments(comments: Comments | undefined) {
    if (!comments) {
        return;
    }
    if (!comments.reference) {
        return;
    }
    for (const comment of comments.reference.split("\n")) {
        process.stdout.write(chalk.blue(`#: ${comment}\n`));
    }
    if (comments.flag === "fuzzy") {
        process.stdout.write(chalk.blue("#, fuzzy\n"));
    }
}

/* Print formatted context if exists */
export function printContext(ctxt: string) {
    if (ctxt != "") {
        process.stdout.write(`${chalk.yellow("msgctxt")} "${ctxt}"\n`);
    }
}

/* Print formatted msgid */
export function printMsgid(msgid: string) {
    process.stdout.write(`${chalk.yellow("msgid")} "${msgid}"\n`);
}

/* Print formatted msgstr */
export function printMsgstr(msgstr: string[]) {
    if (msgstr.length > 1) {
        for (let i = 0; i < msgstr.length; i++) {
            process.stdout.write(
                `${chalk.yellow(`msgstr[${i}]`)} "${msgstr[i]}"\n`
            );
        }
    } else {
        process.stdout.write(`${chalk.yellow("msgstr")} "${msgstr[0]}"\n`);
    }
}

/* Print formatted msgid plural*/
export function printMsgidPlural(msgid_plural: string | undefined) {
    if (!msgid_plural) {
        return;
    }
    process.stdout.write(
        `${chalk.yellow("msgid_plural:")} "${msgid_plural}"\n`
    );
}

/* Print full message */
export function printMsg(msg: Message) {
    printComments(msg.comments);
    printContext(msg.msgctxt || "");
    printMsgid(msg.msgid);
    printMsgidPlural(msg.msgid_plural);
    printMsgstr(msg.msgstr);
}
