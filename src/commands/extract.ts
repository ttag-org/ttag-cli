import "../declarations";
import * as ora from "ora";
import * as c3poTypes from "../types";
import { extractAll } from "../lib/extract";

async function extract(output: string, paths: string[], locale: string = "en") {
    const progress: c3poTypes.Progress = ora(
        `[c-3po] extracting translations to ${output} ...`
    );
    progress.start();
    await extractAll(paths, output, locale, progress);
    progress.succeed(`[c-3po] translations extracted to ${output}`);
}

export default extract;
