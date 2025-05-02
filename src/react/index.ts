import {
  LooseObject,
  VirtualReactElement,
  VirtualReactElementProps,
  VirtualReactElementType,
} from './type.ts';

class Component {}

const Fragment = Symbol.for('react.fragment');

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
  ...children: any[]
): VirtualReactElement => {
  const normalizedChildren: any = children.map((c) =>
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

const updateDOM = (
  DOM: any,
  prevProps: VirtualReactElementProps,
  nextProps: VirtualReactElementProps,
) => {
  const DEFAULT_PROP_KEY = 'children';

  for (const [prevPropKey, prevPropValue] of Object.entries(prevProps)) {
    if (prevPropKey.startsWith('on')) {
      DOM.removeEventListener(
        prevPropKey.substring(2).toLowerCase(),
        prevPropValue,
      );
    } else if (prevPropKey !== DEFAULT_PROP_KEY) {
      DOM[prevPropKey] = '';
    }
  }

  for (const [nextPropKey, nextPropValue] of Object.entries(nextProps)) {
    if (nextPropKey.startsWith('on')) {
      DOM.addEventListener(
        nextPropKey.substring(2).toLowerCase(),
        nextPropValue,
      );
    } else if (nextPropKey !== DEFAULT_PROP_KEY) {
      DOM[nextPropKey] = nextPropValue;
    }
  }
};

const createDOM = (fiberNode: any) => {
  const { type, props } = fiberNode;
  let DOM = null;

  if (type === 'TEXT') {
    DOM = document.createTextNode('');
  } else if (typeof type === 'string') {
    DOM = document.createElement(type);
  }

  if (DOM !== null) {
    updateDOM(DOM, {}, props);
  }

  return DOM;
};

/*
 * render: ReactElement를 실제 DOM으로 변환함.
 *
 */

const render = (
  reactElement: VirtualReactElement,
  containerDOMElement: any,
) => {
  const DOM = createDOM(reactElement);

  if (DOM && Array.isArray(reactElement.props.children)) {
    for (const child of reactElement.props.children) {
      render(child, DOM);
    }
  }

  containerDOMElement.appendChild(DOM);
};

function useState() {}

export default {
  createElement,
  render,
  useState,
  Component,
  Fragment,
};
