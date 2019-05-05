import { po } from "gettext-parser";
import "../declarations";

export interface Comments {
    reference?: string;
    flag?: string;
    extracted?: string;
    previous?: string;
    translator?: string;
}

export type Message = {
    msgctxt?: string;
    msgid: string;
    msgid_plural?: string;
    comments?: Comments;
    msgstr: string[];
};

export type Messages = {
    [key: string]: Message;
};

export type Translations = {
    [key: string]: Messages;
};

export type Headers = {
    language?: string;
    "content-type"?: string;
    "plural-forms": string;
};

export type PoData = {
    headers: Headers;
    translations: Translations;
    charset?: string;
};

export type PoDataCompact = {
    headers: { "plural-forms": string };
    contexts: { [key: string]: { [key: string]: string[] } };
};

export function parse(str: string): PoData {
    return po.parse(str);
}
