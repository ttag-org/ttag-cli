import { parse } from "../lib/parser";
import { iterateTranslations } from "../lib/utils";
import * as fs from "fs";

export default function po2js(path: string, pretty: boolean, nostrip: boolean) {
    const poData = parse(fs.readFileSync(path).toString());
    const messages = iterateTranslations(poData.translations);
    if (!nostrip) {
        const header = messages.next().value;
        delete header.comments;
        for (const msg of messages) {
            delete msg.comments;
        }
    }
    process.stdout.write(JSON.stringify(poData, null, pretty ? 2 : 0));
}
