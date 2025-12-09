import { forwardRef, useRef, useEffect, useImperativeHandle } from "react";
import { MONTHS } from "../utils/calculations";

type WeekInfo = {
  week: string;
  date: string;
};

type TimelineProps = {
  onTimeLengthChange: (weeks: number) => void;
  weekInfo: WeekInfo[];
};

export type TimelineHandle = {
  timelineScrollRef: HTMLDivElement | null;
  timelineVisualization: HTMLDivElement | null;
  fromLabel: HTMLHeadingElement | null;
  toLabel: HTMLHeadingElement | null;
  timelineScrollBarRef: HTMLDivElement | null;
};

const Timeline = forwardRef<TimelineHandle, TimelineProps>(
  ({ onTimeLengthChange, weekInfo }, ref) => {
    const week1Ref = useRef<HTMLButtonElement>(null);
    const month1Ref = useRef<HTMLButtonElement>(null);
    const month3Ref = useRef<HTMLButtonElement>(null);
    const month6Ref = useRef<HTMLButtonElement>(null);
    const year1Ref = useRef<HTMLButtonElement>(null);
    const year2Ref = useRef<HTMLButtonElement>(null);
    const year5Ref = useRef<HTMLButtonElement>(null);
    const year10Ref = useRef<HTMLButtonElement>(null);
    const timelineScrollRef = useRef<HTMLDivElement>(null);
    const timelineVisualizationRef = useRef<HTMLDivElement>(null);
    const fromLabel = useRef<HTMLHeadingElement>(null);
    const toLabel = useRef<HTMLHeadingElement>(null);
    const timelineScrollBarRef = useRef<HTMLDivElement>(null);

    // Expose the timeline visualization ref to parent
    useImperativeHandle(ref, () => ({
      timelineScrollRef: timelineScrollRef.current,
      timelineVisualization: timelineVisualizationRef.current,
      fromLabel: fromLabel.current,
      toLabel: toLabel.current,
      timelineScrollBarRef: timelineScrollBarRef.current,
    }));

    // Render timeline visualization once when weekInfo is available
    useEffect(() => {
      if (!weekInfo.length || !timelineVisualizationRef.current) return;

      // console.log("Rendering timeline for weekInfo:", weekInfo);

      const container = timelineVisualizationRef.current;
      container.innerHTML = ""; // Clear any existing content

      // Calculate years from week data (assuming ~52 weeks per year)
      const totalYears = Math.ceil(weekInfo.length / 52.25);
      const startYear = parseInt(weekInfo[0].date.slice(0, 4)); // Adjust based on your data

      // Create year markers
      for (let i = 0; i < totalYears; i++) {
        // Count how many weeks in weekInfo belong to this year
        const currentYear = startYear + i;
        const weeksInYear = weekInfo.filter((w) =>
          w.date.startsWith(currentYear.toString())
        ).length;

        const yearDiv = document.createElement("div");
        yearDiv.className =
          "year absolute h-full border-r border-[rgba(255,255,255,0.1)] overflow-hidden";

        // Calculate left and width so markers fill the container edge-to-edge
        const leftPercent =
          (weekInfo.slice(
            0,
            weekInfo.findIndex((w) =>
              w.date.startsWith((startYear + i).toString())
            )
          ).length /
            weekInfo.length) *
          100;
        const widthPercent = (weeksInYear / weekInfo.length) * 100;

        yearDiv.style.left = `${leftPercent}%`;
        yearDiv.style.width = `${widthPercent}%`;
        yearDiv.innerHTML = `<div class="absolute top-3 left-3.5 text-[16px] text-[rgba(255,255,255,0.5)]">${currentYear}</div>`;

        // Define months and days for the current year
        const monthsOfYear = MONTHS.map((month, i) => ({
          month: month.name,
          days: i === 1 && currentYear % 4 === 0 ? month.days + 1 : month.days,
        }));
        const totalDaysInYear = monthsOfYear.reduce(
          (sum, m) => sum + m.days,
          0
        );

        for (let j = 1; j <= 12; j++) {
          const monthDiv = document.createElement("div");
          monthDiv.className =
            "month absolute top-0 w-0 h-full overflow-hidden";

          // Calculate the left position based on cumulative days of previous months
          const months = monthsOfYear.slice(0, j - 1);
          const daysBefore = months.reduce((sum, m) => sum + m.days, 0);
          const monthLeftPercent = (daysBefore / totalDaysInYear) * 100;
          monthDiv.style.left = `${monthLeftPercent}%`;
          monthDiv.style.width = `${
            (monthsOfYear[j - 1].days / totalDaysInYear) * 100
          }%`; //adjust this and left to match actual amount of days in month
          monthDiv.style.borderRight =
            j === 12 ? "none" : "1px dashed rgba(255, 255, 255, 0.05)";
          monthDiv.innerHTML = `<div class="absolute bottom-3 left-3.5 text-[16px] text-[rgba(255,255,255,0.3)]">${
            monthsOfYear[j - 1].month
          }</div>`;

          yearDiv.appendChild(monthDiv);
        }

        container.appendChild(yearDiv);
      }
    }, [weekInfo]);

    useEffect(() => {
      const handleTimeClick = (
        weeks: number,
        clickedRef: React.RefObject<HTMLButtonElement | null>
      ) => {
        const refs = [
          week1Ref,
          month1Ref,
          month3Ref,
          month6Ref,
          year1Ref,
          year2Ref,
          year5Ref,
          year10Ref,
        ];

        refs.forEach((ref) => {
          ref.current?.classList.remove("active");
        });

        clickedRef.current?.classList.add("active");
        onTimeLengthChange(weeks);
      };

      const handlers = [
        { ref: week1Ref, weeks: 1 },
        { ref: month1Ref, weeks: 4 },
        { ref: month3Ref, weeks: 13 },
        { ref: month6Ref, weeks: 26 },
        { ref: year1Ref, weeks: 52 },
        { ref: year2Ref, weeks: 104 },
        { ref: year5Ref, weeks: 260 },
        { ref: year10Ref, weeks: 520 },
      ];

      const clickHandlers = handlers.map(({ ref, weeks }) => {
        const handler = () => handleTimeClick(weeks, ref);
        ref.current?.addEventListener("click", handler);
        return { ref, handler };
      });

      return () => {
        clickHandlers.forEach(({ ref, handler }) => {
          ref.current?.removeEventListener("click", handler);
        });
      };
    }, [onTimeLengthChange]);

    return (
      <div className="w-full h-full p-1">
        <div className="relative w-full h-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.15)] rounded-lg overflow-hidden flex flex-col items-stretch">
          <div className="h-10 border-b border-[rgba(255,255,255,0.15)] flex items-stretch">
            <button
              className="flex justify-center items-center px-2.5 border-r border-[rgba(255,255,255,0.15)]"
              ref={week1Ref}
            >
              <h3>1W</h3>
            </button>
            <button
              className="flex justify-center items-center px-2.5 border-r border-[rgba(255,255,255,0.15)]"
              ref={month1Ref}
            >
              <h3>1M</h3>
            </button>
            <button
              className="flex justify-center items-center px-2.5 border-r border-[rgba(255,255,255,0.15)]"
              ref={month3Ref}
            >
              <h3>3M</h3>
            </button>
            <button
              className="flex justify-center items-center px-2.5 border-r border-[rgba(255,255,255,0.15)]"
              ref={month6Ref}
            >
              <h3>6M</h3>
            </button>
            <button
              className="flex justify-center items-center px-2.5 border-r border-[rgba(255,255,255,0.15)] active"
              ref={year1Ref}
            >
              <h3>1Y</h3>
            </button>
            <button
              className="flex justify-center items-center px-2.5 border-r border-[rgba(255,255,255,0.15)]"
              ref={year2Ref}
            >
              <h3>2Y</h3>
            </button>
            <button
              className="flex justify-center items-center px-2.5 border-r border-[rgba(255,255,255,0.15)]"
              ref={year5Ref}
            >
              <h3>5Y</h3>
            </button>
            <button
              className="flex justify-center items-center px-2.5 border-r border-[rgba(255,255,255,0.15)]"
              ref={year10Ref}
            >
              <h3>10Y</h3>
            </button>
          </div>
          <div className="flex-1 relative w-full" ref={timelineScrollRef}>
            <div className="absolute top-0 left-1/2 min-w-[300px] w-[60%] max-w-[calc(100%-120px)] h-full transform -translate-x-1/2 border border-white rounded-lg">
              <div
                className="absolute w-full h-full flex flex-col items-end flex-1"
                ref={timelineVisualizationRef}
              ></div>
              <h3 className="absolute top-3 left-3.5" ref={fromLabel}></h3>
              <h3 className="absolute top-3 right-3.5" ref={toLabel}></h3>
            </div>
          </div>
          <div className="relative w-full h-2 border-t border-[rgba(255,255,255,0.15)]">
            <div
              className="absolute h-full bg-[rgba(255,255,255,0.3)]"
              ref={timelineScrollBarRef}
            ></div>
          </div>
        </div>
      </div>
    );
  }
);

export default Timeline;
