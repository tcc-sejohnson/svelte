import { cubicOut, cubicInOut, linear } from '../easing.js';
import { assign, split_css_unit, is_function } from '../internal.js';

/**
 * @param {Element} node
 * @param {BlurParams}
 * @returns {import("/Users/elliottjohnson/dev/sveltejs/svelte/index.ts-to-jsdoc").TransitionConfig}
 */
export function blur(
	node,
	{ delay = 0, duration = 400, easing = cubicInOut, amount = 5, opacity = 0 } = {}
) {
	const style = getComputedStyle(node);
	const target_opacity = +style.opacity;
	const f = style.filter === 'none' ? '' : style.filter;
	const od = target_opacity * (1 - opacity);
	const [value, unit] = split_css_unit(amount);
	return {
		delay,
		duration,
		easing,
		css: (_t, u) => `opacity: ${target_opacity - od * u}; filter: ${f} blur(${u * value}${unit});`
	};
}

/**
 * @param {Element} node
 * @param {FadeParams}
 * @returns {import("/Users/elliottjohnson/dev/sveltejs/svelte/index.ts-to-jsdoc").TransitionConfig}
 */
export function fade(node, { delay = 0, duration = 400, easing = linear } = {}) {
	const o = +getComputedStyle(node).opacity;
	return {
		delay,
		duration,
		easing,
		css: (t) => `opacity: ${t * o}`
	};
}

/**
 * @param {Element} node
 * @param {FlyParams}
 * @returns {import("/Users/elliottjohnson/dev/sveltejs/svelte/index.ts-to-jsdoc").TransitionConfig}
 */
export function fly(
	node,
	{ delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}
) {
	const style = getComputedStyle(node);
	const target_opacity = +style.opacity;
	const transform = style.transform === 'none' ? '' : style.transform;
	const od = target_opacity * (1 - opacity);
	const [xValue, xUnit] = split_css_unit(x);
	const [yValue, yUnit] = split_css_unit(y);
	return {
		delay,
		duration,
		easing,
		css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * xValue}${xUnit}, ${(1 - t) * yValue}${yUnit});
			opacity: ${target_opacity - od * u}`
	};
}

/**
 * @param {Element} node
 * @param {SlideParams}
 * @returns {import("/Users/elliottjohnson/dev/sveltejs/svelte/index.ts-to-jsdoc").TransitionConfig}
 */
export function slide(node, { delay = 0, duration = 400, easing = cubicOut, axis = 'y' } = {}) {
	const style = getComputedStyle(node);
	const opacity = +style.opacity;
	const primary_property = axis === 'y' ? 'height' : 'width';
	const primary_property_value = parseFloat(style[primary_property]);
	const secondary_properties = axis === 'y' ? ['top', 'bottom'] : ['left', 'right'];
	const capitalized_secondary_properties = secondary_properties.map(
		(e) => `${e[0].toUpperCase()}${e.slice(1)}`
	);
	const padding_start_value = parseFloat(style[`padding${capitalized_secondary_properties[0]}`]);
	const padding_end_value = parseFloat(style[`padding${capitalized_secondary_properties[1]}`]);
	const margin_start_value = parseFloat(style[`margin${capitalized_secondary_properties[0]}`]);
	const margin_end_value = parseFloat(style[`margin${capitalized_secondary_properties[1]}`]);
	const border_width_start_value = parseFloat(
		style[`border${capitalized_secondary_properties[0]}Width`]
	);
	const border_width_end_value = parseFloat(
		style[`border${capitalized_secondary_properties[1]}Width`]
	);
	return {
		delay,
		duration,
		easing,
		css: (t) =>
			'overflow: hidden;' +
			`opacity: ${Math.min(t * 20, 1) * opacity};` +
			`${primary_property}: ${t * primary_property_value}px;` +
			`padding-${secondary_properties[0]}: ${t * padding_start_value}px;` +
			`padding-${secondary_properties[1]}: ${t * padding_end_value}px;` +
			`margin-${secondary_properties[0]}: ${t * margin_start_value}px;` +
			`margin-${secondary_properties[1]}: ${t * margin_end_value}px;` +
			`border-${secondary_properties[0]}-width: ${t * border_width_start_value}px;` +
			`border-${secondary_properties[1]}-width: ${t * border_width_end_value}px;`
	};
}

/**
 * @param {Element} node
 * @param {ScaleParams}
 * @returns {import("/Users/elliottjohnson/dev/sveltejs/svelte/index.ts-to-jsdoc").TransitionConfig}
 */
export function scale(
	node,
	{ delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}
) {
	const style = getComputedStyle(node);
	const target_opacity = +style.opacity;
	const transform = style.transform === 'none' ? '' : style.transform;
	const sd = 1 - start;
	const od = target_opacity * (1 - opacity);
	return {
		delay,
		duration,
		easing,
		css: (_t, u) => `
			transform: ${transform} scale(${1 - sd * u});
			opacity: ${target_opacity - od * u}
		`
	};
}

/**
 * @param {SVGElement & { getTotalLength(): number }} node
 * @param {DrawParams}
 * @returns {import("/Users/elliottjohnson/dev/sveltejs/svelte/index.ts-to-jsdoc").TransitionConfig}
 */
export function draw(node, { delay = 0, speed, duration, easing = cubicInOut } = {}) {
	let len = node.getTotalLength();
	const style = getComputedStyle(node);
	if (style.strokeLinecap !== 'butt') {
		len += parseInt(style.strokeWidth);
	}
	if (duration === undefined) {
		if (speed === undefined) {
			duration = 800;
		} else {
			duration = len / speed;
		}
	} else if (typeof duration === 'function') {
		duration = duration(len);
	}
	return {
		delay,
		duration,
		easing,
		css: (_, u) => `
			stroke-dasharray: ${len};
			stroke-dashoffset: ${u * len};
		`
	};
}

/**
 * @param {CrossfadeParams & {
 * 	fallback?: (node: Element, params: CrossfadeParams, intro: boolean) => TransitionConfig;
 * }}
 * @returns {[(node: any, params: import("/Users/elliottjohnson/dev/sveltejs/svelte/index.ts-to-jsdoc").CrossfadeParams & { key: any; }) => () => import("/Users/elliottjohnson/dev/sveltejs/svelte/index.ts-to-jsdoc").TransitionConfig, (node: any, params: import("/Users/elliottjohnson/dev/sveltejs/svelte/index.ts-to-jsdoc").CrossfadeParams & { key: any; }) => () => import("/Users/elliottjohnson/dev/sveltejs/svelte/index.ts-to-jsdoc").TransitionConfig]}
 */
export function crossfade({ fallback, ...defaults }) {
	/** @type {ClientRectMap} */
	const to_receive = new Map();
	/** @type {ClientRectMap} */
	const to_send = new Map();
	/**
	 * @param {Element} from_node
	 * @param {Element} node
	 * @param {CrossfadeParams} params
	 * @returns {import("/Users/elliottjohnson/dev/sveltejs/svelte/index.ts-to-jsdoc").TransitionConfig}
	 */
	function crossfade(from_node, node, params) {
		const {
			delay = 0,
			duration = (d) => Math.sqrt(d) * 30,
			easing = cubicOut
		} = assign(assign({}, defaults), params);
		const from = from_node.getBoundingClientRect();
		const to = node.getBoundingClientRect();
		const dx = from.left - to.left;
		const dy = from.top - to.top;
		const dw = from.width / to.width;
		const dh = from.height / to.height;
		const d = Math.sqrt(dx * dx + dy * dy);
		const style = getComputedStyle(node);
		const transform = style.transform === 'none' ? '' : style.transform;
		const opacity = +style.opacity;
		return {
			delay,
			duration: is_function(duration) ? duration(d) : duration,
			easing,
			css: (t, u) => `
				opacity: ${t * opacity};
				transform-origin: top left;
				transform: ${transform} translate(${u * dx}px,${u * dy}px) scale(${t + (1 - t) * dw}, ${
				t + (1 - t) * dh
			});
			`
		};
	}

	/**
	 * @param {ClientRectMap} items
	 * @param {ClientRectMap} counterparts
	 * @param {boolean} intro
	 * @returns {(node: any, params: import("/Users/elliottjohnson/dev/sveltejs/svelte/index.ts-to-jsdoc").CrossfadeParams & { key: any; }) => () => import("/Users/elliottjohnson/dev/sveltejs/svelte/index.ts-to-jsdoc").TransitionConfig}
	 */
	function transition(items, counterparts, intro) {
		return (node, params) => {
			items.set(params.key, node);
			return () => {
				if (counterparts.has(params.key)) {
					const other_node = counterparts.get(params.key);
					counterparts.delete(params.key);
					return crossfade(other_node, node, params);
				}
				// if the node is disappearing altogether
				// (i.e. wasn't claimed by the other list)
				// then we need to supply an outro
				items.delete(params.key);
				return fallback && fallback(node, params, intro);
			};
		};
	}
	return [transition(to_send, to_receive, false), transition(to_receive, to_send, true)];
}

/** @typedef {(t: number) => number} EasingFunction */
/** @typedef {Map<any, Element>} ClientRectMap */

/**
 * @typedef {Object} TransitionConfig
 * @property {number} [delay]
 * @property {number} [duration]
 * @property {EasingFunction} [easing]
 * @property {(t:number,u:number)=>string} [css]
 * @property {(t:number,u:number)=>void} [tick]
 */

/**
 * @typedef {Object} BlurParams
 * @property {number} [delay]
 * @property {number} [duration]
 * @property {EasingFunction} [easing]
 * @property {number|string} [amount]
 * @property {number} [opacity]
 */

/**
 * @typedef {Object} FadeParams
 * @property {number} [delay]
 * @property {number} [duration]
 * @property {EasingFunction} [easing]
 */

/**
 * @typedef {Object} FlyParams
 * @property {number} [delay]
 * @property {number} [duration]
 * @property {EasingFunction} [easing]
 * @property {number|string} [x]
 * @property {number|string} [y]
 * @property {number} [opacity]
 */

/**
 * @typedef {Object} SlideParams
 * @property {number} [delay]
 * @property {number} [duration]
 * @property {EasingFunction} [easing]
 * @property {'x'|'y'} [axis]
 */

/**
 * @typedef {Object} ScaleParams
 * @property {number} [delay]
 * @property {number} [duration]
 * @property {EasingFunction} [easing]
 * @property {number} [start]
 * @property {number} [opacity]
 */

/**
 * @typedef {Object} DrawParams
 * @property {number} [delay]
 * @property {number} [speed]
 * @property {number|((len:number)=>number)} [duration]
 * @property {EasingFunction} [easing]
 */

/**
 * @typedef {Object} CrossfadeParams
 * @property {number} [delay]
 * @property {number|((len:number)=>number)} [duration]
 * @property {EasingFunction} [easing]
 */
