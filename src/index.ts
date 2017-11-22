import * as yargs from "yargs";
import extract from "./commands/extract";
import check from "./commands/check";
import merge from "./commands/merge";
import init from "./commands/init";
import translate from "./commands/translate";

yargs
    .usage("$0 <cmd> [args]")
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
            }
        },
        argv => {
            extract(argv.output, argv.src, argv.lang);
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
            }
        },
        argv => {
            check(argv.pofile, argv.src, argv.lang);
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
        "init <lang> <filename>",
        "will create an empty .po file with all necessary headers for the locale",
        {
            lang: {
                description: "sets default locale (ISO format)"
            },
            filename: {
                description: "path to the .po file"
            }
        },
        argv => {
            init(argv.lang, argv.filename);
        }
    )
    .command("*", "", {}, argv => {
        console.log(`command "${argv._[0]}" is not found.`);
        console.log("Use 'c-3po --help' to see available commands");
    })
    .help().argv;
