import { TtagOpts } from "../types";
import * as yargs from "yargs";

const OPTS: { [k: string]: string } = {
    discover: `string[]
Will discover ttag functions without explicit import.
Example:
ttag --discover=_ uk.po index.js

Will discover strings from all _ functions.`
};

function hasOverrides(argv: yargs.Arguments): boolean {
    const pluginOpts = Object.keys(OPTS);
    const keySet = new Set(Object.keys(argv));
    return Boolean(pluginOpts.find(p => keySet.has(p)));
}

function parseDiscover(opt: string | string[]): string[] {
    return Array.isArray(opt) ? opt : [opt];
}

export function parseTtagPluginOpts(
    argv: yargs.Arguments
): TtagOpts | undefined {
    if (!hasOverrides(argv)) return undefined;
    const pluginOpts = Object.keys(OPTS);
    const extendedOpts: any = {};
    pluginOpts.forEach(opt => {
        if (!argv[opt]) return;
        if (opt === "discover") {
            extendedOpts[opt] = parseDiscover(argv[opt]);
        } else {
            extendedOpts[opt] = argv[opt];
        }
    });
    return <TtagOpts>extendedOpts;
}

export function getTtagOptsForYargs() {
    const result: any = {};
    Object.keys(OPTS).forEach(opt => {
        result[opt] = { description: OPTS[opt] };
    });
    return result;
}
