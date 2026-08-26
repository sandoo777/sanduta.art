import { calcConsumed, calcLinePrice } from '../utils';

test('calcConsumed applies waste correctly', () => {
  expect(calcConsumed(100, 2)).toBeCloseTo(102.040816, 6);
});

test('calcConsumed throws on invalid waste', () => {
  expect(() => calcConsumed(10, 100)).toThrow();
});

test('calcLinePrice computes price with waste', () => {
  expect(calcLinePrice(10, 100, 2)).toBeCloseTo(1020.40816, 4);
});
