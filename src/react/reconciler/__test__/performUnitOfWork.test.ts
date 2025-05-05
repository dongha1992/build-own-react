import { describe, expect, test } from 'vitest';
import { FiberNode } from '../../type.ts';
import { createElement } from '../../element';
import { RendererState } from '../../state';
import { __internal } from '../index.ts';

describe('performUnitOfWork', () => {
  test('string type에 대한 DOM을 생성하고 자식 node를 재조정한다.', () => {
    const state = new RendererState();
    const element = createElement(
      'div',
      {},
      createElement('p', {}, 'I am a Child'),
    );

    const fiberNode: FiberNode = {
      ...element,
      alternate: null,
      dom: null,
    } as any;

    const next = __internal.performUnitOfWork(fiberNode, state);
    expect(fiberNode.dom).toBeInstanceOf(HTMLElement);
    expect(next?.type).toBe('p');
  });
});
