import { describe, expect, test } from 'vitest';
import { createElement } from '../element';
import { RendererState } from '../state';
import { FiberNode } from '../type';
import { __internal } from './index';

describe('reconcileChildren', () => {
  test('child FiberNode 트리를 생성한다.', () => {
    const state = new RendererState();

    const parent: FiberNode = {
      type: 'div',
      props: { children: [] },
      alternate: null,
    } as any;
    const childElement = createElement('p', {}, 'This is Child');

    __internal.reconcileChildren(parent, [childElement], state);

    expect(parent.child?.type).toBe('p');
    expect(parent.child?.props.children?.[0].props.nodeValue).toBe(
      'This is Child',
    );
    expect(parent.child?.effectTag).toBe('REPLACEMENT');
  });
});
