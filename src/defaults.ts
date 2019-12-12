// presets
import * as presetEnv from "@babel/preset-env";
import * as presetReact from "@babel/preset-react";
import * as presetTS from "@babel/preset-typescript";
import * as presetFlow from "@babel/preset-flow";
import { TransformOptions, ConfigItem } from "@babel/core";
import * as ttagTypes from "./types";

// plugins
import * as classPropPlugin from "@babel/plugin-proposal-class-properties";
import * as restSpreadPlugin from "@babel/plugin-proposal-object-rest-spread";
import * as exportDefaultFromPlugin from "@babel/plugin-proposal-export-default-from";
import * as babelTtagPlugin from "babel-plugin-ttag";
import * as babelDynamicImportPlugin from "@babel/plugin-syntax-dynamic-import";
import * as babelPluginDecorators from "@babel/plugin-proposal-decorators";
import * as optionalChaningPlugin from "@babel/plugin-proposal-optional-chaining";
import * as nullishCoalescingOperatorPlugin from "@babel/plugin-proposal-nullish-coalescing-operator";

export const defaultPlugins: ConfigItem[] = [
    [babelPluginDecorators, { legacy: true }],
    [classPropPlugin, { loose: true }],
    restSpreadPlugin,
    exportDefaultFromPlugin,
    babelDynamicImportPlugin,
    optionalChaningPlugin,
    nullishCoalescingOperatorPlugin
];

export const defaultPresets: ConfigItem[] = [
    presetTS,
    presetFlow,
    presetEnv,
    presetReact
];

export function makeBabelConf(ttagOpts: ttagTypes.TtagOpts): TransformOptions {
    return {
        presets: [...defaultPresets],
        plugins: [...defaultPlugins, [babelTtagPlugin, ttagOpts]]
    };
}
