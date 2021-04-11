const { mapExponential } = require('../math');

describe('mapExponential', () => {
  it('should map exponentially', () => {
    expect(mapExponential(1, 1, 10, 100, 1000000)).toBe(100);
    expect(mapExponential(2, 1, 10, 100, 1000000) < 1000).toBe(true);
    expect(mapExponential(3, 1, 10, 100, 1000000) < 1000).toBe(false);
    expect(mapExponential(9, 1, 10, 100, 1000000) > 100000).toBe(true);
  });

  it('should be within clamped values', () => {
    expect(mapExponential(0, 3, 10, 100, 1000000)).toBe(100);
    expect(mapExponential(-100, 3, 10, 100, 1000000)).toBe(100);

    expect(mapExponential(11, 3, 10, 100, 1000000)).toBe(1000000);
    expect(mapExponential(100, 3, 10, 100, 1000000)).toBe(1000000);
  });

  it('should not fail on zero input', () => {
    expect(mapExponential(10, 3, 10, 0, 3600000)).toBe(3600000);
  });

  it('should throw an error on bad input', () => {
    expect(() => {
      mapExponential();
    }).toThrow();
  });
});
