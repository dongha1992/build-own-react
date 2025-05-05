import { describe, expect, test, vi } from 'vitest';
import { VirtualReactElementProps } from '../type.ts';
import { updateDOM } from './index.ts';

describe('updateDOM', () => {
  test('prevProps를 제거하고 newProps를 추가한다.', () => {
    const dom = document.createElement('button');

    const prevProps: VirtualReactElementProps = {
      id: 'old',
      title: 'Old title',
      onClick: vi.fn(),
      children: [],
    };

    const nextProps: VirtualReactElementProps = {
      id: 'new',
      onMouseOver: vi.fn(),
      children: [],
    };

    dom.addEventListener('click', prevProps.onClick as EventListener);

    updateDOM(dom, prevProps, nextProps);

    expect(dom.id).toBe('new');
    expect(dom.title).toBe('');

    const clickEvent = new Event('click');
    dom.dispatchEvent(clickEvent);
    expect(prevProps.onClick).not.toHaveBeenCalled();
  });

  test('children prop은 변경하지 않는다.', () => {
    const dom = document.createElement('span');
    const prevProps: VirtualReactElementProps = {
      children: [],
      className: 'red',
    };
    const nextProps: VirtualReactElementProps = {
      children: [],
      className: 'blue',
    };

    updateDOM(dom, prevProps, nextProps);
    expect(dom.className).toBe('blue');
  });
});
