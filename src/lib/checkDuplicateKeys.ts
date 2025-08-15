import { PoData } from "./parser";

export const getMsgid = (str: TemplateStringsArray, exprs: Array<unknown>) => {
    const result = [];
    const exprsLenght = exprs.length;
    const strLength = str.length;
    for (let i = 0; i < strLength; i++) {
        const expr = i < exprsLenght ? `\${${i}}` : "";
        result.push(str[i] + expr);
    }
    return result.join("");
};

const stringableRewindingIterator = () => ({
    values: [] as number[],
    index: -1,
    toString() {
        this.index = (this.index + 1) % this.values.length;
        return this.values[this.index].toString();
    }
});

const removeSpaces = (str: string) => str.replace(/\s/g, "");

const mem: { [key: string]: ReturnType<typeof RegExp> } = {};
// eslint-disable-next-line no-unused-vars
const memoize1 = (f: (i: string) => ReturnType<typeof RegExp>) => (
    arg: string
) => {
    if (mem[arg]) {
        return mem[arg];
    }
    mem[arg] = f(arg);
    return mem[arg];
};

const reg = (i: string) =>
    new RegExp(`\\$\\{(?:[\\s]+?|\\s?)${i}(?:[\\s]+?|\\s?)}`);
const memReg = memoize1(reg);

export const msgid2Orig = (id: string, exprs: Array<any>): string => {
    return exprs.reduce(
        (r, expr, i) => r.replace(memReg(String(i)), String(expr)),
        id
    );
};

export const buildStr = (strs: TemplateStringsArray, exprs: Array<any>) => {
    const exprsLength = exprs.length - 1;
    return strs.reduce(
        (r, s, i) => r + s + (i <= exprsLength ? exprs[i] : ""),
        ""
    );
};

export const buildArr = (strs: TemplateStringsArray, exprs: Array<any>) => {
    return strs.reduce((r, s, i) => {
        return exprs[i] !== undefined ? r.concat(s, exprs[i]) : r.concat(s);
    }, [] as Array<any>);
};

function pluralFnBody(pluralStr: string) {
    return `return args[+ (${pluralStr})];`;
}

const fnCache: { [key: string]: ReturnType<typeof Function> } = {};

export function makePluralFunc(pluralStr: string) {
    let fn = fnCache[pluralStr];
    if (!fn) {
        fn = new Function("n", "args", pluralFnBody(pluralStr));
        fnCache[pluralStr] = fn;
    }
    return fn;
}

const pluralRegex = /\splural ?=?([\s\S]*);?/;

export function getPluralFunc(headers: { [headerName: string]: string }) {
    const pluralFormsHeader =
        headers["plural-forms"] || headers["Plural-Forms"];
    if (!pluralFormsHeader) {
        throw new Error(
            'po. data should include "language" or "plural-form" header for ngettext'
        );
    }
    let pluralFn = pluralRegex.exec(pluralFormsHeader)?.[1] || [];
    if (pluralFn[pluralFn.length - 1] === ";") {
        pluralFn = pluralFn.slice(0, -1);
    }
    return pluralFn;
}

const variableREG = /\$\{\s*([.\w+\[\]])*\s*\}/g;

function getObjectKeys(obj: { [key: string]: unknown }) {
    const keys = [];
    for (const [key] of Object.entries(obj)) {
        if (obj.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys;
}

function replaceVariables(str: string, obj: { [key: string]: unknown }) {
    return str.replace(variableREG, variable => {
        return `\$\{${obj[removeSpaces(variable)]}\}`;
    });
}

function getVariablesMap(msgid: string) {
    const variableNumberMap: {
        [key: string]: ReturnType<typeof stringableRewindingIterator>;
    } = {};
    const variables: string[] | null = msgid.match(variableREG);
    if (!variables) return null;
    for (let i = 0; i < variables.length; i++) {
        const k = removeSpaces(variables[i]);
        variableNumberMap[k] =
            variableNumberMap[k] || stringableRewindingIterator();
        variableNumberMap[k].values.push(i);
    }
    return variableNumberMap;
}

function transformCompactTranslate(msgid: string): string {
    const variableNumberMap = getVariablesMap(msgid);

    if (!variableNumberMap) {
        return msgid;
    }
    return replaceVariables(msgid, variableNumberMap);
}

function findDuplicatingMsgid(msgids: string[], transformedMsgid: string) {
    return msgids.find(msgid => {
        const variableNumberMap = getVariablesMap(msgid);

        if (!variableNumberMap) {
            return false;
        }
        return replaceVariables(msgid, variableNumberMap) === transformedMsgid;
    });
}

export function checkDuplicateKeys(poData: PoData) {
    const ctxKeys = getObjectKeys(poData.translations);
    const errors = [];
    for (let i = 0; i < ctxKeys.length; i++) {
        const ctx = ctxKeys[i];
        const transformedMsgids: Set<string> = new Set();
        const msgids = getObjectKeys(poData.translations[ctx]);
        for (let j = 0; j < msgids.length; j++) {
            const msgid = msgids[j];
            const newMsgid = transformCompactTranslate(msgid); // msgid where vars replaced by number t`test ${num1}`  => t`test ${0}`
            if (transformedMsgids.has(newMsgid)) {
                const duplicatedMsgid = findDuplicatingMsgid(msgids, newMsgid);
                errors.push(
                    `Duplicate msgid ("${msgid}" and "${duplicatedMsgid}" in the same context will be interpreted as the same key "${newMsgid}") this potentially can lead to translation loss.`
                );
            }
            transformedMsgids.add(newMsgid);
        }
    }
    if (errors.length > 0) {
        errors.push("Consider using deferent context for one of those msgid\'s. See the context doc here - https://ttag.js.org/docs/context.html")
        return errors.join("\n");
    }
    return null;
}
