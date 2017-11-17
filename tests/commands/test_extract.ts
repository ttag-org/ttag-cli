import * as path from "path";
import * as fs from "fs";
import { execSync } from "child_process";

const potPath = path.resolve(__dirname, "../../dist/translation.pot");
const baseTestPath = path.resolve(__dirname, "../fixtures/baseTest");
const ukTestPath = path.resolve(__dirname, "../fixtures/ukLocaleTest");
const jsxPath = path.resolve(__dirname, "../fixtures/testJSXParse.jsx");

function cleanup() {
    fs.unlinkSync(potPath);
}

afterEach(() => {
    cleanup();
});

test("extract base case", () => {
    execSync(`ts-node src/index.ts extract -o ${potPath} ${baseTestPath}`);
    const result = fs.readFileSync(potPath).toString();
    expect(result).toMatchSnapshot();
});

test("extract from jsx", () => {
    execSync(`ts-node src/index.ts extract -o ${potPath} ${jsxPath}`);
    const result = fs.readFileSync(potPath).toString();
    expect(result).toMatchSnapshot();
});

test("extract from js with another default locale", () => {
    execSync(`ts-node src/index.ts extract -l uk -o ${potPath} ${ukTestPath}`);
    const result = fs.readFileSync(potPath).toString();
    expect(result).toMatchSnapshot();
});
