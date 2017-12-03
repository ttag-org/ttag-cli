import { updatePo } from "../../src/lib/update";
import { PoData } from "../../src/lib/parser";

test("updatePo. Should add new message", () => {
    const pot: PoData = {
        headers: {
            "plural-forms": "nplurals=2; plural=(n!=1);\n"
        },
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
        headers: {
            "plural-forms": "nplurals=2; plural=(n!=1);\n"
        },
        translations: {
            "": {}
        }
    };

    const resultPo = updatePo(pot, po);
    expect(resultPo.translations[""]).toHaveProperty("test");
});

test("updatePo. Should update existing", () => {
    const pot: PoData = {
        headers: {
            "plural-forms": "nplurals=2; plural=(n!=1);\n"
        },
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
        headers: {
            "plural-forms": "nplurals=2; plural=(n!=1);\n"
        },
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
        headers: {
            "plural-forms": "nplurals=2; plural=(n!=1);\n"
        },
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
        headers: {
            "plural-forms": "nplurals=2; plural=(n!=1);\n"
        },
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

test("updatePo. Should not overwrite headers", () => {
    const pot: PoData = {
        headers: {
            "plural-forms": "nplurals=2; plural=(n!=1);\n"
        },
        translations: {
            "": {
                "": {
                    msgid: "",
                    msgstr: ["header_pot"]
                },
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
        headers: {
            "plural-forms": "nplurals=2; plural=(n!=1);\n"
        },
        translations: {
            "": {
                "": {
                    msgid: "",
                    msgstr: ["header_po"]
                },
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
    expect(resultPo.translations[""][""].msgstr).toEqual(["header_po"]);
});

test("updatePo. Should use appropriate number of plural forms", () => {
    const pot: PoData = {
        headers: {
            "plural-forms": "nplurals=2; plural=(n!=1);\n"
        },
        translations: {
            "": {
                banana: {
                    msgid: "banana",
                    msgid_plural: "bananas",
                    msgstr: ["", ""]
                }
            }
        }
    };

    const po: PoData = {
        headers: {
            "plural-forms":
                "nplurals = 3; plural = (n % 10 === 1 && n % 100 !== 11 ? 0 : " +
                "n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);"
        },
        translations: {
            "": {}
        }
    };

    const resultPo = updatePo(pot, po);
    expect(resultPo.translations[""]["banana"].msgstr).toEqual(["", "", ""]);
});
