import { TtagOpts } from "../types";
import * as yargs from "yargs";

const ttagDoc = "https://ttag.js.org/docs/plugin-api.html";

function doc(fragment: string) {
    return `${ttagDoc}${fragment}`;
}

const discoverDescription = `string overrides babel-plugi-ttag setting - ${doc(
    "#configdiscover"
)}. Can be used to discover ttag functions without explicit import.\
    Only known ttag functions can be used as params (t, jt, ngettext, gettext, _)`;

const numberedExpressionsDescr = `boolean overrides babel-plugin-ttag setting -  ${doc(
    "#confignumberedexpressions"
)}. Refer to the doc for the details.`;

const extractLocationDescr = `string - 'full' | 'file' | 'never' - ${doc(
    "#configextractlocation"
)}. Is used to format location comments in the .po file. `;

const sortByMsgidDescr = `boolean - The resulting output will be sorted alphabetically. ${doc(
    "#configsortbymsgid"
)}`;

const OPTS: { [k: string]: { description: string; boolean?: boolean } } = {
    discover: { description: discoverDescription },
    numberedExpressions: { description: numberedExpressionsDescr },
    extractLocation: { description: extractLocationDescr },
    sortByMsgid: { description: sortByMsgidDescr, boolean: true }
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
        } else if (opt === "extractLocation") {
            extendedOpts["extract"] = { location: argv[opt] };
        } else if (opt === "sortByMsgid") {
            extendedOpts.sortByMsgid = true;
        } else {
            extendedOpts[opt] = argv[opt];
        }
    });
    return <TtagOpts>extendedOpts;
}

/*
Will override opts1 with opts2
*/
export function mergeOpts(opts1: TtagOpts, opts2: TtagOpts): TtagOpts {
    const newOpts: TtagOpts = { ...opts1 };
    if (opts2.hasOwnProperty("discover")) {
        newOpts.discover = opts2.discover;
    }
    if (opts2.hasOwnProperty("numberedExpressions")) {
        newOpts.numberedExpressions = opts2.numberedExpressions;
    }
    if (opts2.extract && opts2.extract.location) {
        if (newOpts.extract) {
            newOpts.extract.location = opts2.extract.location;
        } else {
            newOpts.extract = opts2.extract;
        }
    }
    return newOpts;
}

export function getTtagOptsForYargs() {
    return OPTS;
}
