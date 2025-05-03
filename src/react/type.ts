import { ComponentFunction } from './index.ts';

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
export type VirtualReactElementType = ComponentFunction | string;

export interface VirtualReactElementProps {
  children?: VirtualReactElement[];
  [propName: string]: unknown;
}

export interface VirtualReactElement {
  type: VirtualReactElementType;
  props: VirtualReactElementProps;
}
