import * as ora from "ora";
import * as fs from "fs";
import * as c3poTypes from "../types";
import { extractAll } from "../lib/extract";

async function extract(output: string, paths: string[], lang: string = "en") {
    const progress: c3poTypes.Progress = ora(
        `[c-3po] extracting translations to ${output} ...`
    );
    progress.start();
    const result = await extractAll(paths, lang, progress);
    fs.writeFileSync(output, result);
    progress.succeed(`[c-3po] translations extracted to ${output}`);
}

export default extract;
