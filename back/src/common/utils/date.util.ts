// src/common/utils/date.util.ts

/**
 * Format a Date object into ISO string with timezone offset
 */
export function formatDateToISOString(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Get current UTC timestamp in milliseconds
 */
export function getCurrentUTCTimestamp(): number {
  return Date.now();
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Check if two dates are on the same day (ignores time)
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
