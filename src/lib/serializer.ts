import { po } from "gettext-parser";
import { PoData } from "../lib/parser";

export type SerializeOptions = {
    foldLength?: number;
};

export function serialize(poData: PoData, options?: SerializeOptions): Buffer {
    return po.compile(poData, options);
}
