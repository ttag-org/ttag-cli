import { po } from "gettext-parser";
import { PoData } from "../lib/parser";

export function serialize(poData: PoData): Buffer {
    return po.compile(poData);
}
