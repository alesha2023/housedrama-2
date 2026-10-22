export type AudienceDay = { date: string; visitors: number };

export function fillDaily(dates: string[], rows: AudienceDay[]): AudienceDay[] {
  const counts = new Map(rows.map((row) => [row.date, row.visitors]));
  return dates.map((date) => ({ date, visitors: counts.get(date) ?? 0 }));
}

export function jakartaDates(days: number, today: string): string[] {
  const [year, month, day] = today.split("-").map(Number);
  const cursor = new Date(Date.UTC(year, month - 1, day));
  const dates: string[] = [];
  for (let index = days - 1; index >= 0; index -= 1) {
    const next = new Date(cursor);
    next.setUTCDate(cursor.getUTCDate() - index);
    dates.push(next.toISOString().slice(0, 10));
  }
  return dates;
}
