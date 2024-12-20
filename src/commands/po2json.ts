import * as ora from "ora";
import * as ttagTypes from "../types";
import { parse, PoDataCompact, PoData } from "../lib/parser";
import { iterateTranslations, convert2Compact } from "../lib/utils";
import { checkDuplicateKeys } from "../lib/checkDuplicateKeys";
import * as fs from "fs";

export default function po2json(
    path: string,
    pretty: boolean,
    nostrip: boolean,
    format: "compact" | "verbose"
) {
    const progress: ttagTypes.Progress = ora(
        `[ttag] po2json translation from ${path} ...`
    );
    let poData: PoData | PoDataCompact = parse(
        fs.readFileSync(path).toString()
    );
    const errMessage = checkDuplicateKeys(poData);

    if (errMessage) {
        progress.fail(errMessage);
        process.exit(1);
    }
    const messages = iterateTranslations(poData.translations);
    if (!nostrip) {
        const header = messages.next().value;
        delete header.comments;
        for (const msg of messages) {
            delete msg.comments;
        }
    }
    if (format === "compact") {
        poData = convert2Compact(poData);
    }
    process.stdout.write(JSON.stringify(poData, null, pretty ? 2 : 0));
}
