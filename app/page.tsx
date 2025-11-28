"use client";

import { useRef, useEffect, useState } from "react";
import Genres from "./components/genres";
import Timeline, { TimelineHandle } from "./components/timeline";
import Artists from "./components/artists";
import { genreMap } from "./components/genreMap";
import { time } from "console";

export default function Home() {
  const leftSide = useRef<HTMLDivElement>(null);
  const rightSide = useRef<HTMLDivElement>(null);
  const resizeHorizontal = useRef<HTMLDivElement>(null);
  const [leftPercent, setLeftPercent] = useState(84);
  const [rightPercent, setRightPercent] = useState(16);

  const topSide = useRef<HTMLDivElement>(null);
  const bottomSide = useRef<HTMLDivElement>(null);
  const resizeVertical = useRef<HTMLDivElement>(null);
  const [topPercent, setTopPercent] = useState(80);
  const [bottomPercent, setBottomPercent] = useState(20);
  const [apiData, setApiData] = useState<any>(null);
  const currentWeekRef = useRef(0);
  const timeLengthRef = useRef(52);
  const isScrollingForwardRef = useRef(true);
  const browseRef = useRef<(() => void) | null>(null);

  const artistsRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<TimelineHandle>(null);

  //resize windows
  useEffect(() => {
    const handleHorizontalMouseMove = (e: MouseEvent) => {
      const totalWidth = window.innerWidth;
      const newLeftPercent = (e.clientX / totalWidth) * 100;
      const newRightPercent = 100 - newLeftPercent;

      if (newLeftPercent >= 50 && newRightPercent >= 10) {
        setLeftPercent(newLeftPercent);
        setRightPercent(newRightPercent);
      }
    };
    const handleHorizontalMouseUp = () => {
      document.removeEventListener("mousemove", handleHorizontalMouseMove);
      document.removeEventListener("mouseup", handleHorizontalMouseUp);
    };
    const handleHorizontalMouseDown = () => {
      document.addEventListener("mousemove", handleHorizontalMouseMove);
      document.addEventListener("mouseup", handleHorizontalMouseUp);
    };

    const handleVerticalMouseMove = (e: MouseEvent) => {
      const totalHeight = window.innerHeight;
      const newTopPercent = (e.clientY / totalHeight) * 100;
      const newBottomPercent = 100 - newTopPercent;

      if (newTopPercent >= 50 && newBottomPercent >= 10) {
        setTopPercent(newTopPercent);
        setBottomPercent(newBottomPercent);
      }
    };
    const handleVerticalMouseUp = () => {
      document.removeEventListener("mousemove", handleVerticalMouseMove);
      document.removeEventListener("mouseup", handleVerticalMouseUp);
    };
    const handleVerticalMouseDown = () => {
      document.addEventListener("mousemove", handleVerticalMouseMove);
      document.addEventListener("mouseup", handleVerticalMouseUp);
    };

    const resizeHandleHorizontal = resizeHorizontal.current;
    resizeHandleHorizontal?.addEventListener(
      "mousedown",
      handleHorizontalMouseDown
    );
    const resizeHandleVertical = resizeVertical.current;
    resizeHandleVertical?.addEventListener(
      "mousedown",
      handleVerticalMouseDown
    );

    return () => {
      resizeHandleHorizontal?.removeEventListener(
        "mousedown",
        handleHorizontalMouseDown
      );
      resizeHandleVertical?.removeEventListener(
        "mousedown",
        handleVerticalMouseDown
      );
    };
  }, [leftPercent, rightPercent]);

  // Fetch API data once on mount
  useEffect(() => {
    async function getDataFromAPI() {
      const url =
        "https://opensheet.elk.sh/1oxsWP57qoaxOZFUpPmwQ-Dkagv0o87qurp92_-VKITQ/allyears";
      try {
        const res = await fetch(url);
        const data = await res.json();
        setApiData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    getDataFromAPI();
  }, []); // Empty dependency array - runs only once on mount

  // Callback to handle time length changes from Timeline component
  const handleTimeLengthChange = (weeks: number) => {
    timeLengthRef.current = weeks;
    // Call browse if it's available
    if (browseRef.current) {
      browseRef.current();
    }
  };

  // Process data whenever apiData or leftPercent changes
  useEffect(() => {
    if (!apiData) return;

    function genreInfo(genre: string) {
      const match = genreMap.find(([color, name]) => color === genre);
      return [match ? match[1] : genre, match ? match[2] : "black"];
    }

    function browse() {
      let genreCount: any[] = [];
      let artistCount: any[] = [];
      let songsCount: any[] = [];

      function findGenres() {
        const week = Math.round(currentWeekRef.current);
        const endWeek = week + timeLengthRef.current;
        console.log("Finding genres from week", week, "to", endWeek);

        // Use Maps for O(1) lookups instead of findIndex
        const genreMap = new Map<string, number>();
        const artistMap = new Map<string, number>();
        songsCount = [];

        // Only iterate through the relevant slice of data
        for (let i = week; i < endWeek && i < apiData.length; i++) {
          const item = apiData[i];

          for (let n = 1; n <= 10; n++) {
            const genreOccurrences = item[`no${n}genre`];
            const artistOccurrences = item[`no${n}artist`];

            if (genreOccurrences) {
              genreMap.set(
                genreOccurrences,
                (genreMap.get(genreOccurrences) || 0) + 1
              );
            }

            if (artistOccurrences) {
              // Split artist string by " ft. ", " / ", or ", "
              const artists = artistOccurrences
                .split(/ ft\. | \/ |, /)
                .map((a: string) => a.trim())
                .filter((a: string) => a.length > 0);

              artists.forEach((artistName: string) => {
                artistMap.set(artistName, (artistMap.get(artistName) || 0) + 1);
              });
            }
          }
          songsCount.push(item[`no1id`]);
        }

        // Convert Maps to sorted arrays
        genreCount = Array.from(genreMap.entries())
          .map(([genre, count]) => ({ genre, count }))
          .sort((a, b) => b.count - a.count);

        artistCount = Array.from(artistMap.entries())
          .map(([artist, count]) => ({ artist, count }))
          .sort((a, b) => b.count - a.count);

        updateBars();
        updateArtists();
        updateTimeline();
      }

      function updateBars() {
        const bars = document.querySelectorAll(
          ".bar"
        ) as NodeListOf<HTMLDivElement>;
        const maxCount = genreCount.length > 0 ? genreCount[0].count : 1;
        const songElements = document.querySelectorAll(
          ".song"
        ) as NodeListOf<HTMLDivElement>;

        // Create a Set for faster song lookups
        const firstSongId = songsCount[0];
        songElements.forEach((songEl) => {
          const songId = songEl.getAttribute("id");
          songEl.style.opacity =
            firstSongId && firstSongId.includes(songId) ? "1" : "0";
        });

        // Create Maps for O(1) lookups
        const genreOrderMap = new Map(genreCount.map((g, i) => [g.genre, i]));
        const genreDataMap = new Map(genreCount.map((g) => [g.genre, g]));

        // Update genre bars
        bars.forEach((bar: HTMLDivElement) => {
          const genre = bar.dataset.genre as string;
          const genreOrder = genreOrderMap.get(genre);
          const genreData = genreDataMap.get(genre);

          if (genreData && genreOrder !== undefined) {
            const widthPercentage = (genreData.count / maxCount) * 100;
            bar.style.width = `${widthPercentage}%`;
            bar.style.transform = `translateY(${genreOrder * 100}%)`;
            bar.style.zIndex = `${genreCount.length - genreOrder}`;
            bar.style.opacity = "1";

            const nameCaption = bar.querySelector(
              ".caption p:first-child"
            ) as HTMLParagraphElement;
            const nameWidth = nameCaption.offsetWidth;
            const barWidth =
              window.innerWidth * (leftPercent / 100) * (widthPercentage / 100);
            const caption = bar.querySelector(".caption") as HTMLDivElement;
            if (nameWidth + 32 > barWidth) {
              caption.style.transform = `translateX(calc(100% + 12px))`;
              caption.style.justifyContent = "flex-start";
              caption.style.color = "white";
            } else {
              caption.style.transform = `translateX(0px)`;
              caption.style.justifyContent = "space-between";
              caption.style.color = genreInfo(genre)[1];
            }

            const countCaption = bar.querySelector(
              ".caption p:last-child"
            ) as HTMLParagraphElement;
            countCaption.textContent = String(genreData.count);
          } else {
            bar.style.width = `0%`;
            bar.style.transform = `translateY(${genreCount.length * 100}%)`;
            bar.style.zIndex = "0";
            bar.style.opacity = "0";
          }
        });
      }

      function updateArtists() {
        const artistsContainer = artistsRef.current as HTMLDivElement;
        const artistElements = artistsContainer?.querySelectorAll(
          ".artist"
        ) as NodeListOf<HTMLDivElement>;
        const artistCountSet = new Set(artistCount.map((a) => a.artist));
        const timeLength = timeLengthRef.current;

        // Update artists only if container exists
        if (artistsContainer) {
          artistCount.forEach((artist: { artist: string; count: number }) => {
            const fontSizeFactor = 5.47198 * timeLength ** -0.425655;
            const fontSize = 6 + artist.count * 0.9 * fontSizeFactor; // Adjust font size based on count and time length
            let artistElement = artistsContainer.querySelector(
              `[data-artist="${artist.artist}"]`
            ) as HTMLDivElement | null;

            if (!artistElement) {
              artistElement = document.createElement("div");
              artistElement.classList.add("artist");
              artistElement.style.whiteSpace = "nowrap";
              artistElement.textContent = artist.artist;
              artistElement.setAttribute("data-artist", artist.artist);
              if (isScrollingForwardRef.current) {
                artistsContainer.appendChild(artistElement);
              } else {
                artistsContainer.insertBefore(
                  artistElement,
                  artistsContainer.firstChild
                );
              }
            }
            artistElement.style.fontSize = `${fontSize}px`;
            artistElement.style.margin = `${fontSize / -5}px 0`;
          });

          // Remove artists not in current list
          artistElements?.forEach((artistEl) => {
            const artistName = artistEl.dataset.artist;
            if (artistName && !artistCountSet.has(artistName)) {
              artistEl.remove();
            }
          });
        }
      }

      function updateTimeline() {
        const totalWeeks = apiData.length;
        const timeLength = timeLengthRef.current;
        const timelineRatio = totalWeeks / timeLength;
        const leftPercent =
          (currentWeekRef.current / totalWeeks) * 100 * timelineRatio;

        if (timelineRef.current?.timelineVisualization) {
          const timelineElement = timelineRef.current.timelineVisualization;
          if (timelineElement) {
            timelineElement.style.width = `${timelineRatio * 100}%`;
            timelineElement.style.left = `-${leftPercent}%`;
          }
        }

        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        if (timelineRef.current?.fromLabel && timelineRef.current?.toLabel) {
          const startWeek = Math.round(currentWeekRef.current);
          const endWeek = Math.min(startWeek + timeLength, apiData.length - 1);

          const fromDate = apiData[startWeek]?.date || apiData[startWeek]?.week;
          const toDate = apiData[endWeek]?.date || apiData[endWeek]?.week;

          const fromYear = timeLength > 52 ? `${fromDate.slice(0, 4)}` : "";
          const fromMonth =
            timeLength <= 260
              ? `${months[parseInt(fromDate.slice(5, 7)) - 1]}`
              : "";
          const fromDay =
            timeLength <= 52 ? `${parseInt(fromDate.slice(8, 10))}` : "";
          const fromFormatted = `${fromMonth} ${fromDay} ${fromYear}`;

          const toYear = timeLength > 52 ? `${toDate.slice(0, 4)}` : "";
          const toMonth =
            timeLength <= 260
              ? `${months[parseInt(toDate.slice(5, 7)) - 1]}`
              : "";
          const toDay =
            timeLength <= 52 ? `${parseInt(toDate.slice(8, 10))}` : "";
          const toFormatted = `${toMonth} ${toDay} ${toYear}`;

          timelineRef.current.fromLabel.textContent = fromFormatted || "";
          timelineRef.current.toLabel.textContent = toFormatted || "";
        }
      }

      findGenres();
    }

    // Store browse in ref so it can be called from handleTimeLengthChange
    browseRef.current = browse;

    const handleWheel = (event: WheelEvent) => {
      const deltaY = event.deltaY;
      const timeLength = timeLengthRef.current;

      // Amplify scroll sensitivity: much smaller step for slow scrolls, much larger for fast scrolls
      let baseStep = timeLength / 200;
      let step = baseStep + Math.floor(Math.abs(deltaY) / 10);
      if (deltaY > 0) {
        currentWeekRef.current += step;
      } else {
        currentWeekRef.current -= step;
      }
      if (currentWeekRef.current < 0) {
        currentWeekRef.current = 0;
      } else if (
        currentWeekRef.current >
        apiData.length - timeLengthRef.current
      ) {
        currentWeekRef.current = apiData.length - timeLengthRef.current;
      }

      isScrollingForwardRef.current = deltaY > 0;

      browse();
    };

    window.addEventListener("wheel", handleWheel);
    browse();

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [apiData, leftPercent, rightPercent]);

  return (
    <main className="w-screen h-screen overflow-hidden p-1">
      <div className="relative w-full h-full">
        <div
          className="absolute top-0 left-0 bottom-0"
          style={{ width: `${leftPercent}%` }}
          ref={leftSide}
        >
          <div
            className="absolute top-0 left-0 right-0"
            style={{ height: `${topPercent}%` }}
            ref={topSide}
          >
            <Genres />
            <div
              className="absolute -bottom-2 left-0 right-0 h-4 cursor-row-resize z-10 drag-handle"
              ref={resizeVertical}
            ></div>
          </div>
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{ height: `${bottomPercent}%` }}
            ref={bottomSide}
          >
            <Timeline
              ref={timelineRef}
              onTimeLengthChange={handleTimeLengthChange}
              weekInfo={
                apiData?.map((item: any) => ({
                  date: item.date || item.week,
                })) || []
              }
            />
          </div>
          <div
            className="absolute top-0 -right-2 bottom-0 w-4 cursor-col-resize z-10 drag-handle"
            ref={resizeHorizontal}
          ></div>
        </div>
        <div
          className="absolute top-0 right-0 bottom-0"
          style={{ width: `${rightPercent}%` }}
          ref={rightSide}
        >
          <Artists ref={artistsRef} />
        </div>
      </div>
    </main>
  );
}
