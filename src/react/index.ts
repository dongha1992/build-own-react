import {
  LooseObject,
  VirtualReactElement,
  VirtualReactElementType,
} from './type.ts';

class Component {}

const Fragment = Symbol.for('react.fragment');

export interface ComponentFunction {
  new (props: LooseObject): Component;
  (props: LooseObject): VirtualReactElement | string;
}

const isVirtualReactElement = (e: unknown): e is VirtualReactElement =>
  typeof e === 'object';

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
  ...children: VirtualReactElement[]
): VirtualReactElement => {
  const normalizedChildren = children.map((c) => {
    isVirtualReactElement(c) ? c : createTextElement(String(c));
  });

  return {
    type,
    props: {
      ...props,
      normalizedChildren,
    },
  };
};

const render = () => {};

function useState() {}

export default {
  createElement,
  render,
  useState,
  Component,
  Fragment,
};
