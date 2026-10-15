export type Units = 'us' | 'metric';

export type BmiCategory = 'underweight' | 'healthy' | 'overweight' | 'obese';

const CM_PER_INCH = 2.54;
const KG_PER_POUND = 0.45359237;

export function inchesToCm(inches: number): number {
  return inches * CM_PER_INCH;
}

export function cmToInches(cm: number): number {
  return cm / CM_PER_INCH;
}

export function poundsToKg(pounds: number): number {
  return pounds * KG_PER_POUND;
}

export function kgToPounds(kg: number): number {
  return kg / KG_PER_POUND;
}

/** Splits a height in centimeters into whole feet and inches, rounded to the nearest inch. */
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = Math.round(cmToInches(cm));
  return { feet: Math.floor(totalInches / 12), inches: totalInches % 12 };
}

/** BMI = weight (kg) / height (m)². Returns null for heights or weights outside a plausible adult range. */
export function calculateBmi(heightCm: number, weightKg: number): number | null {
  if (!Number.isFinite(heightCm) || !Number.isFinite(weightKg)) return null;
  if (heightCm < 100 || heightCm > 250 || weightKg < 25 || weightKg > 350) return null;
  const meters = heightCm / 100;
  return weightKg / (meters * meters);
}

/** WHO adult categories. */
export function bmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'healthy';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

export const BMI_CATEGORY_LABELS: Record<BmiCategory, string> = {
  underweight: 'Underweight',
  healthy: 'Healthy weight',
  overweight: 'Overweight',
  obese: 'Obesity',
};

export const BMI_CATEGORY_RANGES: Record<BmiCategory, string> = {
  underweight: 'Below 18.5',
  healthy: '18.5 to 24.9',
  overweight: '25 to 29.9',
  obese: '30 or higher',
};

/** The weight range, in kg, that gives a BMI from 18.5 to 24.9 at this height. */
export function healthyWeightRangeKg(heightCm: number): { min: number; max: number } {
  const meters = heightCm / 100;
  return { min: 18.5 * meters * meters, max: 24.9 * meters * meters };
}
