import {
  LooseObject,
  VirtualReactElement,
  VirtualReactElementType,
} from '../type.ts';
import { isVirtualReactElement } from '../utils';

const createTextElement = (text: string) => ({
  type: 'TEXT',
  props: {
    nodeValue: text,
  },
});

/**
 * createElement: JSX를 ReactElement로 변환한다.
 * @example
 *
 */
const createElement = (
  type: VirtualReactElementType,
  props: LooseObject = {},
  ...children: (unknown | VirtualReactElement)[]
): VirtualReactElement => {
  const normalizedChildren = children.map((c) =>
    isVirtualReactElement(c) ? c : createTextElement(String(c)),
  );

  return {
    type,
    props: {
      ...props,
      children: normalizedChildren,
    },
  };
};

export { createTextElement, createElement };
