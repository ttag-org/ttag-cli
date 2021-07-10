<script context="module">
	import { t } from 'ttag';
	let moduleString = t`String from module`;
</script>

<script>

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

<svelte:component
	this={false}
	objExpressionProp={{
		title: t`Title in obj`,
	}}
	tenaryProp={ 1 + 1 === 2 ? t`True` : t`False` }
/>

{#if loggedIn}
	<button>{t`Log out`}</button>
{/if}
