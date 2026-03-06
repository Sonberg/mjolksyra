import dayjs from "dayjs";

export function monthId(plannedAt: string | Date | dayjs.Dayjs) {
  const parsed = dayjs(plannedAt);
  const year = parsed.year();
  const month = parsed.month();

  return `${year}-${month}`;
}
