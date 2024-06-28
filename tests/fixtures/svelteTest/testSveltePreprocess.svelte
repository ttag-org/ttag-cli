<script lang="ts">
	import { t } from 'ttag';
	export let translated: string = t`world`;
</script>

<h1>{t`Hello ${translated}!`}</h1>
