export default {
	html: `
		<editor contenteditable="true"><b>world</b></editor>
		<p>hello world</p>
	`,

	ssrHtml: `
		<editor contenteditable="true"><b>world</b></editor>
		<p>hello undefined</p>
	`,

	async test({ assert, component, target, window }) {
		assert.equal(component.name, "world");

		const el = target.querySelector("editor");

		const event = new window.Event("input");

		el.innerText = "everybody";
		await el.dispatchEvent(event);

		assert.htmlEqual(
			target.innerHTML,
			`
			<editor contenteditable="true">everybody</editor>
			<p>hello everybody</p>
		`
		);

		el.innerText = "<b>everybody</b>";
		await el.dispatchEvent(event);

		// HTML tags should be escaped
		assert.htmlEqual(
			target.innerHTML,
			`
			<editor contenteditable="true">&lt;b&gt;everybody&lt;/b&gt;</editor>
			<p>hello everybody</p>
		`
		);

		component.name = "goodbye";
		assert.equal(el.innerText, "goodbye");
		assert.htmlEqual(
			target.innerHTML,
			`
			<editor contenteditable="true">goodbye</editor>
			<p>hello goodbye</p>
		`
		);
	},
};
