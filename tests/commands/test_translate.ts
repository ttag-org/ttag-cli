import * as path from "path";
import { spawn } from "child_process";
import * as tmp from "tmp";
import * as fs from "fs";

const poPath = path.resolve(
    __dirname,
    "../fixtures/translateTest/translate.po"
);

test("merge two files together", () => {
    const tmpFile = tmp.fileSync();
    const process = spawn("ts-node", [
        "src/index.ts",
        "translate",
        poPath,
        tmpFile.name
    ]);
    process.stdin.write("xxx\n");
    process.stdin.end();
    const data = fs.readFileSync(tmpFile.name).toString();
    // expect(data).toContain('msgid "test"\nmsgstr "xxx"');
});
