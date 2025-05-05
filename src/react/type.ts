import { ComponentFunction } from './component';
import { Fragment } from './utils';

export type LooseObject = Record<string, unknown>;

export type FiberNodeDOM = Element | Text | null | undefined;

export interface FiberNode<T = any> extends VirtualReactElement {
  alternate: FiberNode<T> | null; // 이전 렌더링의 Fiber 노드
  dom?: FiberNodeDOM;
  effectTag?: 'REPLACEMENT' | 'UPDATE';
  child?: FiberNode;
  return?: FiberNode;
  sibling?: FiberNode;
  hooks?: Array<HookInFiberNode<T>>;
}

export type HookInFiberNode<T> = {
  state: T;
  queue: Array<T>;
};
export type VirtualReactElementType =
  | ComponentFunction
  | typeof Fragment
  | string;

export interface VirtualReactElementProps {
  children?: VirtualReactElement[];
  [propName: string]: unknown;
  [propName: `on${string}`]: EventListener | undefined;
}

export interface VirtualReactElement {
  type: VirtualReactElementType;
  props: VirtualReactElementProps;
}
