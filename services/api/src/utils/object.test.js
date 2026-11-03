import { get, set } from './object.js';

describe('get', () => {
  it('should read dot string and array paths', () => {
    const obj = { user: [{ name: 'Bob' }] };
    expect(get(obj, 'user.0.name')).toBe('Bob');
    expect(get(obj, ['user', 0, 'name'])).toBe('Bob');
    expect(get(obj, 'user.1.name', 'none')).toBe('none');
  });
});

describe('set', () => {
  it('should create objects and arrays along the path', () => {
    expect(set({}, 'a.0.b', 1)).toEqual({ a: [{ b: 1 }] });
  });

  it('should ignore an empty path', () => {
    expect(set({ a: 1 }, [], 2)).toEqual({ a: 1 });
  });

  it('should not write to prototypes', () => {
    set({}, ['__proto__', 'polluted'], true);
    set({}, ['constructor', 'prototype', 'polluted'], true);
    expect({}.polluted).toBeUndefined();
  });
});
