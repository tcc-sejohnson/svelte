import {
	run_all,
	subscribe,
	noop,
	safe_not_equal,
	is_function,
	get_store_value
} from '../internal/index.js';

const subscriber_queue = [];

/**
 * @type {import('types/store').readable}
 */
export function readable(value, start) {
	return {
		subscribe: writable(value, start).subscribe
	};
}

/**
 * @type {import('types/store').writable}
 */
export function writable(value, start = noop) {
	/** @type {import('types/store').Unsubscriber} */
	let stop;
	/** @type {Set<import('types/store').SubscribeInvalidateTuple<any>>} */
	const subscribers = new Set();
	/**
	 * @param {any} new_value
	 * @returns {void}
	 */
	function set(new_value) {
		if (safe_not_equal(value, new_value)) {
			value = new_value;
			if (stop) {
				// store is ready
				const run_queue = !subscriber_queue.length;
				for (const subscriber of subscribers) {
					subscriber[1]();
					subscriber_queue.push(subscriber, value);
				}
				if (run_queue) {
					for (let i = 0; i < subscriber_queue.length; i += 2) {
						subscriber_queue[i][0](subscriber_queue[i + 1]);
					}
					subscriber_queue.length = 0;
				}
			}
		}
	}
	/**
	 * @param {import('types/store').Updater<any>} fn
	 * @returns {void}
	 */
	function update(fn) {
		set(fn(value));
	}
	/**
	 * @param {import('types/store').Subscriber<any>} run
	 * @param {import('types/store').Invalidator<any>} invalidate
	 * @returns {import('types/store').Unsubscriber}
	 */
	function subscribe(run, invalidate = noop) {
		/** @type {import('types/store').SubscribeInvalidateTuple<any>} */
		const subscriber = [run, invalidate];
		subscribers.add(subscriber);
		if (subscribers.size === 1) {
			stop = start(set, update) || noop;
		}
		run(value);
		return () => {
			subscribers.delete(subscriber);
			if (subscribers.size === 0 && stop) {
				stop();
				stop = null;
			}
		};
	}
	return { set, update, subscribe };
}

/**
 * @param {import('types/store').Stores} stores
 * @param {Function} fn
 * @param {any} initial_value
 */
export function derived(stores, fn, initial_value) {
	const single = !Array.isArray(stores);
	/** @type {Array<import('types/store').Readable<any>>} */
	const stores_array = single ? [stores] : stores;
	if (!stores_array.every(Boolean)) {
		throw new Error('derived() expects stores as input, got a falsy value');
	}
	const auto = fn.length < 2;
	return readable(initial_value, (set, update) => {
		let started = false;
		const values = [];
		let pending = 0;
		let cleanup = noop;
		const sync = () => {
			if (pending) {
				return;
			}
			cleanup();
			const result = fn(single ? values[0] : values, set, update);
			if (auto) {
				set(result);
			} else {
				cleanup = is_function(result) ? result : noop;
			}
		};
		const unsubscribers = stores_array.map((store, i) =>
			subscribe(
				store,
				(value) => {
					values[i] = value;
					pending &= ~(1 << i);
					if (started) {
						sync();
					}
				},
				() => {
					pending |= 1 << i;
				}
			)
		);
		started = true;
		sync();
		return function stop() {
			run_all(unsubscribers);
			cleanup();
			// We need to set this to false because callbacks can still happen despite having unsubscribed:
			// Callbacks might already be placed in the queue which doesn't know it should no longer
			// invoke this derived store.
			started = false;
		};
	});
}

/**
 * @type {import('types/store').readonly}
 */
export function readonly(store) {
	return {
		subscribe: store.subscribe.bind(store)
	};
}

export { get_store_value as get };
