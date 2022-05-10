<script>
	export let name;
</script>

<editor contenteditable="true" bind:innerText={name}>
	<b>world</b>
</editor>
<p>hello {name}</p>
