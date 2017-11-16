import * as yargs from "yargs";
import extract from "./commands/extract";

yargs
    .usage("$0 <cmd> [args]")
    .command(
        "extract [output] <src...>",
        "will extract translations to .pot file",
        {
            output: {
                alias: "o",
                default: "translations.pot",
                description: "result file with translations (.pot)"
            }
        },
        argv => {
            extract(argv.output, argv.src);
        }
    )
    .help().argv;
