const SWEDISH_DATE_PATTERN = /^(\d{1,2})\s+([a-zåäö]+)\s+(\d{4})$/;

const SWEDISH_MONTHS: Record<string, number> = {
  januari: 0,
  februari: 1,
  mars: 2,
  april: 3,
  maj: 4,
  juni: 5,
  juli: 6,
  augusti: 7,
  september: 8,
  oktober: 9,
  november: 10,
  december: 11,
};

export function parseSwedishDate(input: string): Date | null {
  const match = input.trim().toLowerCase().match(SWEDISH_DATE_PATTERN);
  if (!match) {
    return null;
  }
  const month = SWEDISH_MONTHS[match[2]];
  if (month === undefined) {
    return null;
  }
  return new Date(Date.UTC(Number(match[3]), month, Number(match[1])));
}

export function parseSwedishDateEndOfDay(input: string): Date | null {
  const date = parseSwedishDate(input);
  if (!date) {
    return null;
  }
  date.setUTCHours(23, 59, 59, 0);
  return date;
}
