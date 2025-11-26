"use client";

import { useRef, useEffect, useState } from "react";
import Genres from "./components/genres";
import Timeline from "./components/timeline";
import Artists from "./components/artists";
import { genreMap } from "./components/genreMap";

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
        genreCount.length = 0;
        artistCount.length = 0;
        songsCount.length = 0;
        const week = Math.round(currentWeekRef.current);

        const from = apiData[week].week;
        const to = apiData[week + timeLengthRef.current - 1].week;
        const timelineElement = document.querySelector(
          ".timeline-element"
        ) as HTMLDivElement;
        console.log(week);
        const yearsPassed = week / ((timeLengthRef.current * 52.2) / 52);

        apiData.forEach((item: any, i: number) => {
          if (i >= week && i < week + timeLengthRef.current) {
            for (let n = 1; n <= 10; n++) {
              const genreOccurrences = item[`no${n}genre`];
              const artistOccurrences = item[`no${n}artist`];
              const songOccurrences = item[`no${n}id`];
              if (genreOccurrences) {
                const existingIndex = genreCount.findIndex(
                  (g) => g.genre === genreOccurrences
                );
                if (existingIndex !== -1) {
                  genreCount[existingIndex].count++;
                } else {
                  genreCount.push({ genre: genreOccurrences, count: 1 });
                }
              }
              if (artistOccurrences) {
                // Split artist string by " ft. ", " / ", or ", "
                const artists = artistOccurrences
                  .split(/ ft\. | \/ |, /)
                  .map((a: string) => a.trim())
                  .filter((a: string) => a.length > 0);

                artists.forEach((artistName: string) => {
                  const existingIndex = artistCount.findIndex(
                    (g) => g.artist === artistName
                  );
                  if (existingIndex !== -1) {
                    artistCount[existingIndex].count++;
                  } else {
                    artistCount.push({ artist: artistName, count: 1 });
                  }
                });
              }
              if (songOccurrences) {
                // const existingSongIndex = songsCount.findIndex(
                //   (s) => s.song === songOccurrences
                // );
                // if (existingSongIndex !== -1) {
                //   songsCount[existingSongIndex].count++;
                // } else {
                //   songsCount.push({ song: songOccurrences, count: 1 });
                // }
              }
            }
            songsCount.push(item[`no1id`]);
          }
        });

        genreCount = genreCount.sort((a, b) => b.count - a.count);
        artistCount = artistCount.sort((a, b) => b.count - a.count);

        updateBars();
      }

      function updateBars() {
        const bars = document.querySelectorAll(
          ".bar"
        ) as NodeListOf<HTMLDivElement>;
        const maxCount = Math.max(...genreCount.map((g) => g.count));
        const genreMapElements = document.querySelectorAll(
          ".map-item"
        ) as NodeListOf<HTMLDivElement>;
        const artistsContainer = document.querySelector(
          ".artists"
        ) as HTMLDivElement;
        const songElements = document.querySelectorAll(
          ".song"
        ) as NodeListOf<HTMLDivElement>;

        songElements.forEach((songEl) => {
          const songId = songEl.getAttribute("id");
          if (songsCount[0].includes(songId)) {
            songEl.style.opacity = "1";
          } else {
            songEl.style.opacity = "0";
          }
        });

        bars.forEach((bar: HTMLDivElement, index: number) => {
          const genreOrder = genreCount
            .map((g) => g.genre)
            .indexOf(bar.dataset.genre);
          const genre = bar.dataset.genre as string;
          const genreData = genreCount.find((g) => g.genre === genre);
          if (genreData) {
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
          } else {
            bar.style.width = `0%`;
            bar.style.transform = `translateY(${genreCount.length * 100}%)`;
            bar.style.zIndex = "0";
            bar.style.opacity = "0";
          }
          const countCaption = bar.querySelector(
            ".caption p:last-child"
          ) as HTMLParagraphElement;
          countCaption.textContent = genreData ? genreData.count : "0";
        });
      }

      findGenres();
    }

    const handleWheel = (event: WheelEvent) => {
      const deltaY = event.deltaY;

      // Amplify scroll sensitivity: much smaller step for slow scrolls, much larger for fast scrolls
      let baseStep = 0.2;
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
            <Timeline />
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
          <Artists />
        </div>
      </div>
    </main>
  );
}
