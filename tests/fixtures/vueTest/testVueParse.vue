<template>
    <h1>{{ t`test from vue file (template)` }}</h1>
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