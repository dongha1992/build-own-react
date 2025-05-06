import { HookInFiberNode, VirtualReactElement } from './type.ts';
import { Fragment, isDefined, isPlainObject } from './utils';
import { createElement } from './element';
import { Component } from './component';
import { __internal } from './reconciler';
import { RendererState } from './state';

const state = new RendererState();

/**
 * 메인 스레드를 점유하지 않은 requestIdleCallback (React의 scheduler를 모방함)
 * @example
 * window.requestIdleCallback((deadline) => {
 *   console.log(`남은 시간: ${deadline.timeRemaining()}ms`);
 * });
 */
((global: Window) => {
  let frameDeadline: number;
  let pendingCallback: IdleRequestCallback;

  const id = 1;
  const targetFps = 60;
  const frameDuration = 1000 / targetFps; // 1프레임 당 16.67ms

  const channel = new MessageChannel(); // 매크로 태스크 생성
  const timeRemaining = () => frameDeadline - window.performance.now();

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
      frameDeadline = frameTime + frameDuration;
      pendingCallback = callback;
      channel.port1.postMessage(null);
    });
    return id;
  };
})(window);

/**
 * 루트 Fiber 노드 생성
 *
 * 실제 렌더링 작업은 workLoop와 performUnitOfWork를 통해 비동기적으로 처리됨
 * @param reactElement - createElement로 반환된 가상 돔
 * @param containerDOMElement - 생성된 DOM을 렌더링할 실제 DOM 컨테이너 요소
 */
const render = (
  reactElement: VirtualReactElement,
  containerDOMElement: Element,
) => {
  state.currentRoot = null;
  state.workInProgressFiberRoot = {
    type: 'div',
    dom: containerDOMElement,
    props: {
      children: [{ ...reactElement }],
    },
    alternate: state.currentRoot,
  };
  state.nextUnitOfWork = state.workInProgressFiberRoot;
  state.deletions = [];
};

function useState<T>(initState: T): [T, (value: T) => void] {
  const fiberNode = state.workInProgressFiber;

  const initialHook = {
    state: initState,
    queue: [],
  };

  const hook: HookInFiberNode<T> = fiberNode?.alternate?.hooks
    ? fiberNode.alternate.hooks[state.hookIndex]
    : initialHook;

  while (hook.queue.length) {
    let newState = hook.queue.shift();
    if (isPlainObject(hook.state) && isPlainObject(newState)) {
      newState = { ...hook.state, ...newState };
    }
    if (isDefined(newState)) {
      hook.state = newState;
    }
  }

  if (typeof fiberNode?.hooks === 'undefined') {
    // TODO: type fix
    fiberNode!.hooks = [];
  }

  fiberNode?.hooks.push(hook);
  state.hookIndex += 1;

  const setState = (value: T) => {
    hook.queue.push(value);

    if (state.currentRoot) {
      state.workInProgressFiberRoot = {
        type: state.currentRoot.type,
        dom: state.currentRoot.dom,
        props: state.currentRoot.props,
        alternate: state.currentRoot,
      };
      state.nextUnitOfWork = state.workInProgressFiberRoot;
      state.deletions = [];
      state.currentRoot = null;
    }
  };

  return [hook.state, setState];
}

(function main() {
  window.requestIdleCallback((deadline) =>
    __internal.workLoop(deadline, state),
  );
})();

export default {
  createElement,
  render,
  useState,
  Component,
  Fragment,
};
