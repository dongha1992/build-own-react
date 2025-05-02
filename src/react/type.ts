import { ComponentFunction } from './index.ts';

export type LooseObject = Record<string, unknown>;

export type VirtualReactElementType = ComponentFunction | string;

interface VirtualReactElementProps {
  children?: VirtualReactElement[];
  [propName: string]: unknown;
}

export interface VirtualReactElement {
  type: VirtualReactElementType;
  props: VirtualReactElementProps;
}
