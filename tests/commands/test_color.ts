import * as path from "path";
import { execSync } from "child_process";

const poPath = path.resolve(__dirname, "../fixtures/colorTest/color.po");

test("colorize test file", () => {
    const result = execSync(`ts-node src/index.ts color ${poPath}`).toString();
    expect(result).toMatchSnapshot();
});
