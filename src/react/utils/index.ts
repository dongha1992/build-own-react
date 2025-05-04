import { VirtualReactElement } from '../type.ts';

export const isDefined = <T>(param: T): param is NonNullable<T> => {
  return param !== void 0 && param !== null;
};

export const isVirtualReactElement = (e: unknown): e is VirtualReactElement =>
  typeof e === 'object';

export const isPlainObject = (val: unknown): val is Record<string, unknown> => {
  const PLAIN_OBJECT_TAG = '[object Object]';

  if (val === null || typeof val !== 'object') return false;

  const tag = Object.prototype.toString.call(val);
  const __proto = Object.getPrototypeOf(val);
  const isObjectTag = tag === PLAIN_OBJECT_TAG;
  const isPrototypeSafe = __proto === Object.prototype || __proto === null;

  return isObjectTag && isPrototypeSafe;
};

export const Fragment = Symbol.for('react.fragment');
