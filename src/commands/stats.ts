import * as fs from "fs";
import * as colors from "colors/safe";
import { parse, Translations, Message } from "../lib/parser";

type PoStats = {
    total: number;
    translated: number;
    fuzzy: number;
    contexts: number;
};

function nonEmpty(el: string) {
    return !!el;
}

function isTranslated(msg: Message): boolean {
    return msg.msgstr.filter(nonEmpty).length == msg.msgstr.length;
}

function isFuzzy(msg: Message): boolean {
    return msg.comments != undefined && msg.comments.flag == "fuzzy";
}

function statsCalculator(translations: Translations): PoStats {
    let [total, translated, fuzzy, contexts] = [0, 0, 0, 0];
    for (const contextKey of Object.keys(translations)) {
        contexts += 1;
        const context = translations[contextKey];
        for (const msgid of Object.keys(context)) {
            const msg = context[msgid];
            total += 1;
            translated += isTranslated(msg) ? 1 : 0;
            fuzzy += isFuzzy(msg) ? 1 : 0;
        }
    }
    return {
        total,
        translated,
        fuzzy,
        contexts
    };
}

export default function stats(path: string) {
    const poData = parse(fs.readFileSync(path).toString());
    const poStats = statsCalculator(poData.translations);
    console.log(`${colors.green("TOTAL:")} ${poStats.total}`);
    console.log(`${colors.green("CONTEXTS:")} ${poStats.contexts}`);
    console.log(`${colors.green("TRANSLATED:")} ${poStats.translated}`);
    console.log(`${colors.green("FUZZY:")} ${poStats.fuzzy}`);

    let indicators = [];
    const maxLength = 50;
    const filledGreen = Math.round(
        (poStats.translated - poStats.fuzzy) / poStats.total * maxLength
    );
    const filledYellow = Math.round(poStats.fuzzy / poStats.total * maxLength);
    const fillledRed = maxLength - filledGreen - filledYellow;

    for (let i = 0; i < filledGreen; i++) {
        indicators.push(colors.green("#"));
    }
    for (let i = 0; i < filledYellow; i++) {
        indicators.push(colors.yellow("#"));
    }
    for (let i = 0; i < fillledRed; i++) {
        indicators.push(colors.gray("·"));
    }
    const translatedPercent = poStats.translated / poStats.total;
    console.log(
        `[${indicators.join("")}] ${Math.round(translatedPercent * 100)}% ` +
            `${poStats.translated - poStats.fuzzy}/${poStats.total -
                poStats.translated}/${poStats.total}`
    );
}
