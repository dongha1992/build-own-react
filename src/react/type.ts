export type LooseObject = Record<string, unknown>;

export interface ComponentFunction {
  new (props: LooseObject): any;
  (props: LooseObject): VirtualReactElement | string;
}

export type VirtualReactElementType = ComponentFunction | string;

export interface VirtualReactElementProps {
  children?: VirtualReactElement[];
  [propName: string]: unknown;
}

export interface VirtualReactElement {
  type: VirtualReactElementType;
  props: VirtualReactElementProps;
}
