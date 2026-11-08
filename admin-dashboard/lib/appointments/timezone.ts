const TIME_ZONE = 'America/Toronto';

/**
 * Returns the offset of a time zone (in milliseconds) at a given instant.
 * Positive values mean the zone is ahead of UTC.
 */
function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const values: Record<string, number> = {};

  for (const part of formatter.formatToParts(date)) {
    if (part.type !== 'literal') {
      values[part.type] = Number(part.value);
    }
  }

  const wallClockAsUtc = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
    values.second,
  );

  return wallClockAsUtc - date.getTime();
}

/**
 * Converts Toronto wall-clock date/time strings (YYYY-MM-DD and HH:MM) into
 * the correct UTC instant, including daylight-saving transitions.
 */
export function torontoWallTimeToUtc(date: string, time: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);

  const wallClockAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0, 0);

  // First estimate, then re-check once in case the guess crossed a DST edge.
  let timestamp =
    wallClockAsUtc -
    getTimeZoneOffsetMs(new Date(wallClockAsUtc), TIME_ZONE);

  timestamp =
    wallClockAsUtc - getTimeZoneOffsetMs(new Date(timestamp), TIME_ZONE);

  return new Date(timestamp);
}
