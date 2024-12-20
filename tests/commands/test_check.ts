import * as path from "path";
import { execSync } from "child_process";

const poPath = path.resolve(__dirname, "../fixtures/checkTest/check.po");
const poPath2 = path.resolve(__dirname, "../fixtures/checkTest/same_key.po");

const checkPass = path.resolve(
    __dirname,
    "../fixtures/checkTest/check-trans-exist.js"
);
const checkNotPass = path.resolve(
    __dirname,
    "../fixtures/checkTest/check-trans-not-exist.js"
);
const checkInvalidFormat = path.resolve(
    __dirname,
    "../fixtures/checkTest/check-trans-invalid-format.js"
);

const checkInvalidFormatDiscover = path.resolve(
    __dirname,
    "../fixtures/checkTest/check-invalid-format-discover.js"
);

const checkSameKey = path.resolve(
    __dirname,
    "../fixtures/checkTest/check-same-key.js"
);

test("check when all string are translated", () => {
    const result = execSync(
        `ts-node src/index.ts check ${poPath} ${checkPass}`
    );
    expect(result.toString()).toMatchSnapshot();
});

test("check when some translation is missing", () => {
    try {
        execSync(`ts-node src/index.ts check ${poPath} ${checkNotPass}`);
        expect(false).toBe(true); // must fail anyway
    } catch (err) {
        expect(err.status).toBe(1);
        expect(err.stderr.toString()).toContain(
            "Translation 'test not test' is not found"
        );
        expect(err.stderr.toString()).toContain(
            "[ttag] has found 1 untranslated string(s)"
        );
    }
});

test("should ignore when some translation is missing", () => {
    try {
        execSync(
            `ts-node src/index.ts check  --skip=translation ${poPath} ${checkNotPass}`
        );
        expect(true).toBe(true); // Shouldn't fail
    } catch (err) {
        expect(err.status).not.toBe(1);
    }
});

test("validation for translations fromat", () => {
    try {
        execSync(`ts-node src/index.ts check ${poPath} ${checkInvalidFormat}`);
        expect(false).toBe(true); // must fail anyway
    } catch (err) {
        expect(err.status).toBe(1);
        expect(err.stderr.toString()).toContain("Can not translate '${name}'");
    }
});

test("plugin settings override test", () => {
    try {
        execSync(
            `ts-node src/index.ts check --discover=_ ${poPath} ${checkInvalidFormatDiscover}`
        );
        expect(false).toBe(true); // must fail anyway
    } catch (err) {
        expect(err.status).toBe(1);
        console.log(err.stderr.toString());
        expect(err.stderr.toString()).toContain(
            "You can not use Identifier 'name' as an argument to gettext"
        );
    }
});
const errMessage =
    'Duplicate msgid ("test ${ num2 }" and "test ${ num1 }"' +
    ' in the same context will be interpreted as the same key "test ${0}")' +
    " this potentially can lead to translation loss.";
test("check same key", () => {
    try {
        execSync(`ts-node src/index.ts check ${poPath2} ${checkSameKey}`);
        expect(false).toBe(true); // must fail anyway
    } catch (err) {
        expect(err.status).toBe(1);
        expect(err.stderr.toString()).toContain(errMessage);
    }
});
