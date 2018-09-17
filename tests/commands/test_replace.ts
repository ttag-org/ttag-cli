import * as path from "path";
import * as fs from "fs";
import { execSync } from "child_process";
import * as tmp from "tmp";

const replaceDirPath = path.resolve(__dirname, "../fixtures/replaceTest");
const poPath = path.join(replaceDirPath, "translations.po");

test("replace translations", () => {
    const tmpFolder = tmp.dirSync();
    execSync(
        `ts-node src/index.ts replace ${poPath} ${tmpFolder.name} ${
            replaceDirPath
        }`
    );
    const testFile = fs
        .readFileSync(path.join(tmpFolder.name, "test.js"))
        .toString();
    const nestedFile = fs
        .readFileSync(path.join(tmpFolder.name, "nested/test2.js"))
        .toString();
    expect(testFile).toMatchSnapshot();
    expect(nestedFile).toMatchSnapshot();
});

test("override babel defaults", () => {
    const tmpFolder = tmp.dirSync();
    execSync(
        `ts-node src/index.ts replace --discover=_ ${poPath} ${
            tmpFolder.name
        } ${replaceDirPath}`
    );
    const globalFile = fs
        .readFileSync(path.join(tmpFolder.name, "nested/global.js"))
        .toString();
    expect(globalFile).toContain("check _ translation");
});
