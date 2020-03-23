<script>
	import { t } from 'ttag';

  export let loggedIn = false;
	export let moreUrl = 'http://ttag.js.org';
	export let translated = t`world`;
</script>

<style>
	h1 {
		color: purple;
	}
</style>

<h1>{t`Hello ${translated} !`}</h1>
<p title={t`Instruction`}>{@html t`Click <a href=${moreUrl}>here</a> for more info`}</p>

{#if loggedIn}
	<button>{t`Log out`}</button>
{/if}
