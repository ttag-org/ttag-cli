import * as path from "path";
import * as fs from "fs";
import { execSync } from "child_process";

const poPath = path.resolve(__dirname, "../../dist/uk.po");

function cleanup() {
    fs.unlinkSync(poPath);
}

test("should init uk locale", () => {
    execSync(`ts-node src/index.ts init uk ${poPath}`);
    const result = fs.readFileSync(poPath).toString();
    expect(result).toMatchSnapshot();
    cleanup();
});

test("should init en locale", () => {
    execSync(`ts-node src/index.ts init en ${poPath}`);
    const result = fs.readFileSync(poPath).toString();
    expect(result).toMatchSnapshot();
    cleanup();
});

test("should handle unknown lang code properly", () => {
    try {
        execSync(`ts-node src/index.ts init enn ${poPath}`);
    } catch (err) {
        expect(err.status).toBe(1);
        expect(err.stderr.toString()).toContain("Unknown lang code");
    }
});
