import { describe, expect, it } from '@jest/globals';

import { bmiCategory, calculateBmi, cmToFeetInches, healthyWeightRangeKg, inchesToCm, poundsToKg } from '../bmi';

describe('calculateBmi', () => {
  it('matches the standard formula', () => {
    expect(calculateBmi(180, 81)).toBeCloseTo(25, 5);
  });

  it('gives the same answer from US units', () => {
    const bmi = calculateBmi(inchesToCm(70), poundsToKg(160));
    expect(bmi).toBeCloseTo(22.96, 1);
  });

  it('rejects implausible input', () => {
    expect(calculateBmi(0, 70)).toBeNull();
    expect(calculateBmi(170, 5)).toBeNull();
    expect(calculateBmi(Number.NaN, 70)).toBeNull();
  });
});

describe('bmiCategory', () => {
  it('uses the WHO cut-offs', () => {
    expect(bmiCategory(18.4)).toBe('underweight');
    expect(bmiCategory(18.5)).toBe('healthy');
    expect(bmiCategory(24.9)).toBe('healthy');
    expect(bmiCategory(25)).toBe('overweight');
    expect(bmiCategory(30)).toBe('obese');
  });
});

describe('unit helpers', () => {
  it('splits centimeters into feet and inches', () => {
    expect(cmToFeetInches(inchesToCm(71))).toEqual({ feet: 5, inches: 11 });
  });

  it('gives a healthy range that brackets 18.5 to 24.9', () => {
    const { min, max } = healthyWeightRangeKg(175);
    expect(calculateBmi(175, min)).toBeCloseTo(18.5, 5);
    expect(calculateBmi(175, max)).toBeCloseTo(24.9, 5);
  });
});
