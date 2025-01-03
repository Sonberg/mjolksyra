import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import useOnScreen from "@/lib/hooks/useOnScreen";
import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDatesBetween } from "@/lib/getDatesBetween";

export function WorkoutSidebar() {
  const [previousHeight, setPreviousHeight] = useState<number | null>(null);
  const [dates, setDates] = useState<dayjs.Dayjs[]>(() => {
    const today = dayjs();
    const startOfWeek = today.startOf("month");
    const endOfWeek = today.endOf("month");

    return getDatesBetween(startOfWeek, endOfWeek);
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const start = useOnScreen();
  const end = useOnScreen();

  useEffect(() => {
    if (!start.isIntersecting) {
      return;
    }

    setPreviousHeight(containerRef.current?.scrollHeight ?? null);
    setDates((state) => {
      const day = state[0].add(-1, "day");
      const startOfWeek = day.startOf("month");
      const endOfWeek = day.endOf("month");
      const newDates = getDatesBetween(startOfWeek, endOfWeek);

      return [...newDates, ...state];
    });
  }, [start.isIntersecting]);

  useEffect(() => {
    if (!end.isIntersecting) {
      return;
    }

    setPreviousHeight(null);
    setDates((state) => {
      const day = state[state.length - 1].add(1, "day");
      const startOfWeek = day.startOf("month");
      const endOfWeek = day.endOf("month");
      const newDates = getDatesBetween(startOfWeek, endOfWeek);

      return [...state, ...newDates];
    });
  }, [end.isIntersecting]);

  useEffect(() => {
    if (previousHeight === null) {
      return;
    }

    const scrollHeight = containerRef.current!.scrollHeight;
    const scrollTop = scrollHeight - previousHeight;

    containerRef.current!.scroll({ top: scrollTop });
  }, [previousHeight]);

  const inPast = useCallback((date: dayjs.Dayjs) => {
    const today = dayjs();

    return (
      date.isBefore(today) &&
      today.format("YYYY-MM-DD") != date.format("YYYY-MM-DD")
    );
  }, []);

  const showYear = useCallback(
    (date: dayjs.Dayjs) => {
      const firstDayOfYear = dates.find(
        (x) => x.month() === 0 && x.date() == 1 && x.year() == date.year()
      );

      return firstDayOfYear === date || dates[0] === date;
    },
    [dates]
  );

  return (
    <div ref={containerRef} className="overflow-y-scroll  h-full">
      <div className="w-full h-1" ref={start.measureRef} />

      {dates.map((x) => (
        <Fragment key={x.toISOString()}>
          {showYear(x) ? (
            <div
              key={x.format("YYYY")}
              className="text-base font-bold mt-8 py-2 px-6 sticky top-0 bg-background shadow-lg z-10"
            >
              {x.format("YYYY")}
            </div>
          ) : null}
          <div
            key={x.toISOString()}
            className={cn({
              "py-4": true,
              "px-6": true,
              "opacity-60": inPast(x),
            })}
          >
            <div className="flex justify-between items-center">
              <div className={cn("text-base")}>{x.format("MMMM D")}</div>
              <div>
                <div className="rounded-full cursor-pointer hover:bg-border p-1">
                  <PlusIcon height={16} width={16} />
                </div>
              </div>
            </div>
            <div className="pt-2 pb-6 text-zinc-400">No workout planned</div>
          </div>
        </Fragment>
      ))}

      <div className="w-full h-1" ref={end.measureRef} />
    </div>
  );
}
