import * as fs from "fs";
import { serialize } from "../lib/serializer";
import { mergePo } from "../lib/merge";
import { PoData, parse } from "../lib/parser";

/* Read and parse file path into poData */
function read(path: string): PoData {
    return parse(fs.readFileSync(path).toString());
}

/* Entry point */
export default function merge(paths: string[]) {
    process.stdout.write(serialize(paths.map(read).reduce(mergePo)));
}
