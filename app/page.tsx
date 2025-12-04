"use client";

import { useRef, useEffect, useState } from "react";
import Genres, { GenresHandle } from "./components/genres";
import Timeline, { TimelineHandle } from "./components/timeline";
import Songs from "./components/songs";
import Artists from "./components/artists";
import { genreMap } from "./components/genreMap";
import { title } from "process";

export default function Home() {
  const leftSide = useRef<HTMLDivElement>(null);
  const rightSide = useRef<HTMLDivElement>(null);
  const resizeHorizontal = useRef<HTMLDivElement>(null);
  const [leftPercent, setLeftPercent] = useState(68);
  const [rightPercent, setRightPercent] = useState(32);

  const topSide = useRef<HTMLDivElement>(null);
  const bottomSide = useRef<HTMLDivElement>(null);
  const resizeVertical = useRef<HTMLDivElement>(null);
  const [topPercent, setTopPercent] = useState(80);
  const [bottomPercent, setBottomPercent] = useState(20);
  const [apiData, setApiData] = useState<any>(null);
  const [songsData, setSongsData] = useState<any>(null);
  const currentWeekRef = useRef(0);
  const timeLengthRef = useRef(52);
  const genreFiltersRef = useRef<string[]>([]);
  const [, forceUpdate] = useState({});
  const isScrollingForwardRef = useRef(true);
  const browseRef = useRef<(() => void) | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const songsRef = useRef<HTMLDivElement>(null);
  const artistsRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<TimelineHandle>(null);
  const genresRef = useRef<GenresHandle>(null);

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
      document.body.style.userSelect = "auto";
      document.removeEventListener("mousemove", handleHorizontalMouseMove);
      document.removeEventListener("mouseup", handleHorizontalMouseUp);
    };
    const handleHorizontalMouseDown = () => {
      document.body.style.userSelect = "none";
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
      document.body.style.userSelect = "auto";
      document.removeEventListener("mousemove", handleVerticalMouseMove);
      document.removeEventListener("mouseup", handleVerticalMouseUp);
    };
    const handleVerticalMouseDown = () => {
      document.body.style.userSelect = "none";
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
  }, []);

  useEffect(() => {
    async function getSongsFromAPI() {
      const url =
        "https://opensheet.elk.sh/1oxsWP57qoaxOZFUpPmwQ-Dkagv0o87qurp92_-VKITQ/allSongs";
      try {
        const res = await fetch(url);
        const data = await res.json();
        setSongsData(data);
      } catch (error) {
        console.error("Error fetching songs data:", error);
      }
    }

    getSongsFromAPI();
  }, []);

  // Add music video elements once when songsData loads
  useEffect(() => {
    if (!songsData || !genresRef.current?.musicVideoRef) return;

    const musicvideoElement = genresRef.current.musicVideoRef;
    // Clear existing videos first
    musicvideoElement.innerHTML = "";

    // Create a map for quick lookup instead of creating all DOM elements
    const videoMap = new Map<string, string>();
    songsData.forEach((item: any) => {
      if (item.id && item.video) {
        videoMap.set(item.id, item.video);
      }
    });

    // Store the map on the element for later use
    (musicvideoElement as any).videoMap = videoMap;
  }, [songsData]);

  // Callback to handle time length changes from Timeline component
  const handleTimeLengthChange = (weeks: number) => {
    const timelineElement = timelineRef.current?.timelineVisualization;
    if (timelineElement) {
      timelineElement.style.transition = "left 0.3s, width 0.3s";
      timelineElement.addEventListener(
        "transitionend",
        () => {
          if (timelineElement) {
            timelineElement.style.transition = "";
          }
        },
        { once: true }
      );
    }

    timeLengthRef.current = weeks;
    if (browseRef.current) {
      browseRef.current();
    }
  };

  // Callback to handle genre click from Genres component
  const handleGenreClick = (genreColor: string) => {
    const prevFilters = genreFiltersRef.current;
    if (prevFilters.includes(genreColor)) {
      genreFiltersRef.current = prevFilters.filter(
        (color) => color !== genreColor
      );
    } else {
      genreFiltersRef.current = [...prevFilters, genreColor];
    }
    forceUpdate({}); // Trigger re-render to update Genres component
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

    function multiplier(year: string) {
      if (year >= "1980" && year <= "1984") {
        return 1.6;
      } else if (year >= "1985" && year <= "1991") {
        return 2;
      } else if (year >= "1992" && year <= "2011") {
        return 1;
      } else if (year >= "2012" && year <= "2013") {
        return 0.9;
      } else if (year >= "2014" && year <= "2016") {
        return 0.85;
      } else if (year >= "2017" && year <= "2018") {
        return 0.8;
      } else if (year >= "2019" && year <= "2020") {
        return 0.75;
      } else if (year >= "2021" && year <= "2024") {
        return 0.65;
      } else if (year >= "2025") {
        return 0.5;
      }
    }

    function browse() {
      let genreCount: any[] = [];
      let songsCount: any[] = [];
      let artistCount: any[] = [];

      function filterData() {
        const week = Math.round(currentWeekRef.current);
        const endWeek = week + timeLengthRef.current;
        console.log(
          "Finding from week",
          week,
          "to",
          endWeek,
          "with genres:",
          genreFiltersRef.current
        );
        const genreMap = new Map<string, number>();
        const artistMap = new Map<string, { count: number; nSum: number }>();
        songsCount = [];

        // Only iterate through the relevant slice of data
        for (let i = week; i < endWeek && i < apiData.length; i++) {
          const item = apiData[i];
          const year = item.week.slice(0, 4);
          const multiplierValue = multiplier(year);

          for (let n = 1; n <= 10; n++) {
            const genreOccurrences = item[`no${n}genre`];
            if (
              genreFiltersRef.current.length > 0 &&
              genreOccurrences &&
              !genreFiltersRef.current.includes(genreOccurrences)
            ) {
              continue;
            }
            const songOccurrences = item[`no${n}id`];
            const artistOccurrences = item[`no${n}artist`];
            if (genreOccurrences) {
              genreMap.set(
                genreOccurrences,
                (genreMap.get(genreOccurrences) || 0) + 1
              );
            }

            if (songOccurrences && multiplierValue) {
              const weighted = (11 - n) * multiplierValue;
              const prev = songsCount.find((s) => s.song === songOccurrences);
              if (prev) {
                prev.count += 1;
                prev.nSum += weighted;
              } else {
                songsCount.push({
                  song: songOccurrences,
                  count: 1,
                  nSum: weighted,
                  title: item[`no${n}name`],
                  artist: item[`no${n}artist`],
                  genre: item[`no${n}genre`],
                });
              }
            }

            if (artistOccurrences) {
              // Split artist string by " ft. ", " / ", or ", "
              const artists = artistOccurrences
                .split(/ ft\. | \/ |, /)
                .map((a: string) => a.trim())
                .filter((a: string) => a.length > 0);

              const weighted = 11 - n;
              artists.forEach((artistName: string) => {
                // Get previous entry or initialize
                const prev = artistMap.get(artistName) || { count: 0, nSum: 0 };
                artistMap.set(artistName, {
                  count: prev.count + 1,
                  nSum: prev.nSum + weighted,
                });
              });
            }
          }
        }

        // Convert Maps to sorted arrays
        const songsLimit = 50;
        songsCount = songsCount
          .sort((a, b) => b.nSum - a.nSum)
          .slice(0, songsLimit);
        genreCount = Array.from(genreMap.entries())
          .map(([genre, count]) => ({ genre, count }))
          .sort((a, b) => b.count - a.count);

        artistCount = Array.from(artistMap.entries())
          .map(([artist, obj]) => ({
            artist,
            count: obj.count,
            nSum: obj.nSum,
          }))
          .sort((a, b) => b.count - a.count);

        updateGenres();
        updateSongs();
        updateArtists();
        updateTimeline();
        updateMusicVideo();
      }
      filterData();

      function updateGenres() {
        const bars = document.querySelectorAll(
          ".bar"
        ) as NodeListOf<HTMLDivElement>;
        const maxCount = genreCount.length > 0 ? genreCount[0].count : 1;

        // Create Maps for O(1) lookups
        const genreOrderMap = new Map(genreCount.map((g, i) => [g.genre, i]));
        const genreDataMap = new Map(genreCount.map((g) => [g.genre, g]));
        const leftPx = window.innerWidth * (leftPercent / 100);

        // Update genre bars using for loop for better performance
        for (let i = 0; i < bars.length; i++) {
          const bar = bars[i];
          const genre = bar.dataset.genre as string;
          const genreOrder = genreOrderMap.get(genre);
          const genreData = genreDataMap.get(genre);
          const barLabels = bar.querySelectorAll(
            ".caption p"
          ) as NodeListOf<HTMLParagraphElement>;

          if (genreData && genreOrder !== undefined) {
            const widthPercentage = (genreData.count / maxCount) * 100;
            bar.style.width = `${widthPercentage}%`;
            bar.style.transform = `translateY(${genreOrder * 100}%)`;
            bar.style.zIndex = `${genreCount.length - genreOrder}`;
            barLabels.forEach((label) => (label.style.opacity = "1"));

            const nameCaption = bar.querySelector(
              ".caption p:first-child"
            ) as HTMLParagraphElement;
            const nameWidth = nameCaption.offsetWidth;
            const barWidth = leftPx * (widthPercentage / 100);
            const caption = bar.querySelector(".caption") as HTMLDivElement;
            // If genreFiltersRef is not empty and genre is not present, set width to 0
            if (
              genreFiltersRef.current.length > 0 &&
              !genreFiltersRef.current.includes(genre)
            ) {
              bar.style.width = "0%";
              barLabels.forEach((label) => (label.style.opacity = "0"));
            } else if (nameWidth + 32 > barWidth) {
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
            barLabels.forEach((label) => (label.style.opacity = "0"));
          }
        }
      }

      function updateSongs() {
        const songsContainer = songsRef.current as HTMLDivElement;

        const songElements = songsContainer?.querySelectorAll(
          ".song"
        ) as NodeListOf<HTMLDivElement>;
        const songCountSet = new Set(songsCount.map((s) => s.song));

        // Update songs only if container exists
        if (songsContainer) {
          songElements?.forEach((songEl) => {
            // if (songsCount.indexOf(songEl) >= 50) return; // Limit to top 50 songs
            const songName = songEl.dataset.song;
            if (songName && !songCountSet.has(songName)) {
              songEl.remove();
            }
          });
          songsCount.forEach(
            (song: {
              song: string;
              count: number;
              nSum: number;
              genre: string;
              title: string;
              artist: string;
            }) => {
              // if (songsCount.indexOf(song) >= 50) return; // Limit to top 50 songs
              let songElement = songsContainer.querySelector(
                `[data-song="${song.song}"]`
              ) as HTMLDivElement | null;
              if (!songElement) {
                songElement = document.createElement("div");
                songElement.classList.add(
                  "song",
                  "absolute",
                  "left-0",
                  "w-full",
                  "h-5",
                  "flex",
                  "items-center",
                  "gap-1.5",
                  "px-1.5",
                  "text-nowrap",
                  "overflow-hidden",
                  "duration-300"
                );
                songElement.innerHTML = `<div>#${
                  songsCount.indexOf(song) + 1
                }</div><div class="min-w-2 min-h-2 rounded-full" style="background-color: ${
                  song.genre
                }"></div><p class="text-[rgba(255,255,255,1)] whitespace-nowrap overflow-hidden text-ellipsis">${
                  song.title
                }</p><p class="flex-1 text-[rgba(255,255,255,0.5)] whitespace-nowrap overflow-hidden text-ellipsis">${
                  song.artist
                }</p>`;
                songElement.style.transform = `translateY(${
                  songsCount.indexOf(song) * 100
                }%)`;
                songElement.setAttribute("data-song", song.song);
                songsContainer.appendChild(songElement);
              } else {
                songElement.style.transform = `translateY(${
                  songsCount.indexOf(song) * 100
                }%)`;
              }
            }
          );
        }
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
          artistCount.forEach(
            (artist: { artist: string; count: number; nSum: number }) => {
              const fontSizeFactor = 5.47198 * timeLength ** -0.425655; // Adjust font size based on count and time length
              const fontSize =
                0.6 * fontSizeFactor + artist.nSum * 0.015 * fontSizeFactor;
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
              artistElement.style.fontSize = `${fontSize}vh`;
              artistElement.style.margin = `${fontSize / -5}vh 0`;
            }
          );

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

      function updateMusicVideo() {
        const musicVideoContainer = genresRef.current?.musicVideoRef;
        if (!musicVideoContainer || !(musicVideoContainer as any).videoMap)
          return;

        const videoMap = (musicVideoContainer as any).videoMap;
        const week = Math.round(currentWeekRef.current);

        // Get the #1 song from the current week
        const currentWeekData = apiData[week];
        if (currentWeekData && currentWeekData.no1id) {
          const songId = currentWeekData.no1id;
          const videoUrl = videoMap.get(songId);

          if (videoUrl) {
            // Clear and create new video element
            musicVideoContainer.innerHTML = "";
            const videoEl = document.createElement("div");
            videoEl.className =
              "music-video absolute inset-0 overflow-hidden bg-center bg-cover";
            videoEl.style.backgroundImage = `url(${videoUrl})`;
            musicVideoContainer.appendChild(videoEl);
          }
        }
      }
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

      // Cancel previous animation frame and schedule new one
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(() => {
        browse();
        animationFrameRef.current = null;
      });
    };

    window.addEventListener("wheel", handleWheel);
    browse();
    window.addEventListener("resize", browse);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", browse);
    };
  }, [apiData, leftPercent, rightPercent]);

  return (
    <main className="w-screen h-screen overflow-hidden p-1">
      <div className="relative w-full h-full">
        <div
          className="absolute top-0 left-0 right-0"
          style={{ height: `${topPercent}%` }}
          ref={topSide}
        >
          <div
            className="absolute top-0 bottom-0 left-0"
            style={{ width: `${leftPercent}%` }}
            ref={leftSide}
          >
            <Genres
              onGenreClick={handleGenreClick}
              activeGenres={genreFiltersRef.current}
              ref={genresRef}
            />
            <div
              className="absolute top-0 -right-2 bottom-0 w-4 cursor-col-resize z-10 drag-handle"
              ref={resizeHorizontal}
            ></div>
          </div>
          <div
            className="absolute top-0 bottom-0 right-0 flex"
            style={{ width: `${rightPercent}%` }}
            ref={rightSide}
          >
            <div className="flex-1 h-full overflow-hidden">
              <Songs ref={songsRef} />
            </div>
            <div className="flex-1 h-full overflow-hidden">
              <Artists ref={artistsRef} />
            </div>
          </div>
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
      </div>
    </main>
  );
}
