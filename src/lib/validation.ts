import { ExpressionStatement, TemplateLiteral } from "@babel/types";
import { ast2Str } from "./utils";
import tpl from "@babel/template";

interface FormatCheckResult {
    missing: string[];
    redundant: string[];
    valid: boolean;
}

const isoCodes =
    "http://docs.translatehouse.org/projects/localization-guide/en/latest/l10n/pluralforms.html";

export function langValidationMsg(language: string): string {
    return `Unknown lang code "${
        language
    }".\nSee all available lang codes here - ${isoCodes}`;
}

/* Parse template string with babel and return a Set of template identifiers and tagged expressions */
export function parseTemplateString(str: string): Set<string> {
    const templates: Set<string> = new Set();
    const expressionStmt = <ExpressionStatement>tpl.ast("`" + str + "`");
    // I cannot into types
    const expression = <TemplateLiteral>expressionStmt.expression;
    for (const node of expression.expressions) {
        if (
            node.type == "Identifier" ||
            node.type == "CallExpression" ||
            node.type == "TaggedTemplateExpression" ||
            node.type == "BinaryExpression" ||
            node.type == "MemberExpression"
        ) {
            templates.add(ast2Str(node));
        }
    }
    return templates;
}

/* Compare to sets of templates and return missing/redundant lists */
export function checkFormat(msgid: string, msgstr: string): FormatCheckResult {
    const result = <FormatCheckResult>{
        valid: true,
        missing: [],
        redundant: []
    };
    if (msgid.indexOf("${") == -1 && msgstr.indexOf("${") == -1) {
        return result;
    }
    let parsedId, parsedStr: Set<string>;
    try {
        parsedId = parseTemplateString(msgid);
        parsedStr = parseTemplateString(msgstr);
    } catch (e) {
        result.valid = false;
        return result;
    }
    for (const elem of parsedId) {
        if (!parsedStr.has(elem)) {
            result.missing.push(elem);
            result.valid = false;
        }
    }
    for (const elem of parsedStr) {
        if (!parsedId.has(elem)) {
            result.redundant.push(elem);
            result.valid = false;
        }
    }
    return result;
}
