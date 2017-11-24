import { PoData, Translations, Messages, Message, Comments } from "./parser";

/* merge two context maps together */
function mergeTranslations(
    leftContext: Translations,
    rightContext: Translations
): Translations {
    // Update messages known to the left side
    const merged: Translations = {};
    for (const contextKey of Object.keys(leftContext)) {
        if (!rightContext[contextKey]) {
            merged[contextKey] = leftContext[contextKey];
        } else {
            merged[contextKey] = mergeMessages(
                leftContext[contextKey],
                rightContext[contextKey]
            );
        }
    }
    // Append messages from the right side
    for (const contextKey of Object.keys(rightContext)) {
        if (!leftContext[contextKey]) {
            merged[contextKey] = rightContext[contextKey];
        }
    }
    return merged;
}
/* Merge two message maps together */
function mergeMessages(
    leftMessages: Messages,
    rightMessages: Messages
): Messages {
    const merged: Messages = {};
    // Update messages from left and merge with right
    for (const msgid of Object.keys(leftMessages)) {
        if (!rightMessages[msgid]) {
            merged[msgid] = leftMessages[msgid];
        } else {
            merged[msgid] = mergeMessage(
                leftMessages[msgid],
                rightMessages[msgid]
            );
        }
    }
    // Append messages from right
    for (const msgid of Object.keys(rightMessages)) {
        if (!leftMessages[msgid]) {
            merged[msgid] = rightMessages[msgid];
        }
    }
    return merged;
}

/* Merge two po(t)files together */
function mergeMessage(leftMessage: Message, rightMessage: Message): Message {
    if (leftMessage.msgid == "") {
        //gettext-parser library bug: header appears to be in message with id''
        return leftMessage;
    }
    const msgstr =
        leftMessage.msgstr.filter(s => !!s).length > 0
            ? leftMessage.msgstr
            : rightMessage.msgstr;
    return {
        msgid: leftMessage.msgid,
        comments: mergeComments(leftMessage.comments, rightMessage.comments),
        msgstr: msgstr,
        msgid_plural: leftMessage.msgid_plural
    };
}

/* Merge comments from two messages */
function mergeComments(
    leftComment: Comments | undefined,
    rightComment: Comments | undefined
): Comments | undefined {
    if (!leftComment) {
        return rightComment;
    }
    if (!rightComment) {
        return undefined;
    }
    if (!leftComment.reference) {
        return {
            reference: rightComment.reference
        };
    }
    if (!rightComment.reference) {
        return {
            reference: rightComment.reference
        };
    }
    const uniqueComments = new Set(
        leftComment.reference
            .split("\n")
            .concat(rightComment.reference.split("\n"))
    );
    const references = Array.from(uniqueComments.values()).sort();
    return {
        reference: references.join("\n")
    };
}

/* Merge two poData objects together */
export function mergePo(left: PoData, right: PoData): PoData {
    return {
        headers: left.headers,
        translations: mergeTranslations(left.translations, right.translations)
    };
}
