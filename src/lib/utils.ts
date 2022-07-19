import { Translations, Message, PoData, PoDataCompact } from "./parser";
import generate from "@babel/generator";
import { Node } from "@babel/types";

const pluralNumRegex = /^nplurals ?= ?(\d);/;

export function getPluralFormsNumber(pluralFormsHeader: string): number {
    const match = pluralNumRegex.exec(pluralFormsHeader);
    if (match === null) {
        throw new Error(
            `Failed to parse plural-form header ${pluralFormsHeader}`
        );
    }
    let pluralFnCount = match[1];
    if (pluralFnCount[pluralFnCount.length - 1] === ";") {
        pluralFnCount = pluralFnCount.slice(0, -1);
    }
    return parseInt(pluralFnCount, 10);
}

/* Iterate translations from all contexts in a serial run */
export function* iterateTranslations(
    translations: Translations
): IterableIterator<Message> {
    for (const ctxtId of Object.keys(translations)) {
        const ctxt = translations[ctxtId];
        for (const msgid of Object.keys(ctxt)) {
            yield ctxt[msgid];
        }
    }
}

export function ast2Str(ast: Node): string {
    return generate(ast).code;
}

export function convert2Compact(poData: PoData): PoDataCompact {
    const compactPo: PoDataCompact = {
        headers: {
            "plural-forms": "",
            language: "en"
        },
        contexts: {
            "": {}
        }
    };
    const pluralHeader =
        poData.headers["plural-forms"] || poData.headers["Plural-Forms"];
    if (!pluralHeader) {
        throw new Error('Bad .po file. "Plural-Forms" header is missing ');
    }
    compactPo.headers["plural-forms"] = pluralHeader;
    compactPo.headers.language = poData.headers.language;
    Object.entries(poData.translations).forEach(
        ([context, ctxtTranslations]) => {
            Object.entries(ctxtTranslations).forEach(([msgid, msgidData]) => {
                if (msgidData.comments && msgidData.comments.flag == "fuzzy") {
                    return;
                }
                if (!msgidData.msgstr.length) {
                    return;
                }
                if (!compactPo.contexts[context]) {
                    compactPo.contexts[context] = {};
                }
                compactPo.contexts[context][msgid] = msgidData.msgstr;
            });
        }
    );
    delete compactPo.contexts[""][""];
    return compactPo;
}
