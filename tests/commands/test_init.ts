import * as path from "path";
import * as fs from "fs";
import { execSync } from "child_process";

const poPath = path.resolve(__dirname, "../../dist/uk.po");

function cleanup() {
    fs.unlinkSync(poPath);
}

afterEach(() => {
    cleanup();
});

test("should init uk locale", () => {
    execSync(`ts-node src/index.ts init uk ${poPath}`);
    const result = fs.readFileSync(poPath).toString();
    expect(result).toMatchSnapshot();
});

test("should init en locale", () => {
    execSync(`ts-node src/index.ts init en ${poPath}`);
    const result = fs.readFileSync(poPath).toString();
    expect(result).toMatchSnapshot();
});
