import * as path from "path";
import { execSync } from "child_process";

const poPath = path.resolve(__dirname, "../fixtures/spellTest/spell.po");

test("find basic spelling error with locale autodetect", () => {
    const result = execSync(`ts-node src/index.ts spell ${poPath}`).toString();
    expect(result).toMatchSnapshot();
});
