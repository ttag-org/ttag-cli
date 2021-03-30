// import '../fixtures/declarations';
import * as path from "path";
import * as fs from "fs";
import { execSync } from "child_process";

const potPath = path.resolve(__dirname, "../../dist/translation.pot");
const baseTestPath = path.resolve(__dirname, "../fixtures/baseTest");
const sortByMsgidPath = path.resolve(__dirname, "../fixtures/sortByMsgidTest");
const ukTestPath = path.resolve(__dirname, "../fixtures/ukLocaleTest");
const jsxPath = path.resolve(__dirname, "../fixtures/testJSXParse.jsx");
const vuePath = path.resolve(__dirname, "../fixtures/vueTest/testVueParse.vue");
const vuePath2 = path.resolve(
    __dirname,
    "../fixtures/vueTest/testVueWithTagInScript.vue"
);
const sveltePath = path.resolve(
    __dirname,
    "../fixtures/testSvelteParse.svelte"
);
const globalFn = path.resolve(__dirname, "../fixtures/globalFunc.js");
const tsPath = path.resolve(__dirname, "../fixtures/tSParse.ts");
const tsChaning = path.resolve(__dirname, "../fixtures/tsOptionalChaning.ts");
const tsConstEnum = path.resolve(__dirname, "../fixtures/tsConstEnum.ts");
const tsCoalescing = path.resolve(
    __dirname,
    "../fixtures/tsNullishCoalescing.ts"
);
const tsxPath = path.resolve(__dirname, "../fixtures/tSXParse.tsx");

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

test("extract from vue", () => {
    execSync(`ts-node src/index.ts extract -o ${potPath} ${vuePath}`);
    const result = fs.readFileSync(potPath).toString();
    expect(result).toMatchSnapshot();
});

test("extract from vue with tag inside the script", () => {
    execSync(`ts-node src/index.ts extract -o ${potPath} ${vuePath2}`);
    const result = fs.readFileSync(potPath).toString();
    expect(result).toMatchSnapshot();
});

test("extract from svelte", () => {
    execSync(`ts-node src/index.ts extract -o ${potPath} ${sveltePath}`);
    const result = fs.readFileSync(potPath).toString();
    expect(result).toMatchSnapshot();
});

test("extract from ts", () => {
    execSync(`ts-node src/index.ts extract -o ${potPath} ${tsPath}`);
    const result = fs.readFileSync(potPath).toString();
    expect(result).toMatchSnapshot();
});

test("extract from tsx", () => {
    execSync(`ts-node src/index.ts extract -o ${potPath} ${tsxPath}`);
    const result = fs.readFileSync(potPath).toString();
    expect(result).toMatchSnapshot();
});

test("extract from js with another default locale", () => {
    execSync(`ts-node src/index.ts extract -l uk -o ${potPath} ${ukTestPath}`);
    const result = fs.readFileSync(potPath).toString();
    expect(result).toMatchSnapshot();
});

test("should override babel plugin settings", () => {
    execSync(
        `ts-node src/index.ts extract --discover=_ -o ${potPath} ${globalFn}`
    );
    const result = fs.readFileSync(potPath).toString();
    expect(result).toContain('msgid "test _"');
});

test("should extract with numberedExpressions", () => {
    execSync(
        `ts-node src/index.ts extract --numberedExpressions -o ${potPath} ${baseTestPath}`
    );
    const result = fs.readFileSync(potPath).toString();
    expect(result).toContain("test translation 2 ${ 0 }");
});

test("should extract with extract.location", () => {
    execSync(
        `ts-node src/index.ts extract --extractLocation=never -o ${potPath} ${baseTestPath}`
    );
    const result = fs.readFileSync(potPath).toString();
    expect(result).not.toContain("#: tests/fixtures/baseTest");
});

test("should extract in the alphabetical order (sortByMsgid)", () => {
    execSync(
        `ts-node src/index.ts extract --sortByMsgid -o ${potPath} ${sortByMsgidPath}`
    );
    const result = fs.readFileSync(potPath).toString();
    expect(result).toMatchSnapshot();
});

test("extract from ts", () => {
    execSync(`ts-node src/index.ts extract -o ${potPath} ${tsChaning}`);
    const result = fs.readFileSync(potPath).toString();
    expect(result).toMatchSnapshot();
});

test("extract from ts", () => {
    execSync(`ts-node src/index.ts extract -o ${potPath} ${tsCoalescing}`);
    const result = fs.readFileSync(potPath).toString();
    expect(result).toMatchSnapshot();
});

test("extract from ts with const enum", () => {
    execSync(`ts-node src/index.ts extract -o ${potPath} ${tsConstEnum}`);
    const result = fs.readFileSync(potPath).toString();
    expect(result).toMatchSnapshot();
});
