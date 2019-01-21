import { t } from "ttag";

export function test(a: number): string {
    return t`${a} string`;
}
