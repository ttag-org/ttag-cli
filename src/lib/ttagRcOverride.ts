import { TtagRc } from "../types";
import * as fs from "fs";

type RC_TMPL = {
    extractor?: {
        ignoreFiles?: string;
        paths?: string;
    };
};

function readTtagRC(): TtagRc {
    const opts: any = {};
    try {
        const jsonRaw = fs.readFileSync(".ttagrc", "utf8");
        const parsedJSON: RC_TMPL = JSON.parse(jsonRaw);
        if ("extractor" in parsedJSON) {
            opts.extractor = parseExtractor(parsedJSON.extractor);
        }
    } catch (err) {
        console.warn(err);
    }
    return <TtagRc>opts;
}

function parseExtractor(extractorData: any) {
    const opts: any = {};
    if ("paths" in extractorData) {
        opts.paths = parseStringList(extractorData.paths);
    }
    if ("ignoreFiles" in extractorData) {
        opts.ignoreFiles = parseStringList(extractorData.ignoreFiles);
    }
    return opts;
}

function parseStringList(value: string): string[] {
    return value.split(",").map(x => x.trim());
}

export function parseTtagRcOpts(): TtagRc | undefined {
    const opts = readTtagRC();
    if (!Object.keys(opts)) return undefined;
    return opts;
}
