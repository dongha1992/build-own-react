import { describe, expect, test } from 'vitest';
import { createDOM } from './index.ts';
import { FiberNode } from '../type.ts';

describe('createDOM', () => {
  test('type이 TEXT일 때 Text node를 생성한다.', () => {
    const fiber: FiberNode = {
      type: 'TEXT',
      props: { nodeValue: 'Hello' },
      alternate: null,
    };

    const dom = createDOM(fiber);
    expect(dom).toBeInstanceOf(Text);
  });

  test('type이 string일 때 HTMLElement를 생성한다.', () => {
    const fiber: FiberNode = {
      type: 'div',
      props: { id: 'test-div', title: 'test' },
      alternate: null,
    };

    const dom = createDOM(fiber);
    expect(dom).toBeInstanceOf(HTMLElement);
    expect((dom as HTMLElement).tagName).toBe('DIV');
    expect((dom as HTMLElement).id).toBe('test-div');
    expect((dom as HTMLElement).title).toBe('test');
  });
});
