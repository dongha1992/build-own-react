import { VirtualReactElement } from './type.ts';

export const isDefined = <T>(param: T): param is NonNullable<T> => {
  return param !== void 0 && param !== null;
};

export const isVirtualReactElement = (e: unknown): e is VirtualReactElement =>
  typeof e === 'object';
