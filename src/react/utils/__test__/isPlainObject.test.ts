import { describe, expect, it } from 'vitest';
import { isPlainObject } from '../index.ts';

describe('isPlainObject', () => {
  it('object literals는 true를 반환한다.', () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({ test: 1 })).toBe(true);
  });

  it('Object.create(null)는 true를 반환한다.', () => {
    const obj = Object.create(null);
    obj.key = 'test';
    expect(isPlainObject(obj)).toBe(true);
  });

  it('new Object는 true를 반환한다.', () => {
    const obj = new Object({ test: 1 });
    expect(isPlainObject(obj)).toBe(true);
  });

  it('array는 false를 반환한다.', () => {
    expect(isPlainObject([])).toBe(false);
  });

  it('function은 false를 반환한다.', () => {
    expect(isPlainObject(() => {})).toBe(false);
    expect(isPlainObject(function () {})).toBe(false);
  });

  it('class instances는 false를 반환한다.', () => {
    class MyClass {}
    const instance = new MyClass();
    expect(isPlainObject(instance)).toBe(false);
  });

  it('null는 false를 반환한다.', () => {
    expect(isPlainObject(null)).toBe(false);
  });

  it('null는 false를 반환한다.', () => {
    expect(isPlainObject(null)).toBe(false);
  });

  it('primitives는 false를 반환한다.', () => {
    expect(isPlainObject('string')).toBe(false);
    expect(isPlainObject(123)).toBe(false);
    expect(isPlainObject(true)).toBe(false);
    expect(isPlainObject(undefined)).toBe(false);
  });

  it('built-in objects는 false를 반환한다.', () => {
    expect(isPlainObject(new Date())).toBe(false);
    expect(isPlainObject(new Map())).toBe(false);
    expect(isPlainObject(new Set())).toBe(false);
  });
});
