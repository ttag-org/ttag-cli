import * as path from "path";
import { execSync } from "child_process";

const poPaths = [
    path.resolve(__dirname, "../fixtures/mergeTest/mergeLeft.po"),
    path.resolve(__dirname, "../fixtures/mergeTest/mergeRight.po"),
    path.resolve(__dirname, "../fixtures/mergeTest/mergeRightRight.po")
].join(" ");

test("merge two files together", () => {
    const result = execSync(`ts-node src/index.ts merge ${poPaths}`);
    const expectStr = expect(result.toString());
    expectStr.toContain('msgstr "test translated"');
    expectStr.toMatchSnapshot();
});
