import { PoData, Messages, Translations } from "./parser";
import { mergeMessage } from "./merge";

/* Merge two message maps together */
function updateMessages(potMessages: Messages, poMessages: Messages): Messages {
    const merged: Messages = { ...poMessages };
    for (const msgid of Object.keys(potMessages)) {
        if (!poMessages[msgid]) {
            merged[msgid] = potMessages[msgid];
        } else {
            merged[msgid] = mergeMessage(poMessages[msgid], potMessages[msgid]);
            merged[msgid].comments = potMessages[msgid].comments;
        }
    }
    return merged;
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
