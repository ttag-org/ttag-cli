import * as ora from "ora";
import * as fs from "fs";
import * as c3poTypes from "../types";
import { extractAll } from "../lib/extract";

async function extract(
    output: string,
    paths: string[],
    lang: string = "en",
    ttagOverrideOpts?: c3poTypes.TtagOpts,
    ttagRcOpts?: c3poTypes.TtagRc
) {
    const progress: c3poTypes.Progress = ora(
        `[ttag] extracting translations to ${output} ...`
    );
    progress.start();
    const result = await extractAll(
        paths,
        lang,
        progress,
        ttagOverrideOpts,
        ttagRcOpts
    );
    fs.writeFileSync(output, result);
    progress.succeed(`[ttag] translations extracted to ${output}`);
}

export default extract;
