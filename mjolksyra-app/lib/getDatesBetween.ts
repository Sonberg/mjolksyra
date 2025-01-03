import dayjs from "dayjs";

export function getDatesBetween(startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) {
  const dates = [];

  let current = startDate;

  while (current.isBefore(endDate) || current.isSame(endDate, "day")) {
    dates.push(current);
    current = current.add(1, "day");
  }

  return dates;
}
