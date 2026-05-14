import { convert2Compact, resolvePaths } from "../../src/lib/utils";
import * as path from "path";

describe("convert2Compact", () => {
    test("should strip headers except of plural-forms and language", () => {
        const verbose = {
            headers: {
                "plural-forms": "nplurals=2; plural=(n!=1);\n",
                other: "header",
                language: "en"
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
        expect(result.headers).toHaveProperty("language", "en");
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

describe("resolvePaths", () => {
    test("should resolve file paths when non-glob sources are used", () => {
        const src1 = path.resolve(
            __dirname,
            "../fixtures/utilsTest/subfolder-1"
        );
        const src2 = path.resolve(
            __dirname,
            "../fixtures/utilsTest/subfolder-2"
        );

        const paths = resolvePaths([src1, src2]);
        expect(paths.sort()).toEqual([
            path.resolve(__dirname, "../fixtures/utilsTest/subfolder-1/a.ts"),
            path.resolve(__dirname, "../fixtures/utilsTest/subfolder-1/b.js"),
            path.resolve(__dirname, "../fixtures/utilsTest/subfolder-2/a.ts"),
            path.resolve(__dirname, "../fixtures/utilsTest/subfolder-2/b.js")
        ]);
    });

    test("should resolve file paths when non-glob sources and ignores are used", () => {
        const src1 = path.resolve(
            __dirname,
            "../fixtures/utilsTest/subfolder-1"
        );
        const src2 = path.resolve(
            __dirname,
            "../fixtures/utilsTest/subfolder-2"
        );
        const ignore1 = src1;

        const paths = resolvePaths([src1, src2], ignore1);
        expect(paths.sort()).toEqual([
            path.resolve(__dirname, "../fixtures/utilsTest/subfolder-2/a.ts"),
            path.resolve(__dirname, "../fixtures/utilsTest/subfolder-2/b.js")
        ]);
    });

    test("should resolve file paths when glob sources are used", () => {
        const src1 = path.resolve(
            __dirname,
            "../fixtures/utilsTest/subfolder-1/**"
        );
        const src2 = path.resolve(
            __dirname,
            "../fixtures/utilsTest/subfolder-2/**"
        );

        const paths = resolvePaths([src1, src2]);
        expect(paths.sort()).toEqual([
            path.resolve(__dirname, "../fixtures/utilsTest/subfolder-1/a.ts"),
            path.resolve(__dirname, "../fixtures/utilsTest/subfolder-1/b.js"),
            path.resolve(__dirname, "../fixtures/utilsTest/subfolder-2/a.ts"),
            path.resolve(__dirname, "../fixtures/utilsTest/subfolder-2/b.js")
        ]);
    });

    test("should resolve file paths when glob sources and ignores are used", () => {
        const src1 = path.resolve(
            __dirname,
            "../fixtures/utilsTest/subfolder-1/**"
        );

        const ignore1 = path.resolve(
            __dirname,
            "../fixtures/utilsTest/**/*.ts"
        );

        const paths = resolvePaths([src1], [ignore1]);
        expect(paths.sort()).toEqual([
            path.resolve(__dirname, "../fixtures/utilsTest/subfolder-1/b.js")
        ]);
    });

    test("should resolve file paths when mixin regular and glob paths in source and ignores", () => {
        const srcGlob1 = path.resolve(__dirname, "../fixtures/utilsTest/**"); // glob
        const srcGlob2 = path.resolve(
            __dirname,
            "../fixtures/utilsTest/subfolder-1/**" // glob
        );
        const srcRegular = path.resolve(
            __dirname,
            "../fixtures/utilsTest/subfolder-2/a.ts" // non-glob
        );

        const ignoreGlob = path.resolve(
            __dirname,
            "../fixtures/utilsTest/subfolder-1" // non-glob
        );
        const ignoreRegular = path.resolve(
            __dirname,
            "../fixtures/utilsTest/**/*.js" // glob
        );

        const paths = resolvePaths(
            [srcGlob1, srcGlob2, srcRegular],
            [ignoreRegular, ignoreGlob]
        );
        expect(paths.sort()).toEqual([
            path.resolve(__dirname, "../fixtures/utilsTest/root.ts"),
            path.resolve(__dirname, "../fixtures/utilsTest/subfolder-2/a.ts")
        ]);
    });
});
