import { describe, expect, test } from 'vitest';
import { createElement } from './index';
import { Fragment } from '../utils';

describe('createElement', () => {
  test('text를 포함한 기본적인 JSX 구조를 ReactElement로 반환한다.', () => {
    const element = createElement('div', { id: 'test' }, 'Hello', 'World');

    expect(element.type).toBe('div');
    expect(element.props.id).toBe('test');
    expect(element.props.children).toHaveLength(2);
    expect(element.props.children![0]).toEqual({
      type: 'TEXT',
      props: { nodeValue: 'Hello' },
    });
  });

  test('중첩 구조도 반환한다..', () => {
    const child = createElement('span', {}, 'Child');
    const parent = createElement('div', {}, child);

    expect(parent.props.children![0]).toBe(child);
  });

  test('Fragment도 인식하여 ReactElement로 반활한다.', () => {
    const frag = createElement(Fragment, {}, 'One', 'Two');
    expect(frag.type).toBe(Fragment);
    expect(frag.props.children).toHaveLength(2);
  });
});
