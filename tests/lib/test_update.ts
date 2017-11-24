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
            "": {}
        }
    };

    const resultPo = updatePo(pot, po);
    expect(resultPo.translations[""]).toHaveProperty("test");
});

test("updatePo. Should update existing", () => {
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
    expect(Object.keys(resultPo.translations[""]).length).toBe(1);
    expect(resultPo.translations[""]).toHaveProperty("test");
    expect(resultPo.translations[""]["test"].msgstr).toEqual(["test trans"]);
    expect(resultPo.translations[""]["test"].comments).toEqual({
        reference: "path.js:2"
    });
});

test("updatePo. Should remove obsolete messages", () => {
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
                },
                old: {
                    msgid: "old",
                    comments: {
                        reference: "path.js:10"
                    },
                    msgstr: ["old trans"]
                }
            }
        }
    };

    const resultPo = updatePo(pot, po);
    expect(Object.keys(resultPo.translations[""]).length).toBe(1);
    expect(resultPo.translations[""]).toHaveProperty("test");
    expect(resultPo.translations[""]).not.toHaveProperty("old");
});
