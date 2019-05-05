import { convert2Compact } from "../../src/lib/utils";

describe("convert2Compact", () => {
    test("should strip headers except of plural-forms", () => {
        const verbose = {
            headers: {
                "plural-forms": "nplurals=2; plural=(n!=1);\n",
                other: "header"
            },
            translations: {
                "": {}
            }
        };
        const result = convert2Compact(verbose);
        expect(result.headers).not.toHaveProperty("other");
        expect(result.headers).toHaveProperty(
            "plural-forms",
            "nplurals=2; plural=(n!=1);\n"
        );
    });
    test("should omit the empty string translation", () => {
        const verbose = {
            headers: {
                "plural-forms": "nplurals=2; plural=(n!=1);\n",
                other: "header"
            },
            translations: {
                "": {
                    "": {
                        msgid: "",
                        msgstr: [
                            "Content-Type: text/plain; charset=UTF-8\nContent-Transfer-Encoding: 8bit\nProject-Id-Version: protonmail\nPlural-Forms: nplurals=2; plural=(n != 1);\nX-Generator: crowdin.com\nX-Crowdin-Project: protonmail\nX-Crowdin-Language: pt-BR\nX-Crowdin-File: ProtonMail Web Application.pot\nLast-Translator: PMtranslator\nLanguage-Team: Portuguese, Brazilian\nLanguage: pt_BR\nPO-Revision-Date: 2019-04-17 08:44\n"
                        ]
                    }
                }
            }
        };
        const result = convert2Compact(verbose);
        expect(result.contexts[""]).not.toHaveProperty("");
    });
    test("should transform poEntry", () => {
        const verbose = {
            headers: {
                "plural-forms": "nplurals=2; plural=(n!=1);\n",
                other: "header"
            },
            translations: {
                "": {
                    test: {
                        msgid: "test",
                        msgstr: ["test [translation]"]
                    }
                }
            }
        };
        const result = convert2Compact(verbose);
        expect(result.contexts[""]).toHaveProperty("test", [
            "test [translation]"
        ]);
    });
    test("should apply all contexts", () => {
        const verbose = {
            headers: {
                "plural-forms": "nplurals=2; plural=(n!=1);\n",
                other: "header"
            },
            translations: {
                "": {
                    test: {
                        msgid: "test",
                        msgstr: ["test [translation]"]
                    }
                },
                ctx: {
                    "ctx test": {
                        msgid: "ctx test",
                        msgstr: ["ctx test [translation]"]
                    }
                }
            }
        };
        const result = convert2Compact(verbose);
        expect(result.contexts[""]).toHaveProperty("test", [
            "test [translation]"
        ]);
        expect(result.contexts["ctx"]).toHaveProperty("ctx test", [
            "ctx test [translation]"
        ]);
    });
    test("should remove untranslated and fuzzy", () => {
        const verbose = {
            headers: {
                "plural-forms": "nplurals=2; plural=(n!=1);\n",
                other: "header"
            },
            translations: {
                "": {
                    untranslated: {
                        msgid: "test",
                        msgstr: []
                    },
                    fuzzy: {
                        msgid: "test",
                        msgstr: [],
                        comments: {
                            flag: "fuzzy"
                        }
                    },
                    test: {
                        msgid: "test",
                        msgstr: ["test [translation]"]
                    }
                }
            }
        };
        const result = convert2Compact(verbose);
        expect(result.contexts[""]).toHaveProperty("test");
        expect(result.contexts[""]).not.toHaveProperty("untranslated");
        expect(result.contexts[""]).not.toHaveProperty("fuzzy");
    });
});
