import { TtagOpts } from "../types";
import * as yargs from "yargs";

const ttagDoc = "https://ttag.js.org/docs/plugin-api.html";

function doc(fragment: string) {
    return `${ttagDoc}${fragment}`;
}

const discoverDescription = `string overrides babel-plugi-ttag setting - ${doc(
    "#configdiscover"
)}. Can be used to discover ttag functions without explicit import`;

const numberedExpressionsDescr = `boolean overrides babel-plugin-ttag setting -  ${doc(
    "#confignumberedexpressions"
)}. Refer to the doc for the details.`;

const OPTS: { [k: string]: string } = {
    discover: discoverDescription,
    numberedExpressions: numberedExpressionsDescr
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
        } else if (opt === "numberedExpressions") {
            extendedOpts[opt] = Boolean(argv[opt]);
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
