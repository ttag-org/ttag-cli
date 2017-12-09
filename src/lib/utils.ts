const pluralNumRegex = /^nplurals ?= ?(\d);/;
export function getPluralFormsNumber(pluralFormsHeader: string): number {
    const match = pluralNumRegex.exec(pluralFormsHeader);
    if (match === null) {
        throw new Error(
            `Failed to parse plural-form header ${pluralFormsHeader}`
        );
    }
    let pluralFnCount = match[1];
    if (pluralFnCount[pluralFnCount.length - 1] === ";") {
        pluralFnCount = pluralFnCount.slice(0, -1);
    }
    return parseInt(pluralFnCount, 10);
}
