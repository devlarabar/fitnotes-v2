/**
 * Convert a time string to total seconds.
 * Handles both H:MM:SS and legacy MM:SS formats.
 */
export function timeToSeconds(time: string): number {
  const parts = time.split(':').map(Number);
  if (parts.length === 3) {
    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  }
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

/**
 * Format raw digit input into H:MM:SS (right-to-left).
 * E.g. "530" → "0:05:30", "13000" → "1:30:00"
 */
export function formatTimeInput(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';

  const padded = digits.padStart(5, '0');
  const secs = padded.slice(-2);
  const mins = padded.slice(-4, -2);
  const hours = padded.slice(0, -4);

  return `${parseInt(hours) || 0}:${mins}:${secs}`;
}

/**
 * Normalize time for DB insertion.
 * Returns null for non-time exercises or empty/zero values.
 * Returns H:MM:SS string for valid time values.
 */
export function normalizeTimeForDb(
  time: string | null | undefined,
  measurementType?: string
): string | null {
  const type = measurementType?.toLowerCase();
  if (type !== 'time' && type !== 'distance') {
    return null;
  }
  if (!time || time === '0:00:00') {
    return null;
  }
  return time;
}
