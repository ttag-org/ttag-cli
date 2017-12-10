import * as yargs from "yargs";
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
import "./declarations";

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
        "update [lang] <pofile> <src..>",
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
            }
        },
        argv => {
            update(argv.pofile, argv.src, argv.lang);
        }
    )
    .command(
        "replace <pofile> <out> <path>",
        "will replace all strings with translations from the .po file",
        {},
        argv => {
            replace(argv.pofile, argv.out, argv.path);
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
    .command("*", "", {}, argv => {
        console.log(`command "${argv._[0]}" is not found.`);
        console.log("Use 'c-3po --help' to see available commands");
    })
    .help().argv;
