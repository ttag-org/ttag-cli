import { t } from "ttag";

export const enum eTestEnum {
    Test = 'test',
}

export function test(a: number): string {
    return t`${a} string ${eTestEnum.Test}`;
}
