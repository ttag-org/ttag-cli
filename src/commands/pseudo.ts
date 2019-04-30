import * as fs from "fs";
import { parse } from "../lib/parser";
import { serialize } from "../lib/serializer";
import { ast2Str } from "../lib/utils";
import { ExpressionStatement, TemplateLiteral } from "@babel/types";
import tpl from "@babel/template";

const UPPER_A = <number>"A".codePointAt(0);
const UPPER_Z = <number>"Z".codePointAt(0);
const LOWER_A = <number>"a".codePointAt(0);
const LOWER_Z = <number>"z".codePointAt(0);
const ZERO = <number>"0".codePointAt(0);
const NINE = <number>"9".codePointAt(0);

// Italic Math symbols are shorter than plain text
// const PSEUDO_UPPER_A = 0x1d608;
// const PSEUDO_LOWER_A = 0x1d622;
// const PSEUDO_ZERO = 0x1d7e2;

// Bold Cursive Math symbols are longer than plain text
const PSEUDO_UPPER_A = 0x1d4d0;
const PSEUDO_LOWER_A = 0x1d4ea;
const PSEUDO_ZERO = 0x1d7ce;

function pseudoChar(c: string) {
    let code = <number>c.codePointAt(0);
    if (code >= UPPER_A && code <= UPPER_Z) {
        code = code - UPPER_A + PSEUDO_UPPER_A;
    } else if (code >= LOWER_A && code <= LOWER_Z) {
        code = code - LOWER_A + PSEUDO_LOWER_A;
    } else if (code >= ZERO && code <= NINE) {
        code = code - ZERO + PSEUDO_ZERO;
    }
    return String.fromCodePoint(code);
}

function pseudoString(str: string) {
    return Array.from(str)
        .map(pseudoChar)
        .join("");
}

function pseudoExpression(msgid: string) {
    const statement = <ExpressionStatement>tpl.ast("`" + msgid + "`");
    const expression = <TemplateLiteral>statement.expression;

    for (const q of expression.quasis) {
        if (q.value.raw) {
            q.value.raw = pseudoString(q.value.raw);
        }
        if (q.value.cooked) {
            q.value.cooked = pseudoString(q.value.cooked);
        }
    }
    // FIXME if content has backticks, they are escaped by ast; unescape them here.
    return ast2Str(expression).replace(/^`|`$/g, "");
}

export default function pseudo(path: string, output: string) {
    const poData = parse(fs.readFileSync(path).toString());

    for (const key of Object.keys(poData.translations)) {
        const ctx = poData.translations[key];
        for (const msgid of Object.keys(ctx)) {
            const msg = ctx[msgid];
            msg.msgstr = msg.msgstr.map(() => pseudoExpression(msgid));
        }
    }
    fs.writeFileSync(output, serialize(poData));
    console.log(`Translations written to ${output}`);
}
