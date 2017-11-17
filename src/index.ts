import * as yargs from "yargs";
import extract from "./commands/extract";

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
    .help().argv;
