import { mergePo } from "../../src/lib/merge";
import { PoData } from "../../src/lib/parser";

test("mergePo. Should merge with default config", () => {
    const poData1: PoData = {
        headers: {
            "plural-forms": "nplurals=2; plural=(n!=1);\n"
        },
        translations: {
            "": {
                test: {
                    msgid: "test",
                    comments: {},
                    msgstr: ["test trans"]
                }
            }
        }
    };

    const poData2: PoData = {
        headers: {
            "plural-forms": "nplurals=2; plural=(n!=1);\n"
        },
        translations: {
            "": {
                test2: {
                    msgid: "test2",
                    comments: {},
                    msgstr: ["test2 trans"]
                }
            }
        }
    };

    const resultPo = mergePo(poData1, poData2);
    expect(resultPo.translations[""]).toHaveProperty("test");
    expect(resultPo.translations[""]).toHaveProperty("test2");
});
