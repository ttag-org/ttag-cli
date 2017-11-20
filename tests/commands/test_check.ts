import * as path from "path";
import * as fs from "fs";
import { execSync } from "child_process";

const poPath = path.resolve(__dirname, "../fixtures/checkTest/check.po");
const checkPass = path.resolve(
    __dirname,
    "../fixtures/checkTest/check-trans-exist.js"
);
const checkNotPass = path.resolve(
    __dirname,
    "../fixtures/checkTest/check-trans-not-exist.js"
);

test("check when all string are translated", () => {
    const result = execSync(
        `ts-node src/index.ts check ${poPath} ${checkPass}`
    );
    expect(result.toString()).toMatchSnapshot();
});

test("check when some translation is missing", () => {
    try {
        const result = execSync(
            `ts-node src/index.ts check ${poPath} ${checkNotPass}`
        );
        expect(false).toBe(true); // must fail anyway
    } catch (err) {
        expect(err.status).toBe(1);
        expect(err.stderr.toString()).toContain(
            "Translation 'test not test' is not found"
        );
    }
});
