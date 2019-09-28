import * as path from "path";
import { execSync } from "child_process";

const poPaths = [
    path.resolve(__dirname, "../fixtures/mergeTest/mergeLeft.po"),
    path.resolve(__dirname, "../fixtures/mergeTest/mergeRight.po"),
    path.resolve(__dirname, "../fixtures/mergeTest/mergeRightRight.po")
].join(" ");

const poWithEncoding = path.resolve(
    __dirname,
    "../fixtures/mergeTest/merge-with-encoding.po"
);

test("merge two files together", () => {
    const result = execSync(`ts-node src/index.ts merge ${poPaths}`);
    const expectStr = expect(result.toString());
    expectStr.toContain('msgstr "test translated"');
    expectStr.toMatchSnapshot();
});

test("merge with encoding (regression for the issue - https://github.com/ttag-org/ttag-cli/issues/56", () => {
    const result = execSync(
        `ts-node src/index.ts merge ${poWithEncoding} ${poWithEncoding}`
    );
    const resultStr = result.toString();
    expect(resultStr).toContain('msgstr "Ŭşḗř ${ match.params.id }"');
});
