import * as ora from "ora";
import * as fs from "fs";
import * as c3poTypes from "../types";
import * as pluralForms from "plural-forms";

function generatePoFile(language: string): string {
    const pluralFormsHeader = pluralForms.getPluralFormsHeader(language);
    return `msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\\n"
"Plural-Forms: ${pluralFormsHeader};\\n"
"Language: ${language}\\n"
"MIME-Version: 1.0\\n"
"Content-Transfer-Encoding: 8bit\\n"
`;
}

export default function init(language: string, pofile: string) {
    const progress: c3poTypes.Progress = ora();
    progress.start();
    const poContent = generatePoFile(language);
    fs.writeFileSync(pofile, poContent);
    progress.succeed(`[c-3po] ${pofile} is created`);
}
