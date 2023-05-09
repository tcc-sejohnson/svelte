import { Readable } from '../store/index.js';

interface SpringOpts {
	stiffness?: number;
	damping?: number;
	precision?: number;
}

interface SpringUpdateOpts {
	hard?: any;
	soft?: string | number | boolean;
}

type Updater<T> = (target_value: T, value: T) => T;

export interface Spring<T> extends Readable<T> {
	set: (new_value: T, opts?: SpringUpdateOpts) => Promise<void>;
	update: (fn: Updater<T>, opts?: SpringUpdateOpts) => Promise<void>;
	precision: number;
	damping: number;
	stiffness: number;
}

export declare function spring<T = any>(value?: T, opts?: SpringOpts): Spring<T>;

interface TweenedOptions<T> {
	delay?: number;
	duration?: number | ((from: T, to: T) => number);
	easing?: (t: number) => number;
	interpolate?: (a: T, b: T) => (t: number) => T;
}

export interface Tweened<T> extends Readable<T> {
	set(value: T, opts?: TweenedOptions<T>): Promise<void>;
	update(updater: Updater<T>, opts?: TweenedOptions<T>): Promise<void>;
}

export declare function tweened<T>(value?: T, defaults?: TweenedOptions<T>): Tweened<T>;
