const weekdayClass = "text-sm  p-1";

export function WeekDayNames() {
  return (
    <div className="grid grid-cols-7 text-center">
      <div className={weekdayClass}>Mon</div>
      <div className={weekdayClass}>Tue</div>
      <div className={weekdayClass}>Wed</div>
      <div className={weekdayClass}>Thu</div>
      <div className={weekdayClass}>Fri</div>
      <div className={weekdayClass}>Sat</div>
      <div className={weekdayClass}>Sun</div>
    </div>
  );
}
