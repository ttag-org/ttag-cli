import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import fetch from "node-fetch";
import * as serialize from "serialize-javascript";

import * as Spellchecker from "hunspell-spellchecker";

const HOMEDIR = os.homedir();
const C3PODIR = ".c-3po";
const DICTDIR = "dicts";

export interface Checker {
    check: (s: string) => boolean;
    suggest: (s: string) => string[];
}

/* Create necessary dirs */
function ensureDictDir() {
    if (!fs.existsSync(path.join(HOMEDIR, C3PODIR))) {
        fs.mkdirSync(path.join(HOMEDIR, C3PODIR));
    }
    if (!fs.existsSync(path.join(HOMEDIR, C3PODIR, DICTDIR))) {
        fs.mkdirSync(path.join(HOMEDIR, C3PODIR, DICTDIR));
    }
}

function getDictName(locale: string): string {
    return path.join(HOMEDIR, C3PODIR, DICTDIR, `${locale}.json`);
}

/* Safely serialize dict with regexp rules and save it */
function saveDict(dictName: string, dict: Object) {
    ensureDictDir();
    fs.writeFileSync(dictName, serialize(dict));
}

/* Load dict from file and eval it to create all objects */
function loadDict(dictName: string) {
    return eval(`(${fs.readFileSync(dictName).toString()})`);
}

/* Load dict file either from web or from disc and save it */
export async function getChecker(locale: string): Promise<Checker> {
    if (!LOCALEDICTMAP[locale]) {
        throw "Incorrect or unsupported locale";
    }
    const dictName = getDictName(locale);
    if (fs.existsSync(dictName)) {
        try {
            return new Spellchecker(loadDict(dictName));
        } catch (err) {
            console.error(err);
        }
    }
    const responseAff = await fetch(`${BASEPATH}${LOCALEDICTMAP[locale].aff}`);
    const aff = await responseAff.text();
    const responseDic = await fetch(`${BASEPATH}${LOCALEDICTMAP[locale].dic}`);
    const dic = await responseDic.text();
    const spellchecker = new Spellchecker();
    const dict = spellchecker.parse({ aff, dic });
    try {
        saveDict(dictName, dict);
    } catch (err) {
        console.warn(`Could not save dict to ${dictName}: ${err}`);
    }
    spellchecker.use(dict);
    return spellchecker;
}

const BASEPATH =
    "https://raw.githubusercontent.com/LibreOffice/dictionaries/master/";

const LOCALEDICTMAP: {
    [locale: string]: { [key in "aff" | "dic"]: string };
} = {
    uk: { aff: "uk_UA/uk_UA.aff", dic: "uk_UA/uk_UA.dic" },
    ru: { aff: "ru_RU/ru_RU.aff", dic: "ru_RU/ru_RU/dic" },
    en: { aff: "en/en_US.aff", dic: "en/en_US.dic" }
};
