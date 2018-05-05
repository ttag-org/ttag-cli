import * as ora from "ora";
import * as c3poTypes from "../types";
import * as fs from "fs";
import { extractAll } from "../lib/extract";
import { updatePo } from "../lib/update";
import { parse } from "../lib/parser";
import { serialize } from "../lib/serializer";

async function update(pofile: string, src: string[], lang: string) {
    const progress: c3poTypes.Progress = ora(`[ttag] updating ${pofile} ...`);
    progress.start();
    const pot = parse(await extractAll(src, lang, progress));
    const po = parse(fs.readFileSync(pofile).toString());
    const resultPo = updatePo(pot, po);
    fs.writeFileSync(pofile, serialize(resultPo));
    progress.succeed(`${pofile} updated`);
}

export default update;
