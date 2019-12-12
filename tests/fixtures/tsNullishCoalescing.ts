import { t } from "ttag";

function test(data) {
    const name = data ?? 'default';
    console.log(t`test ${name}`);
}
