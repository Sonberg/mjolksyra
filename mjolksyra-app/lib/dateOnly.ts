import { PLANNED_AT } from "@/constants/dateFormats";
import dayjs from "dayjs";

export function dateOnly(date: dayjs.Dayjs) {
  return date.format(PLANNED_AT);
}
