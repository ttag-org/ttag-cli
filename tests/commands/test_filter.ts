import * as path from "path";
import { execSync } from "child_process";

const poPath = path.resolve(__dirname, "../fixtures/filterTest/filter.po");

test("filter out fuzzy entries", () => {
    const result = execSync(
        `ts-node src/index.ts filter --nf ${poPath}`
    ).toString();
    expect(result).not.toContain("#, fuzzy");
});

test("filter only fuzzy entries", () => {
    const result = execSync(
        `ts-node src/index.ts filter -f ${poPath}`
    ).toString();
    expect(result).toContain("#, fuzzy");
    expect(result).not.toContain("not_fuzzy");
});

test("filter only translated entries", () => {
    const result = execSync(
        `ts-node src/index.ts filter -t ${poPath}`
    ).toString();
    expect(result).toContain("translated");
    expect(result).not.toContain("not_translated");
});

test("filter only not translated entries", () => {
    const result = execSync(
        `ts-node src/index.ts filter --nt ${poPath}`
    ).toString();
    expect(result).not.toContain("test_translated");
    expect(result).toContain("test_not_translated");
});

test("filter by reference regexp", () => {
    const result = execSync(
        `ts-node src/index.ts filter ${poPath} -r check`
    ).toString();
    expect(result).not.toContain("no_ref");
    expect(result).not.toContain("wrong_ref");
    expect(result).toContain("test_fuzzy_ref_check");
});
