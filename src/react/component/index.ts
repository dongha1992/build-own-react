import { LooseObject, VirtualReactElement } from '../type.ts';

export interface ComponentFunction {
  new (props: LooseObject): Component;
  (props: LooseObject): VirtualReactElement | string;
}

export abstract class Component {
  props: LooseObject;
  abstract state: unknown;
  abstract setState: (value: unknown) => void;
  abstract render: () => VirtualReactElement | string;

  constructor(props: LooseObject) {
    this.props = props;
  }

  static REACT_COMPONENT = true;
}
