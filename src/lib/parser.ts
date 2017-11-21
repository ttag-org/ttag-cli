import { po } from "gettext-parser";
import "../declarations";

type Message = {
    msgid: string;
    comments: object;
    msgstr: string[];
};

type Messages = {
    [key: string]: Message;
};

type Translations = {
    [key: string]: Messages;
};

export type PoData = {
    headers: Object;
    translations: Translations;
};

export function parse(str: string): PoData {
    return po.parse(str);
}
