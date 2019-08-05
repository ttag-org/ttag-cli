import * as ora from "ora";
import * as ttagTypes from "../types";
import * as fs from "fs";
import { extractAll } from "../lib/extract";
import { updatePo } from "../lib/update";
import { parse } from "../lib/parser";
import { serialize } from "../lib/serializer";

async function update(
    pofile: string,
    src: string[],
    lang: string,
    ttagOverrideOpts?: ttagTypes.TtagOpts
) {
    const progress: ttagTypes.Progress = ora(`[ttag] updating ${pofile} ...`);
    progress.start();
    try {
        const pot = parse(
            await extractAll(src, lang, progress, ttagOverrideOpts)
        );
        const po = parse(fs.readFileSync(pofile).toString());
        console.log(pot, po);
        const resultPo = updatePo(pot, po);
        fs.writeFileSync(pofile, serialize(resultPo));
        progress.succeed(`${pofile} updated`);
    } catch (err) {
        progress.fail(`Failed to update. ${err.message}. ${err.stack}`);
        process.exit(1);
    }
}

export default update;
