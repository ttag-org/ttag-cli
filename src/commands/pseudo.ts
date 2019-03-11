import * as fs from "fs";
//import { printMsg } from "../lib/print";
//import { iterateTranslations } from "../lib/utils";
//import { checkFormat } from "../lib/validation";
import { serialize } from "../lib/serializer";
import { parse, PoData, Translations } from "../lib/parser";

export default function pseudo(path: string) {
    const data = fs.readFileSync(path).toString();
    const poData = parse(data);
    //const messages = iterateTranslations(poData.translations);
    //messages.next(); // skip headers

    function transform(translations: Translations): Translations {
        return translations;
    }

    const localised = <PoData>{
        headers: poData.headers,
        translations: transform(poData.translations)
    };
    process.stdout.write(serialize(localised));
    return;

    /*
    for (const msg of messages) {
        let invalid = false;
        for (let i = 0; i < msg.msgstr.length; i++) {
            if (!msg.msgstr[i]) {
                continue;
            }
            const result = checkFormat(msg.msgid, msg.msgstr[0]);
            if (!result.valid) {
                invalid = true;
                const missing = result.missing.length
                    ? `missing ${result.missing.join(" and ")}`
                    : "";
                const redundant = result.redundant.length
                    ? `redundant ${result.redundant.join(" and ")}`
                    : "";
                const explanation = [missing, redundant].filter(s => !!s).join(" but ");
                msg.msgstr[i] += ` <--- ${explanation};`;
            }
            if (invalid) {
                //hasErrors = true;
                printMsg(msg);
                console.log("\n");
            }
        }
    }
*/
}
