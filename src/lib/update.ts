import { PoData, Messages, Translations } from "./parser";
import { mergeMessage } from "./merge";

function updateMessages(potMessages: Messages, poMessages: Messages): Messages {
    const updated: Messages = {};
    for (const msgid of Object.keys(poMessages)) {
        if (potMessages[msgid] !== undefined) {
            updated[msgid] = poMessages[msgid];
        }
    }

    for (const msgid of Object.keys(potMessages)) {
        if (!poMessages[msgid]) {
            updated[msgid] = potMessages[msgid];
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

function updateTranslations(pot: Translations, po: Translations): Translations {
    const updated: Translations = {};
    for (const ctx of Object.keys(pot)) {
        updated[ctx] = updateMessages(pot[ctx], po[ctx]);
    }
    return updated;
}

export function updatePo(pot: PoData, po: PoData): PoData {
    for (const ctx of Object.keys(pot.translations)) {
        if (!po.translations[ctx]) {
            po.translations[ctx] = pot.translations[ctx];
        }
    }
    return {
        headers: po.headers,
        translations: updateTranslations(pot.translations, po.translations)
    };
}
