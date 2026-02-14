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
  if (!time || time === '00:00:00') {
    return null;
  }
  return time;
}
