import { updatePo } from "../../src/lib/update";
import { PoData } from "../../src/lib/parser";

test("updatePo. Should add new message", () => {
    const pot: PoData = {
        headers: {},
        translations: {
            "": {
                test: {
                    msgid: "test",
                    comments: {},
                    msgstr: [""]
                }
            }
        }
    };

    const po: PoData = {
        headers: {},
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

    const resultPo = updatePo(pot, po);
    expect(resultPo.translations[""]).toHaveProperty("test");
    expect(resultPo.translations[""]).toHaveProperty("test2");
});

test("updatePo. Should skip if exist", () => {
    const pot: PoData = {
        headers: {},
        translations: {
            "": {
                test: {
                    msgid: "test",
                    comments: {
                        reference: "path.js:2"
                    },
                    msgstr: [""]
                }
            }
        }
    };

    const po: PoData = {
        headers: {},
        translations: {
            "": {
                test: {
                    msgid: "test",
                    comments: {
                        reference: "path.js:1"
                    },
                    msgstr: ["test trans"]
                }
            }
        }
    };

    const resultPo = updatePo(pot, po);
    expect(Object.keys(resultPo.translations).length).toBe(1);
    expect(resultPo.translations[""]).toHaveProperty("test");
    expect(resultPo.translations[""]["test"].msgstr).toEqual(["test trans"]);
    expect(resultPo.translations[""]["test"].comments).toEqual({
        reference: "path.js:2"
    });
});
