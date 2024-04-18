import { parse, PoData, Message, Messages, Translations } from "../lib/parser";
import { serialize } from "../lib/serializer";
import * as fs from "fs";

enum RuleType {
    Must,
    MustNot
}

interface PoFilterParams {
    fuzzy?: boolean;
    translated?: boolean;
    referenceRe?: RegExp;
}

type TestFunction = (msg: Message) => boolean;

function FuzzyTest(msg: Message): boolean {
    if (msg.comments == undefined) {
        return false;
    }
    return Boolean(msg.comments.flag && msg.comments.flag.includes("fuzzy"));
}

function TranslatedTest(msg: Message): boolean {
    return msg.msgstr.filter(s => s.length > 0).length == msg.msgstr.length;
}

function ReferenceReTest(msg: Message, re: RegExp): boolean {
    return (
        msg.comments != undefined &&
        msg.comments.reference != undefined &&
        re.test(msg.comments.reference)
    );
}

type FilterRules = Array<[TestFunction, RuleType]>;

class PoFilter {
    fuzzy?: boolean;
    translated?: boolean;
    referenceRe?: RegExp;

    constructor({ fuzzy, translated, referenceRe }: PoFilterParams) {
        this.fuzzy = fuzzy;
        this.translated = translated;
        this.referenceRe = referenceRe;
    }

    /* set fuzzy flag */
    withFuzzy() {
        return new PoFilter(Object.assign({}, this, { fuzzy: true }));
    }

    /* set no fuzzy flag */
    withoutFuzzy() {
        return new PoFilter(Object.assign({}, this, { fuzzy: false }));
    }

    /* set translation flag */
    withTranslation() {
        return new PoFilter(Object.assign({}, this, { translated: true }));
    }

    /* set no translation flag */
    withoutTranslation() {
        return new PoFilter(Object.assign({}, this, { translated: false }));
    }

    withReferenceRe(referenceRe: RegExp) {
        return new PoFilter(
            Object.assign({}, this, { referenceRe: referenceRe })
        );
    }

    /* build rule chain according to state and apply to translations */
    apply(translations: Translations): Translations {
        const rules = <FilterRules>[];
        if (this.fuzzy == true) {
            rules.push([FuzzyTest, RuleType.Must]);
        }
        if (this.fuzzy == false) {
            rules.push([FuzzyTest, RuleType.MustNot]);
        }
        if (this.translated == true) {
            rules.push([TranslatedTest, RuleType.Must]);
        }
        if (this.translated == false) {
            rules.push([TranslatedTest, RuleType.MustNot]);
        }
        const reg = this.referenceRe;
        if (reg !== undefined) {
            rules.push([
                (m: Message) => ReferenceReTest(m, reg),
                RuleType.Must
            ]);
        }
        const newTranslations = <Translations>{};
        for (let [ctxt, messages] of filterTranslationsStream(
            translations,
            rules
        )) {
            newTranslations[ctxt] = messages;
        }
        return newTranslations;
    }
}

/* Test rule according to type */
function testRule(test: TestFunction, rule: RuleType, msg: Message): boolean {
    switch (rule) {
        case RuleType.Must: {
            return test(msg);
        }
        case RuleType.MustNot: {
            return !test(msg);
        }
    }
}

/* Test each message with tester according to rule */
function* filterMessagesStream(
    messages: Messages,
    rules: FilterRules
): IterableIterator<Message> {
    for (const msgid of Object.keys(messages)) {
        const msg = messages[msgid];
        if (msgid == "") {
            // skip empty message id
            yield msg;
        }

        let allPassed = true;
        for (let [test, rule] of rules) {
            if (!testRule(test, rule, msg)) {
                allPassed = false;
                break;
            }
        }
        if (allPassed) {
            yield msg;
        }
    }
}

/* Run all messages by context through filter stream */
function* filterTranslationsStream(
    translations: Translations,
    rules: FilterRules
): IterableIterator<[string, Messages]> {
    for (const contextKey of Object.keys(translations)) {
        const context = translations[contextKey];
        const newContext = <Messages>{};
        for (const msg of filterMessagesStream(context, rules)) {
            newContext[msg.msgid] = msg;
        }
        if (Object.keys(newContext).length > 0) {
            yield [contextKey, newContext];
        }
    }
}

export default function filter(
    path: string,
    fuzzy: boolean,
    noFuzzy: boolean,
    translated: boolean,
    notTranslated: boolean,
    referenceRe: string
) {
    if (fuzzy && noFuzzy) {
        throw "Choose one of fuzzy or no-fuzzy args";
    }
    if (translated && notTranslated) {
        throw "Choose one of translated or not translated args";
    }
    if (referenceRe) {
        try {
            new RegExp(referenceRe);
        } catch {
            throw "Invalid regular expression for reference";
        }
    }
    let filter = new PoFilter({});
    if (fuzzy) {
        filter = filter.withFuzzy();
    }
    if (noFuzzy) {
        filter = filter.withoutFuzzy();
    }
    if (translated) {
        filter = filter.withTranslation();
    }
    if (notTranslated) {
        filter = filter.withoutTranslation();
    }
    if (referenceRe) {
        filter = filter.withReferenceRe(new RegExp(referenceRe));
    }

    const poData = parse(fs.readFileSync(path).toString());

    const filteredPoData = <PoData>{
        headers: poData.headers,
        translations: filter.apply(poData.translations)
    };
    process.stdout.write(serialize(filteredPoData));
}
