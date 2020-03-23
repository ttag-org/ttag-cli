<template>
    <h1>Hello World</h1>
</template>
<script>
import { t } from "ttag";

export default {
    data() {
        return {
            greeting: t`test from vue file`
        };
    }
};
</script>
<style>
</style>