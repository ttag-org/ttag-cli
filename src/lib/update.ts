import { PoData, Messages, Translations } from "./parser";
import { mergeMessage } from "./merge";
import { getPluralFormsNumber } from "./utils";

function updateMessages(
    potMessages: Messages,
    poMessages: Messages,
    pluralsNum: number
): Messages {
    const updated: Messages = {};
    for (const msgid of Object.keys(poMessages)) {
        if (potMessages[msgid] !== undefined) {
            updated[msgid] = poMessages[msgid];
        }
    }

    for (const msgid of Object.keys(potMessages)) {
        if (!poMessages[msgid]) {
            updated[msgid] = potMessages[msgid];
            updated[msgid].msgstr = new Array(pluralsNum).fill("");
        } else {
            updated[msgid] = mergeMessage(
                poMessages[msgid],
                potMessages[msgid]
            );
            updated[msgid].comments = potMessages[msgid].comments;
        }
    }
    return updated;
}

function updateTranslations(
    pot: Translations,
    po: Translations,
    pluralsNum: number
): Translations {
    const updated: Translations = {};
    for (const ctx of Object.keys(pot)) {
        updated[ctx] = updateMessages(
            pot[ctx] || {},
            po[ctx] || {},
            pluralsNum
        );
    }
    return updated;
}

export function updatePo(pot: PoData, po: PoData): PoData {
    const pluralsNum = getPluralFormsNumber(po.headers["plural-forms"]);
    return {
        headers: po.headers,
        translations: updateTranslations(
            pot.translations,
            po.translations,
            pluralsNum
        ),
        charset: po.charset
    };
}
