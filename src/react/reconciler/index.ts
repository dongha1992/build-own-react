import React from '../index';
import { FiberNode, FiberNodeDOM, VirtualReactElement } from '../type.ts';
import { Fragment, isDefined, isVirtualReactElement } from '../utils';
import { createDOM, updateDOM } from '../dom';
import { ComponentFunction } from '../component';
import { createTextElement } from '../element';
import { RendererState } from '../state';

/**
 * 부모 Fiber 노드와 자식 가상 리액트 엘리먼트를 비교하여 Fiber 트리를 조정함.
 *
 * 가상 DOM 비교를 수행
 * @param fiberNode 부모 Fiber 노드
 * @param elements DOM에 렌더링하려는 리액트 요소들
 * @param state 렌더링 상태 객체
 */
const reconcileChildren = (
  fiberNode: FiberNode,
  elements: Array<VirtualReactElement> = [],
  state: RendererState,
) => {
  let index = 0;
  let oldFiberNode: FiberNode | undefined; // 마지막으로 렌더링한 Fiber
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

    /**
     *  type이 같은 컴포넌트는 재사용하는 휴리스틱 알고리즘 모방.
     *
     *  찐 리액트는 key 비교도 추가하여 처리함.
     */
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
      state.deletions.push(oldFiberNode);
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

/**
 * Fiber 트리의 변경사항을 실제 DOM에 적용.
 * React의 Reconciler에서 커밋 페이즈.
 *
 * (current = workInProgress로 교체)
 * @param state 렌더링 상태 객체
 */
const commitRoot = (state: RendererState) => {
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
        // 함수 컴포넌트는 DOM 노드가 없으므로, 부모 Fiber를 탐색해 DOM 노드가 있는 부모 찾음.
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

  for (const deletion of state.deletions) {
    if (deletion.dom) {
      // 함수 컴포넌트는 DOM 노드가 없으므로, 부모 Fiber를 탐색해 DOM 노드가 있는 부모 찾음.
      const parentFiberNode = findParentFiber(deletion);
      commitDeletion(parentFiberNode?.dom, deletion.dom);
    }
  }

  if (state.workInProgressFiberRoot) {
    commitWork(state.workInProgressFiberRoot.child);
    state.currentRoot = state.workInProgressFiberRoot;
  }
  state.workInProgressFiberRoot = null;
};

/**
 * 현재 Fiber 노드를 처리하고, 다음 Fiber 노드를 반환함.
 * @param fiberNode 현재 처리할 Fiber 노드
 * @param state 렌더링 상태 객체
 * @returns 다음 처리할 Fiber 노드 또는 null
 */
const performUnitOfWork = (fiberNode: FiberNode, state: RendererState) => {
  const { type } = fiberNode;

  switch (typeof type) {
    case 'function': {
      state.workInProgressFiber = fiberNode;
      state.workInProgressFiber.hooks = [];
      state.hookIndex = 0;

      let children: ReturnType<ComponentFunction>;

      const isClassComponent = Object.getPrototypeOf(type).REACT_COMPONENT;

      if (isClassComponent) {
        const C = type;
        const component = new C(fiberNode.props);
        const [state, setState] = React.useState(component.state);
        component.props = fiberNode.props;
        component.state = state;
        component.setState = setState;
        children = component.render.bind(component)();
      } else {
        children = type(fiberNode.props); // 함수를 호출해 자식 요소 배열 반환.
      }

      reconcileChildren(
        fiberNode,
        [
          isVirtualReactElement(children)
            ? children
            : createTextElement(String(children)),
        ],
        state,
      );
      break;
    }
    case 'number':
    case 'string':
      if (!fiberNode.dom) {
        fiberNode.dom = createDOM(fiberNode);
      }
      reconcileChildren(fiberNode, fiberNode.props.children, state);
      break;
    case 'symbol':
      if (type === Fragment) {
        reconcileChildren(fiberNode, fiberNode.props.children, state);
      }
      break;
    default:
      if (typeof fiberNode.props !== 'undefined') {
        reconcileChildren(fiberNode, fiberNode.props.children, state);
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

/**
 * 작업 단위를 처리하며 렌더링 루프를 실행함.
 *
 * 남은 시간이 충분할 때까지 Fiber 노드를 처리하고, 완료 시 DOM 커밋
 * @param deadline 현재 프레임의 데드라인 객체
 * @param state 렌더링 상태 객체
 */
const workLoop = (deadline: IdleDeadline, state: RendererState) => {
  while (state.nextUnitOfWork && deadline.timeRemaining() > 1) {
    state.nextUnitOfWork = performUnitOfWork(state.nextUnitOfWork, state);
  }

  if (!state.nextUnitOfWork && state.workInProgressFiberRoot) {
    commitRoot(state);
  }

  window.requestIdleCallback((nextDeadline) => workLoop(nextDeadline, state));
};

export const __internal = {
  performUnitOfWork,
  reconcileChildren,
  commitRoot,
  workLoop,
};
