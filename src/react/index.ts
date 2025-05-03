import {
  FiberNode,
  FiberNodeDOM,
  LooseObject,
  VirtualReactElement,
  VirtualReactElementProps,
  VirtualReactElementType,
} from './type.ts';
import { isDefined, isVirtualReactElement } from './utils.ts';

export interface ComponentFunction {
  new (props: LooseObject): Component;
  (props: LooseObject): VirtualReactElement | string;
}

abstract class Component {
  props: LooseObject;
  abstract state: unknown;
  abstract setState: (value: unknown) => void;
  abstract render(): VirtualReactElement | string;

  constructor(props: LooseObject) {
    this.props = props;
  }

  static REACT_COMPONENT = true;
}

let wipRoot: FiberNode | null = null; // 작업 중인 루트 fiber 노드
let nextUnitOfWork: FiberNode | null = null;
let currentRoot: FiberNode | null = null;
let deletions: FiberNode[] = [];
let wipFiber: FiberNode; // 작업 중인 fiber 노드
let hookIndex = 0;

/**
 * requestIdleCallback: React의 scheduler를 모방함.
 * @example
 *
 */

((global: Window) => {
  let frameDeadLine: number;
  let pendingCallback: IdleRequestCallback;

  const id = 1;
  const targetFps = 60;
  const frameDuration = 1000 / targetFps; // 1프레임 당 16.67ms

  const channel = new MessageChannel(); // 매크로 태스크 생성
  const timeRemaining = () => frameDeadLine - window.performance.now();

  const deadline = {
    didTimeout: false,
    timeRemaining,
  };

  channel.port2.onmessage = () => {
    if (typeof pendingCallback === 'function') {
      pendingCallback(deadline);
    }
  };

  global.requestIdleCallback = (callback: IdleRequestCallback) => {
    global.requestAnimationFrame((frameTime) => {
      frameDeadLine = frameTime + frameDuration;
      pendingCallback = callback;
      channel.port1.postMessage(null);
    });
    return id;
  };
})(window);

const Fragment = Symbol.for('react.fragment');

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

/*
 * reconcileChildren: 가상 DOM과 diff 알고리즘으로 비교 수행. Fiber 노드를 생성 및 조정함
 *
 */
const reconcileChildren = (
  fiberNode: FiberNode,
  elements: Array<VirtualReactElement> = [],
) => {
  let index = 0;
  let oldFiberNode: FiberNode | undefined;
  let prevSibling: FiberNode | undefined;
  const virtualReactElements = elements.flat(Infinity);

  if (fiberNode.alternate?.child) {
    oldFiberNode = fiberNode.alternate.child;
  }

  while (
    index < virtualReactElements.length ||
    typeof oldFiberNode !== 'undefined'
  ) {
    const virtualReactElement = virtualReactElements[index];
    let newFiberNode: FiberNode | undefined;

    // 찐리액트는 key 비교로 처리함
    const isSameType = Boolean(
      oldFiberNode &&
        virtualReactElement &&
        oldFiberNode.type === virtualReactElement.type,
    );

    // update
    if (isSameType && oldFiberNode) {
      newFiberNode = {
        type: oldFiberNode.type,
        dom: oldFiberNode.dom,
        alternate: oldFiberNode,
        props: virtualReactElement.props,
        return: fiberNode,
        effectTag: 'UPDATE',
      };
    }

    // replacement
    if (!isSameType && virtualReactElement) {
      newFiberNode = {
        type: virtualReactElement.type,
        dom: null,
        alternate: null,
        props: virtualReactElement.props,
        return: fiberNode,
        effectTag: 'REPLACEMENT',
      };
    }

    //delete
    if (!isSameType && oldFiberNode) {
      deletions.push(oldFiberNode);
    }

    if (oldFiberNode) {
      oldFiberNode = oldFiberNode.sibling;
    }

    // 새로운 Fiber 트리 연결
    if (index === 0) {
      fiberNode.child = newFiberNode;
    } else if (typeof prevSibling !== 'undefined') {
      prevSibling.sibling = newFiberNode;
    }

    prevSibling = newFiberNode;
    index += 1;
  }
};

/*
 * commitRoot: Fiber 트리의 변경사항을 실제 DOM에 적용. React의 Reconciler에서 커밋 페이즈
 */
const commitRoot = () => {
  const findParentFiber = (fiberNode?: FiberNode) => {
    if (fiberNode) {
      let parentFiber = fiberNode.return;
      while (parentFiber && !parentFiber.dom) {
        parentFiber = parentFiber.return;
      }
      return parentFiber;
    }
    return null;
  };

  const commitDeletion = (
    parentDOM: FiberNodeDOM,
    DOM: NonNullable<FiberNodeDOM>,
  ) => {
    if (isDefined(parentDOM)) {
      parentDOM.removeChild(DOM);
    }
  };

  const commitReplacement = (
    parentDOM: FiberNodeDOM,
    DOM: NonNullable<FiberNodeDOM>,
  ) => {
    if (isDefined(parentDOM)) {
      parentDOM.appendChild(DOM);
    }
  };

  const commitWork = (fiberNode?: FiberNode) => {
    if (fiberNode) {
      if (fiberNode.dom) {
        const parentFiberNode = findParentFiber(fiberNode);
        const parentDOM = parentFiberNode?.dom;

        switch (fiberNode.effectTag) {
          case 'REPLACEMENT':
            commitReplacement(parentDOM, fiberNode.dom);
            break;
          case 'UPDATE':
            updateDOM(
              fiberNode.dom,
              fiberNode.alternate ? fiberNode.alternate.props : {},
              fiberNode.props,
            );
            break;
          default:
            break;
        }
      }
      commitWork(fiberNode.child);
      commitWork(fiberNode.sibling);
    }
  };

  for (const deletion of deletions) {
    if (deletion.dom) {
      const parentFiberNode = findParentFiber(deletion);
      commitDeletion(parentFiberNode?.dom, deletion.dom);
    }
  }

  if (wipRoot) {
    commitWork(wipRoot.child);
    currentRoot = wipRoot;
  }
  wipRoot = null;
};

/*
 * performUnitOfWork: 현재 Fiber 노드를 처리하고, 다음 Fiber 노드를 반환함
 *
 */
const performUnitOfWork = (fiberNode: FiberNode) => {
  const { type } = fiberNode;

  switch (typeof type) {
    case 'function': {
      wipFiber = fiberNode;
      wipFiber.hooks = [];
      hookIndex = 0;

      let children: ReturnType<ComponentFunction>;

      const isClassComponent = Object.getPrototypeOf(type).REACT_COMPONENT;

      if (isClassComponent) {
        const C = type;
        const component = new C(fiberNode.props);
        const [state, setState] = useState(component.state);
        component.props = fiberNode.props;
        component.state = state;
        component.setState = setState;
        children = component.render.bind(component)();
      } else {
        children = type(fiberNode.props);
      }

      reconcileChildren(fiberNode, [
        isVirtualReactElement(children)
          ? children
          : createTextElement(String(children)),
      ]);
      break;
    }
    case 'number':
    case 'string':
      if (!fiberNode.dom) {
        fiberNode.dom = createDOM(fiberNode);
      }
      reconcileChildren(fiberNode, fiberNode.props.children);
      break;
    case 'symbol':
      if (type === Fragment) {
        reconcileChildren(fiberNode, fiberNode.props.children);
      }
      break;
    default:
      if (typeof fiberNode.props !== 'undefined') {
        reconcileChildren(fiberNode, fiberNode.props.children);
      }
      break;
  }

  if (fiberNode.child) {
    return fiberNode.child;
  }

  let nextFiberNode: FiberNode | undefined = fiberNode;

  while (typeof nextFiberNode !== 'undefined') {
    if (nextFiberNode.sibling) {
      return nextFiberNode.sibling;
    }
    nextFiberNode = nextFiberNode?.return;
  }

  return null;
};

const workLoop: IdleRequestCallback = (deadline) => {
  while (nextUnitOfWork && deadline.timeRemaining() > 1) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  window.requestIdleCallback(workLoop);
};

/*
 * render: ReactElement를 실제 DOM으로 변환함.
 *
 */
const render = (
  reactElement: VirtualReactElement,
  containerDOMElement: Element,
) => {
  currentRoot = null;
  wipRoot = {
    type: 'div',
    dom: containerDOMElement,
    props: {
      children: [{ ...reactElement }],
    },
    alternate: currentRoot,
  };
  nextUnitOfWork = wipRoot;
  deletions = [];

  /** 아래 코드는 재귀로 동기적 작업함 **/

  // const DOM = createDOM(reactElement);
  //
  // if (Array.isArray(reactElement.props.children)) {
  //   for (const child of reactElement.props.children) {
  //     render(child, DOM);
  //   }
  // }
  //
  // containerDOMElement.appendChild(DOM);
};

function useState(initState: any) {
  const hook: { state: any; queue: any[] } = {
    state: initState,
    queue: [],
  };

  const setState = (value: any) => {
    hook.queue.push(value);
  };

  return [hook.state, setState];
}

function main() {
  window.requestIdleCallback(workLoop);
}

export default {
  createElement,
  render,
  useState,
  Component,
  Fragment,
};
