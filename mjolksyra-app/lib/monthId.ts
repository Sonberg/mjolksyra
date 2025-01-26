import dayjs from "dayjs";

export function monthId(plannedAt: string) {
  const parsed = dayjs(plannedAt);
  const year = parsed.year();
  const month = parsed.month();

  return `${year}-${month}`;
}
