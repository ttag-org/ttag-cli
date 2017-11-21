import * as yargs from "yargs";
import extract from "./commands/extract";
import check from "./commands/check";
import merge from "./commands/merge";

yargs
    .usage("$0 <cmd> [args]")
    .command(
        "extract [output|locale] <src...>",
        "will extract translations to .pot file",
        {
            output: {
                alias: "o",
                default: "translations.pot",
                description: "result file with translations (.pot)"
            },
            locale: {
                alias: "l",
                default: "en",
                description: "sets default locale (ISO format)"
            }
        },
        argv => {
            extract(argv.output, argv.src, argv.locale);
        }
    )
    .command(
        "check [locale] <pofile> <src...>",
        "will check if all translations are present in .po file",
        {
            locale: {
                alias: "l",
                default: "en",
                description: "sets default locale (ISO format)"
            }
        },
        argv => {
            check(argv.pofile, argv.src, argv.locale);
        }
    )
    .command(
        "check [locale] <pofile> <src...>",
        "will check if all translations are present in .po file",
        {
            locale: {
                alias: "l",
                default: "en",
                description: "sets default locale (ISO format)"
            }
        },
        argv => {
            check(argv.pofile, argv.src, argv.locale);
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
    .command("*", "", {}, argv => {
        console.log(`command "${argv._[0]}" is not found.`);
        console.log("Use 'c-3po --help' to see available commands");
    })
    .help().argv;
