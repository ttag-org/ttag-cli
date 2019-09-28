import * as yargs from "yargs";
import { Options } from "yargs";
import extract from "./commands/extract";
import check from "./commands/check";
import merge from "./commands/merge";
import init from "./commands/init";
import update from "./commands/update";
import translate from "./commands/translate";
import filter from "./commands/filter";
import stats from "./commands/stats";
import replace from "./commands/replace";
import color from "./commands/color";
import pseudo from "./commands/pseudo";
import spell from "./commands/spell";
import validate from "./commands/validate";
import web from "./commands/web";
import po2js from "./commands/po2json";
import {
    getTtagOptsForYargs,
    parseTtagPluginOpts
} from "./lib/ttagPluginOverride";

import "./declarations";

declare module "yargs" {
    interface Argv {
        /* we need this to be able to make "hidden" commands: https://github.com/yargs/yargs/pull/190 */
        command(
            command: string | string[],
            description: string | boolean,
            builder: { [optionName: string]: Options },
            handler: (args: Arguments) => void
        ): Argv;
    }

    interface Command {
        original: string;
        description: string;
        handler: Function;
        builder: { [key: string]: Options };
    }

    interface CommandInstance {
        getCommands: () => string[];
        getCommandHandlers: () => { [key: string]: Command };
    }

    interface UsageInstance {
        example: (cmd: string, desc: string) => void;
    }

    interface Argv {
        getCommandInstance: () => CommandInstance;
        getUsageInstance: () => UsageInstance;
    }
}

yargs.usage("$0 <cmd> [args]");
/* Monkey patch example func of usage to store examples locally */
/* TODO: contribute a patch to make examples available through usage instance */
const usage = yargs.getUsageInstance();
const exampleMap: Map<string, string> = new Map();

const originalExampleFunc = usage.example;

usage.example = (cmd: string, desc: string) => {
    originalExampleFunc(cmd, desc);
    exampleMap.set(cmd, desc);
};

yargs
    .command(
        "extract [output|lang] <src...>",
        "will extract translations to .pot file",
        {
            output: {
                alias: "o",
                default: "translations.pot",
                description: "result file with translations (.pot)"
            },
            lang: {
                alias: "l",
                default: "en",
                description: "sets default lang (ISO format)"
            },
            ...getTtagOptsForYargs()
        },
        argv => {
            extract(
                argv.output,
                argv.src,
                argv.lang,
                parseTtagPluginOpts(argv)
            );
        }
    )
    .command(
        "check [lang] <pofile> <src...>",
        "will check if all translations are present in .po file",
        {
            lang: {
                alias: "l",
                default: "en",
                description: "sets default lang (ISO format)"
            },
            ...getTtagOptsForYargs()
        },
        argv => {
            check(argv.pofile, argv.src, argv.lang, parseTtagPluginOpts(argv));
        }
    )
    .command(
        "merge <path...>",
        "will merge two or more po(t) files together using first non-empty msgstr and header from left-most file",
        {},
        argv => {
            merge(argv.path);
        }
    )
    .command(
        "translate <path> [args]",
        "will open interactive prompt to translate all msgids with empty msgstr in cli",
        {
            output: {
                alias: "o",
                default: "translated.po",
                description: "result file with translations (.po)"
            }
        },
        argv => {
            translate(argv.path, argv.output);
        }
    )
    .command(
        "stats <path>",
        "will display various pofile statistics(encoding, plurals, translated, fuzzyness)",
        {},
        argv => {
            stats(argv.path);
        }
    )
    .command(
        "filter <path> [args]",
        "will filter pofile by entry attributes(fuzzy, obsolete, (un)translated)",
        {
            fuzzy: {
                alias: "f",
                description: "result file with fuzzy messages (.po)",
                boolean: true,
                default: false
            },
            "no-fuzzy": {
                alias: "nf",
                description: "result file without fuzzy messages (.po)",
                boolean: true,
                default: false
            },
            translated: {
                alias: "t",
                description: "result file with translations (.po)",
                boolean: true,
                default: false
            },
            "not-translated": {
                alias: "nt",
                description: "result file without translations (.po)",
                boolean: true,
                default: false
            },
            reference: {
                alias: "r",
                description: "a regexp to match references against",
                default: ""
            }
        },
        argv => {
            filter(
                argv.path,
                argv.fuzzy,
                argv["no-fuzzy"],
                argv.translated,
                argv["not-translated"],
                argv.reference
            );
        }
    )
    .command(
        "init <lang> <filename>",
        "will create an empty .po file with all necessary headers for the locale",
        {
            lang: {
                description: "sets default locale (ISO format)",
                default: "en"
            },
            filename: {
                description: "path to the .po file"
            }
        },
        argv => {
            init(argv.lang, argv.filename);
        }
    )
    .command(
        "update [opts] <pofile> <src..>",
        "will update existing po file. Add/remove new translations",
        {
            lang: {
                description: "sets default locale (ISO format)",
                default: "en"
            },
            pofile: {
                description: "path to .po file with translations"
            },
            src: {
                description: "path to source files/directories"
            },
            ...getTtagOptsForYargs()
        },
        argv => {
            update(argv.pofile, argv.src, argv.lang, parseTtagPluginOpts(argv));
        }
    )
    .command(
        "replace [options] <pofile> <out> <path>",
        "will replace all strings with translations from the .po file",
        { ...getTtagOptsForYargs() },
        argv => {
            replace(
                argv.pofile,
                argv.out,
                argv.path,
                parseTtagPluginOpts(argv)
            );
        }
    )
    .command(
        "color <pofile>",
        "will output po(t)file with pretty colors on, combine with | less -r",
        {},
        argv => {
            color(argv.pofile);
        }
    )
    .command(
        "pseudo <path> [args]",
        "will output a pseudo-localised translation",
        {
            output: {
                alias: "o",
                default: "pseudo.po",
                description: "result file with pseudo translations (.po)"
            }
        },
        argv => {
            pseudo(argv.path, argv.output);
        }
    )
    .command(
        "spell <pofile> [locale]",
        "will spellcheck po file messages with given locale, locale can be autodetected from pofile",
        {},
        argv => {
            spell(argv.pofile, argv.locale);
        }
    )
    .command(
        "validate <pofile>",
        "will validate js template strings (`${x}`) in messages and translations and against each other",
        {},
        argv => {
            validate(argv.pofile);
        }
    )
    .command("web <pofile>", "will open pofile in web editor", {}, argv => {
        web(argv.pofile);
    })
    .command(
        "po2json <pofile> [args]",
        "will parse and output po file as loadable JSON",
        {
            pretty: {
                alias: "p",
                description: "pretty print js",
                boolean: true,
                default: false
            },
            nostrip: {
                alias: "n",
                description: "do not strip comments/headers",
                boolean: true,
                default: false
            },
            format: {
                description:
                    "sets the output JSON format (compact is much smaller)",
                choices: ["compact", "verbose"],
                default: "verbose"
            }
        },
        argv => {
            po2js(argv.pofile, argv.pretty, argv.nostrip, argv.format);
        }
    )
    .command("doc", false, {}, _ => {
        const isIgnored = (c: string) =>
            c == "doc" || c == "completion" || c == "$0";
        const printOption = (name: string, option: Options) => {
            return (
                `\t-${name}` +
                (option.alias ? `  --${option.alias}` : "") +
                `   ${option.description}  ` +
                (option.default !== undefined
                    ? `(default: ${option.default})`
                    : "") +
                `\n`
            );
        };

        for (const commandName of Object.keys(handlers)) {
            if (isIgnored(commandName)) {
                continue;
            }
            const command = handlers[commandName];
            const options = handlers[commandName].builder;
            const optionNames = Object.keys(options);
            process.stdout.write(
                `### \`${command.original}\`` +
                    `\n` +
                    `${command.description}` +
                    `\n` +
                    (optionNames.length > 0
                        ? `#### Arguments:\n` +
                          optionNames.reduce(
                              (body: string, optname: string) =>
                                  body + printOption(optname, options[optname]),
                              ""
                          )
                        : "") +
                    (exampleMap.has(commandName)
                        ? `#### Example:\n` + exampleMap.get(commandName)
                        : "") +
                    `\n\n`
            );
        }
    })
    .command("*", "", {}, argv => {
        const possibleCommand = commands.find(s => s.startsWith(argv._[0]));
        if (possibleCommand) {
            process.stdout.write(`Did you mean ${possibleCommand}? \n`);
        } else {
            process.stdout.write(`command "${argv._[0]}" is not found.\n`);
        }
        process.stdout.write("Use 'ttag --help' to see available commands? \n");
    })
    .completion("completion", (current: string, argv: any, done) => {
        if (commands.indexOf(argv._[0]) != -1) {
            // argv._[0] is a current first argument, if it is a command
            // we should return empty to allow filesystem autocompletion
            done([]);
        } else if (argv._.length == 0) {
            // Return full commands list when user did not input anything
            done(commands);
        } else {
            // Suggest command which starts with user input
            done(commands.filter(c => c.indexOf(current) == 0));
        }
    })
    .example(
        "filter",
        "\t ttag filter -nt small.po\n\n" + '\t msgid "test"\n' + '\t msgstr ""'
    );

const commandInstance = yargs.getCommandInstance();
export const handlers = commandInstance.getCommandHandlers();
const commands = commandInstance
    .getCommands()
    .filter(c => c != "$0" && c != "completion");

yargs.help().argv;
