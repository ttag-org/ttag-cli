const isoCodes =
    "http://docs.translatehouse.org/projects/localization-guide/en/latest/l10n/pluralforms.html";

export function langValidationMsg(language: string): string {
    return `Unknown lang code "${
        language
    }".\nSee all available lang codes here - ${isoCodes}`;
}
