import * as path from "path";
import { execSync } from "child_process";

const poPath = path.resolve(__dirname, "../fixtures/po2jsTest/po2js.po");

test("convert po to js", () => {
    const result = execSync(
        `ts-node src/index.ts po2json ${poPath}`
    ).toString();
    expect(result).toMatchSnapshot();
});

test("convert po to js pretty", () => {
    const result = execSync(
        `ts-node src/index.ts po2json -p ${poPath}`
    ).toString();
    expect(result).toMatchSnapshot();
});

test("convert po to js nostrip", () => {
    const result = execSync(
        `ts-node src/index.ts po2json -n ${poPath}`
    ).toString();
    expect(result).toMatchSnapshot();
});

test("should apply compact format", () => {
    const result = execSync(
        `ts-node src/index.ts po2json --format=compact -n ${poPath}`
    ).toString();
    const jsonResult = JSON.parse(result);
    expect(jsonResult).toHaveProperty("contexts");
    expect(result).toMatchSnapshot();
});

const errMessage =
    'Duplicate msgid ("test ${ num2 }" and "test ${ num1 }"' +
    ' in the same context will be interpreted as the same key "test ${0}")' +
    " this potentially can lead to translation loss.";

const poPath2 = path.resolve(__dirname, "../fixtures/checkTest/same_key.po");
test("Should get exception about same key", () => {
    try {
        execSync(`ts-node src/index.ts po2json --format=compact -n ${poPath2}`);
        expect(false).toBe(true); // must fail anyway
    } catch (err) {
        expect(err.status).toBe(1);
        expect(err.stderr.toString()).toContain(errMessage);
    }
});
