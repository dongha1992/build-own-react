import { FiberNode, FiberNodeDOM, VirtualReactElementProps } from '../type.ts';

const updateDOM = (
  DOM: NonNullable<FiberNodeDOM>,
  prevProps: VirtualReactElementProps,
  nextProps: VirtualReactElementProps,
) => {
  const DEFAULT_PROP_KEY = 'children';

  for (const [prevPropKey, prevPropValue] of Object.entries(prevProps)) {
    if (prevPropKey.startsWith('on')) {
      DOM.removeEventListener(
        prevPropKey.substring(2).toLowerCase(),
        prevPropValue as EventListener,
      );
    } else if (prevPropKey !== DEFAULT_PROP_KEY) {
      (DOM as any)[prevPropKey] = '';
    }
  }

  for (const [nextPropKey, nextPropValue] of Object.entries(nextProps)) {
    if (nextPropKey.startsWith('on')) {
      DOM.addEventListener(
        nextPropKey.substring(2).toLowerCase(),
        nextPropValue as EventListener,
      );
    } else if (nextPropKey !== DEFAULT_PROP_KEY) {
      (DOM as any)[nextPropKey] = nextPropValue;
    }
  }
};

const createDOM = (fiberNode: FiberNode) => {
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

export { createDOM, updateDOM };
