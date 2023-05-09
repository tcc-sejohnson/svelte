import './ambient.js';
export {
	onMount,
	onDestroy,
	beforeUpdate,
	afterUpdate,
	setContext,
	getContext,
	getAllContexts,
	hasContext,
	tick,
	createEventDispatcher,
	SvelteComponentDev as SvelteComponent,
	SvelteComponentTyped
} from './internal/index.js';
export type {
	ComponentType,
	ComponentConstructorOptions,
	ComponentProps,
	ComponentEvents
} from './internal/index.js';
