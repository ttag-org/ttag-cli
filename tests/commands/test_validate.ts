import * as path from "path";
import { parseTemplateString, checkFormat } from "../../src/lib/validation";
import { execSync } from "child_process";

const poPath = path.resolve(__dirname, "../fixtures/validateTest/validate.po");

test("parse template string", () => {
    const identifiers = parseTemplateString("${x} and ${y}");
    expect(Array.from(identifiers.values()).join("|")).toBe("x|y");
    const callexpressions = parseTemplateString("${x()} and ${y()}");
    expect(Array.from(callexpressions.values()).join("|")).toBe("x()|y()");
    const taggedexpression = parseTemplateString("${x + z} and ${y()*5}");
    expect(Array.from(taggedexpression.values()).join("|")).toBe(
        "x + z|y() * 5"
    );

    // should work with upper case characters as variables (regression)
    const uppercaseVariables = parseTemplateString("${X} and ${Y}");
    expect(Array.from(uppercaseVariables.values()).join("|")).toBe("X|Y");
});

test("invalid format checks", () => {
    const result = checkFormat("${x}", "${y}");
    expect(result.valid).toBe(false);
    expect(result.missing.join("")).toBe("x");
    expect(result.redundant.join("")).toBe("y");
});

test("command integrity test", () => {
    try {
        execSync(`ts-node src/index.ts validate ${poPath}`);
    } catch (err) {
        expect(err.status).toBe(1);
    }
});
