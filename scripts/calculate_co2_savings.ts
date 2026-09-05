/**
 * ESG Carbon Offset & Saved Compute Calculator
 */
export function calculateImpactMetrics(dollarsRescued: number) {
  const kwhSaved = dollarsRescued * 2.4;
  const co2OffsetKg = dollarsRescued * 0.95;
  return { dollarsRescued, kwhSaved, co2OffsetKg };
}
