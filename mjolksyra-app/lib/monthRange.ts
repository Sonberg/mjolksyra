import dayjs from "dayjs";

export function monthRange(year: number, month: number) {
  const start = dayjs().date(1).year(year).month(month).startOf("month");
  const end = start.endOf("month");

  return {
    start,
    end,
  };
}
