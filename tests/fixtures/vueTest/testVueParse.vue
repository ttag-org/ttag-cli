<template>
    <h1>{{ t`Hello World!` }}</h1>
    <h2>{{ t('Hi!') }}</h2>
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