import * as path from "path";
import * as fs from "fs";
import { execSync } from "child_process";
import * as tmp from "tmp";

const originalPo = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=utf-8\n"
"Plural-Forms: nplurals=2; plural=(n!=1);\n"


msgid "old"
msgstr "old trans"

msgid "obsolete"
msgstr "obsolete trans"
`;

const srcPath = path.resolve(__dirname, "../fixtures/updateTest/test.js");

test("test update po", () => {
    const tmpFile = tmp.fileSync();
    fs.writeFileSync(tmpFile.name, originalPo);
    execSync(`ts-node src/index.ts update ${tmpFile.name} ${srcPath}`);
    const result = fs.readFileSync(tmpFile.name).toString();
    expect(result).toMatchSnapshot();
    tmpFile.removeCallback();
});

test("test for plugin override", () => {
    const tmpFile = tmp.fileSync();
    fs.writeFileSync(tmpFile.name, originalPo);
    execSync(
        `ts-node src/index.ts update --discover=_  ${tmpFile.name} ${srcPath}`
    );
    const result = fs.readFileSync(tmpFile.name).toString();
    expect(result).toContain('msgid "discover _ test"');
    tmpFile.removeCallback();
});

test("test update with multiple discover po (plugins settings override test)", () => {
    const tmpFile = tmp.fileSync();
    fs.writeFileSync(tmpFile.name, originalPo);
    execSync(
        `ts-node src/index.ts update --discover=_ --discover=gettext ${tmpFile.name} ${srcPath}`
    );
    const result = fs.readFileSync(tmpFile.name).toString();
    expect(result).toContain('msgid "discover _ test"');
    tmpFile.removeCallback();
});

test("should sort the output alphabetically (apply sortByMsgid option)", () => {
    const tmpFile = tmp.fileSync();
    fs.writeFileSync(tmpFile.name, originalPo);
    execSync(
        `ts-node src/index.ts update --sortByMsgid ${tmpFile.name} ${srcPath}`
    );
    const result = fs.readFileSync(tmpFile.name).toString();
    expect(result).toMatchSnapshot();
    tmpFile.removeCallback();
});

const commentsTest = path.resolve(
    __dirname,
    "../fixtures/updateTest/comments.jsx"
);
test("should extract comments by default", () => {
    const tmpFile = tmp.fileSync();
    fs.writeFileSync(tmpFile.name, originalPo);
    execSync(`ts-node src/index.ts update ${tmpFile.name} ${commentsTest}`);
    const result = fs.readFileSync(tmpFile.name).toString();
    expect(result).toContain("#. test comment");
    expect(result).toContain("#. translator: jsx test comment");
    tmpFile.removeCallback();
});

test("should not extract comments, via addComments option", () => {
    const tmpFile = tmp.fileSync();
    fs.writeFileSync(tmpFile.name, originalPo);
    execSync(
        `ts-node src/index.ts update --addComments=false ${tmpFile.name} ${commentsTest}`
    );
    const result = fs.readFileSync(tmpFile.name).toString();
    expect(result).not.toContain("#. test comment");
    expect(result).not.toContain("#. translator: jsx test comment");
    tmpFile.removeCallback();
});

test("should extract comments with prefix, via addComments option", () => {
    const tmpFile = tmp.fileSync();
    fs.writeFileSync(tmpFile.name, originalPo);
    execSync(
        `ts-node src/index.ts update --addComments=translator: ${tmpFile.name} ${commentsTest}`
    );
    const result = fs.readFileSync(tmpFile.name).toString();
    expect(result).not.toContain("#. test comment");
    expect(result).toContain("#. jsx test comment");
    tmpFile.removeCallback();
});

const contextTest = path.resolve(
    __dirname,
    "../fixtures/updateTest/context.jsx"
);

test("should extract from context", () => {
    const tmpFile = tmp.fileSync();
    fs.writeFileSync(tmpFile.name, originalPo);
    execSync(`ts-node src/index.ts update ${tmpFile.name} ${contextTest}`);
    const result = fs.readFileSync(tmpFile.name).toString();
    expect(result).toContain('msgctxt "email"');
    expect(result).toContain('msgid "context translation"');
    tmpFile.removeCallback();
});

test("should extract context consistently", () => {
    const tmpFile = tmp.fileSync();
    fs.writeFileSync(tmpFile.name, originalPo);
    execSync(`ts-node src/index.ts update ${tmpFile.name} ${contextTest}`);
    execSync(`ts-node src/index.ts update ${tmpFile.name} ${contextTest}`);
    const result = fs.readFileSync(tmpFile.name).toString();
    expect(result).toContain('msgctxt "email"');
    expect(result).toContain('msgid "context translation"');
    tmpFile.removeCallback();
});

const hoistingTest = path.resolve(
    __dirname,
    "../fixtures/updateTest/hoisting.js"
);

test("should not transpile const to vars (avoid scope hoisting)", () => {
    const tmpFile = tmp.fileSync();
    fs.writeFileSync(tmpFile.name, originalPo);
    execSync(`ts-node src/index.ts update ${tmpFile.name} ${hoistingTest}`);
    const result = fs.readFileSync(tmpFile.name).toString();
    expect(result).toContain('msgid "test ${ days }"');
    tmpFile.removeCallback();
});

const poPath2 = path.resolve(
    __dirname,
    "../fixtures/checkTest/same_key_update.po"
);
const checkSameKey = path.resolve(
    __dirname,
    "../fixtures/checkTest/check-same-key.js"
);

const errMessage =
    'Duplicate msgid ("test ${ num2 }" and "test ${ num1 }"' +
    ' in the same context will be interpreted as the same key "test ${0}")' +
    " this potentially can lead to translation loss.";

test("Should get exception about same key", () => {
    try {
        execSync(`ts-node src/index.ts update ${poPath2} ${checkSameKey}`);
        expect(false).toBe(true); // must fail anyway
    } catch (err) {
        expect(err.status).toBe(1);
        expect(err.stderr.toString()).toContain(errMessage);
    }
});
