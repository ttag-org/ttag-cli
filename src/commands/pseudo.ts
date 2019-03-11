import * as fs from "fs";
import { iterateTranslations } from "../lib/utils";
import { parse } from "../lib/parser";
import { printHeader, printMsg } from "../lib/print";
import { ast2Str } from "../lib/utils";
import { ExpressionStatement, TemplateLiteral } from "@babel/types";
import tpl from "@babel/template";

const UPPER_A = <number>"A".codePointAt(0);
const UPPER_Z = <number>"Z".codePointAt(0);
const LOWER_A = <number>"a".codePointAt(0);
const LOWER_Z = <number>"z".codePointAt(0);

const PSEUDO_UPPER_A = 0x1d608;
const PSEUDO_LOWER_A = 0x1d622;

function pseudoChar(c: string) {
    let code = <number>c.codePointAt(0);
    if (code >= UPPER_A && code <= UPPER_Z) {
        code = code - UPPER_A + PSEUDO_UPPER_A;
    } else if (code >= LOWER_A && code <= LOWER_Z) {
        code = code - LOWER_A + PSEUDO_LOWER_A;
    }
    return String.fromCodePoint(code);
}

function pseudoLocalise(str: string) {
    return Array.from(str)
        .map(pseudoChar)
        .join("");
}

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
        const msgid: string = msg.msgid;
        const statement = <ExpressionStatement>tpl("`" + msgid + "`")();
        const expression = <TemplateLiteral>statement.expression;

        for (const q of expression.quasis) {
            if (q.value.raw) {
                q.value.raw = pseudoLocalise(q.value.raw);
            }
            if (q.value.cooked) {
                q.value.cooked = pseudoLocalise(q.value.cooked);
            }
        }
        process.stdout.write("Z: " + ast2Str(expression) + "\n");
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
