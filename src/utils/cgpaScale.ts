export const CGPA_SCALE_MAX = 10;

/**
 * Normalizes a GPA/CGPA/SGPA value onto the 10-point scale.
 * - Legacy records stored on the 4.0 scale (0 < val <= 4.0) are scaled proportionally to 10.
 * - Native 10-point values (> 4.0) are preserved and clamped to [0, 10].
 */
export function normalizeToTenScale(
  value: number | string | null | undefined,
  options?: { explicitTenScale?: boolean }
): number {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return 0;

  if (!options?.explicitTenScale && num <= 4.0) {
    return Math.min(10, Math.round((num / 4.0) * 10 * 100) / 100);
  }

  return Math.min(10, Math.round(num * 100) / 100);
}

/**
 * Formats a GPA/CGPA/SGPA value strictly out of 10 (e.g., "9.60 / 10").
 */
export function formatOutOfTen(
  value: number | string | null | undefined,
  decimals = 2
): string {
  const normalized = normalizeToTenScale(value);
  if (normalized <= 0) return '—';
  return `${normalized.toFixed(decimals)} / 10`;
}
