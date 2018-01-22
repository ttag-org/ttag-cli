import * as path from "path";
import { execSync } from "child_process";

const poPath = path.resolve(__dirname, "../fixtures/statsTest/stats.po");

test("display basic file stats", () => {
    const result = execSync(`ts-node src/index.ts stats ${poPath}`).toString();
    expect(result).toMatchSnapshot();
});
