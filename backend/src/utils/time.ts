/**
 * Utility functions for date/time handling in UTC
 */

/**
 * Converts local date and time to UTC Date object
 * @param date - YYYY-MM-DD format
 * @param time - HH:mm format
 * @returns UTC Date
 */
export function parseLocalDateTimeToUTC(date: string, time: string): Date {
  const datetime = `${date}T${time}:00`;
  return new Date(datetime);
}

/**
 * Converts ISO 8601 string to UTC Date
 * @param iso - ISO 8601 datetime string
 * @returns UTC Date
 */
export function parseISOToUTC(iso: string): Date {
  return new Date(iso);
}

/**
 * Validates that start time is before end time
 */
export function validateTimeRange(start: Date, end: Date): boolean {
  return start < end;
}
