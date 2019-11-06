import { t } from "ttag";

function test(data) {
    const name = data?.field;
    console.log(t`test ${name}`);
}
