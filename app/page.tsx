"use client";

import { useRef, useEffect, useState } from "react";
import Genres, { GenresHandle } from "./components/genres";
import Timeline, { TimelineHandle } from "./components/timeline";
import Songs from "./components/songs";
import Artists, { ArtistsHandle } from "./components/artists";
import { genreMap } from "./utils/genreMap";
import { multiplier, MONTHS, positionScore } from "./utils/calculations";

export default function Home() {
  const leftSide = useRef<HTMLDivElement>(null);
  const middleSide = useRef<HTMLDivElement>(null);
  const rightSide = useRef<HTMLDivElement>(null);
  const resizeLeftHorizontal = useRef<HTMLDivElement>(null);
  const resizeRightHorizontal = useRef<HTMLDivElement>(null);
  const [leftPercent, setLeftPercent] = useState(16);
  const [middlePercent, setMiddlePercent] = useState(68);
  const [rightPercent, setRightPercent] = useState(16);

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
  const videoIntervalRef = useRef<number | null>(null);
  const artistCountRef = useRef<
    { artist: string; count: number; nSum: number }[]
  >([]);
  const allArtistsRef = useRef<string[]>([]);
  const searchDebounceRef = useRef<number | null>(null);

  const songsRef = useRef<HTMLDivElement>(null);
  const artistsRef = useRef<ArtistsHandle>(null);
  const timelineRef = useRef<TimelineHandle>(null);
  const genresRef = useRef<GenresHandle>(null);

  //resize windows
  useEffect(() => {
    // Left handle resizes left panel (artists)
    const handleLeftMouseMove = (e: MouseEvent) => {
      const totalWidth = window.innerWidth;
      const newLeftPercent = (e.clientX / totalWidth) * 100;
      const newMiddlePercent = 100 - newLeftPercent - rightPercent;

      if (newLeftPercent >= 10 && newMiddlePercent >= 10) {
        setLeftPercent(newLeftPercent);
        setMiddlePercent(newMiddlePercent);
      }
    };
    const handleLeftMouseUp = () => {
      document.body.style.userSelect = "auto";
      document.removeEventListener("mousemove", handleLeftMouseMove);
      document.removeEventListener("mouseup", handleLeftMouseUp);
    };
    const handleLeftMouseDown = () => {
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", handleLeftMouseMove);
      document.addEventListener("mouseup", handleLeftMouseUp);
    };

    // Right handle resizes right panel (songs)
    const handleRightMouseMove = (e: MouseEvent) => {
      const totalWidth = window.innerWidth;
      const mouseX = (e.clientX / totalWidth) * 100;
      const newRightPercent = 100 - mouseX;
      const newMiddlePercent = 100 - leftPercent - newRightPercent;

      if (newRightPercent >= 10 && newMiddlePercent >= 10) {
        setRightPercent(newRightPercent);
        setMiddlePercent(newMiddlePercent);
      }
    };
    const handleRightMouseUp = () => {
      document.body.style.userSelect = "auto";
      document.removeEventListener("mousemove", handleRightMouseMove);
      document.removeEventListener("mouseup", handleRightMouseUp);
    };
    const handleRightMouseDown = () => {
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", handleRightMouseMove);
      document.addEventListener("mouseup", handleRightMouseUp);
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

    const resizeHandleLeft = resizeLeftHorizontal.current;
    const resizeHandleRight = resizeRightHorizontal.current;
    const resizeHandleVertical = resizeVertical.current;

    resizeHandleLeft?.addEventListener("mousedown", handleLeftMouseDown);
    resizeHandleRight?.addEventListener("mousedown", handleRightMouseDown);
    resizeHandleVertical?.addEventListener(
      "mousedown",
      handleVerticalMouseDown
    );

    return () => {
      resizeHandleLeft?.removeEventListener("mousedown", handleLeftMouseDown);
      resizeHandleRight?.removeEventListener("mousedown", handleRightMouseDown);
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

  // Build comprehensive artist list once when apiData loads
  useEffect(() => {
    if (!apiData) return;

    const artistSet = new Set<string>();
    const splitArtists = (artistOccurrences: string) => {
      return artistOccurrences
        .split(/ ft\. | \/ |, /)
        .map((a: string) => a.trim())
        .filter((a: string) => a.length > 0);
    };

    // Iterate through all data to collect unique artists
    apiData.forEach((item: any) => {
      for (let n = 1; n <= 10; n++) {
        const artistOccurrences = item[`no${n}artist`];
        if (artistOccurrences) {
          const artists = splitArtists(artistOccurrences);
          artists.forEach((artist) => artistSet.add(artist));
        }
      }
    });

    // Convert to sorted array for better UX
    allArtistsRef.current = Array.from(artistSet).sort();
    console.log(
      `Loaded ${allArtistsRef.current.length} unique artists from dataset`
    );
  }, [apiData]);

  // Callback to handle time length changes from Timeline component
  const handleTimeLengthChange = (weeks: number) => {
    const timelineElements = [
      timelineRef.current?.timelineVisualization,
      timelineRef.current?.timelineScrollBarRef,
    ].filter(Boolean) as HTMLElement[];

    timelineElements.forEach((element) => {
      element.style.transition =
        element === timelineElements[0]
          ? "left 0.3s, width 0.3s"
          : "width 0.3s";
      element.addEventListener(
        "transitionend",
        () => {
          element.style.transition = "";
        },
        { once: true }
      );
    });

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
    let genreCount: any[] = [];
    let songsCount: any[] = [];
    let artistCount: any[] = [];

    // local helper functions
    const genreInfo = (genre: string) => {
      const match = genreMap.find(([color, name]) => color === genre);
      return [match ? match[1] : genre, match ? match[3] : "black"];
    };
    const splitArtists = (artistOccurrences: string) => {
      return artistOccurrences
        .split(/ ft\. | \/ |, /)
        .map((a: string) => a.trim())
        .filter((a: string) => a.length > 0);
    };

    // main browse
    function browse() {
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
              const weighted = positionScore(n + 1) * multiplierValue;
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
              const artists = splitArtists(artistOccurrences);

              const weighted = positionScore(n + 1) * multiplierValue;
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

        // Store in ref for search functionality
        artistCountRef.current = artistCount;

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
        const middlePx = window.innerWidth * (middlePercent / 100);

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
            const barWidth = middlePx * (widthPercentage / 100);
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
                songElement.innerHTML = `
                  <div class="min-w-2 min-h-2 rounded-full" style="background-color: ${song.genre}"></div>
                  <p class="text-[rgba(255,255,255,1)] whitespace-nowrap overflow-hidden text-ellipsis">${song.title}</p>
                  <p class="flex-1 text-[rgba(255,255,255,0.5)] whitespace-nowrap overflow-hidden text-ellipsis">${song.artist}</p>`;
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
        const artistsContainer = artistsRef.current?.artistsList;
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
                0.6 * fontSizeFactor + artist.nSum * 0.01 * fontSizeFactor;
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
          const timelineScrollBarElement =
            timelineRef.current.timelineScrollBarRef;
          if (timelineElement && timelineScrollBarElement) {
            timelineElement.style.width = `${timelineRatio * 100}%`;
            timelineElement.style.left = `-${leftPercent}%`;
            timelineScrollBarElement.style.width = `${
              (timeLength / totalWeeks) * 100
            }%`;
            timelineScrollBarElement.style.left = `${
              (currentWeekRef.current / totalWeeks) * 100
            }%`;
          }
        }

        if (timelineRef.current?.fromLabel && timelineRef.current?.toLabel) {
          const startWeek = Math.round(currentWeekRef.current);
          const endWeek = Math.min(startWeek + timeLength, apiData.length - 1);

          const fromDate = apiData[startWeek]?.date || apiData[startWeek]?.week;
          const toDate = apiData[endWeek]?.date || apiData[endWeek]?.week;

          const fromYear = timeLength > 52 ? `${fromDate.slice(0, 4)}` : "";
          const fromMonth =
            timeLength <= 260
              ? `${MONTHS[parseInt(fromDate.slice(5, 7)) - 1].name}`
              : "";
          const fromDay =
            timeLength <= 52 ? `${parseInt(fromDate.slice(8, 10))}` : "";
          const fromFormatted = `${fromMonth} ${fromDay} ${fromYear}`;

          const toYear = timeLength > 52 ? `${toDate.slice(0, 4)}` : "";
          const toMonth =
            timeLength <= 260
              ? `${MONTHS[parseInt(toDate.slice(5, 7)) - 1].name}`
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
        const intervalDuration = 3000; // in milliseconds
        const fadeDuration = 1000; // in milliseconds

        // Clear previous interval if it exists
        if (videoIntervalRef.current !== null) {
          clearInterval(videoIntervalRef.current);
          videoIntervalRef.current = null;
        }

        const randomTenSongs = Array.from(
          { length: songsCount.length },
          (_, i) => i
        )
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(10, songsCount.length));

        const videoMap = (musicVideoContainer as any).videoMap;

        let currentIndex = 0;

        // Function to show a video with crossfade
        const showVideo = () => {
          const songIndex = randomTenSongs[currentIndex];
          const songId = songsCount[songIndex]?.song;
          const videoUrl = videoMap.get(songId);
          const songInfo = [
            songsCount[songIndex]?.genre,
            songsCount[songIndex]?.title,
            songsCount[songIndex]?.artist,
          ];

          if (videoUrl) {
            // Fade out previous video
            const existingVideos =
              musicVideoContainer.querySelectorAll(".music-video");
            existingVideos.forEach((video) => {
              (video as HTMLElement).style.opacity = "0";
              // Remove after transition completes
              setTimeout(() => video.remove(), fadeDuration);
            });

            // Create and fade in new video element
            const videoEl = document.createElement("div");
            videoEl.className =
              "music-video absolute inset-[-1px] flex flex-col items-stretch bg-black opacity-0 overflow-hidden";
            videoEl.style.transition = `opacity ${fadeDuration}ms`;
            videoEl.innerHTML = `
              <div class="flex-1 bg-center bg-cover border border-[rgba(255,255,255,0.15)] rounded-lg" style="background-image: url(${videoUrl})"></div>
              <div class="h-6 flex items-center gap-1.5 px-2">
                <div class="min-w-2 min-h-2 rounded-full" style="background-color: ${songInfo[0]}"></div>
                <p class="text-[rgba(255,255,255,1)] whitespace-nowrap overflow-hidden text-ellipsis">${songInfo[1]}</p>
                <p class="flex-1 text-[rgba(255,255,255,0.5)] whitespace-nowrap overflow-hidden text-ellipsis">${songInfo[2]}</p>
              </div>`;
            musicVideoContainer.appendChild(videoEl);

            // Trigger fade in after a brief delay to ensure transition works
            setTimeout(() => {
              videoEl.style.opacity = "1";
            }, 10);
          }

          currentIndex = (currentIndex + 1) % randomTenSongs.length;
        };

        // Show first video immediately
        showVideo();

        // Set up interval for subsequent videos
        videoIntervalRef.current = window.setInterval(() => {
          showVideo();
        }, intervalDuration) as unknown as number;
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
    const timelineScrollRef = timelineRef.current?.timelineScrollRef;

    // Set up artist search handler with debouncing
    const artistsSearch = artistsRef.current?.artistsSearchRef;
    const artistsSearchResults = artistsRef.current?.artistsSearchResults;

    const handleArtistSearch = () => {
      if (!artistsSearch || !artistsSearchResults) return;

      // Clear previous debounce timer
      if (searchDebounceRef.current !== null) {
        clearTimeout(searchDebounceRef.current);
      }

      // Debounce search by 200ms
      searchDebounceRef.current = window.setTimeout(() => {
        const inputValue = artistsSearch.value.trim();

        if (inputValue.length === 0) {
          // Hide results when input is empty
          artistsSearchResults.classList.add("hidden");
          artistsSearchResults.innerHTML = "";
          return;
        }

        if (inputValue.length < 3) {
          // Show hint message
          artistsSearchResults.classList.remove("hidden");
          artistsSearchResults.innerHTML = `<div class="px-3 py-2 text-xs text-[rgba(255,255,255,0.5)]">Type at least 3 characters...</div>`;
          return;
        }

        // Filter artists (limit to 50 results for performance)
        const matchingArtists = allArtistsRef.current
          .filter((artist) =>
            artist.toLowerCase().includes(inputValue.toLowerCase())
          )
          .slice(0, 50);

        if (matchingArtists.length === 0) {
          artistsSearchResults.classList.remove("hidden");
          artistsSearchResults.innerHTML = `<div class="px-3 py-2 text-xs text-[rgba(255,255,255,0.5)]">No artists found</div>`;
          return;
        }

        // Use innerHTML for fast bulk update
        artistsSearchResults.innerHTML = matchingArtists
          .map(
            (artist) =>
              `<div class="px-3 py-1.5 text-sm hover:bg-[rgba(255,255,255,0.1)] cursor-pointer transition-colors">${artist}</div>`
          )
          .join("");
        artistsSearchResults.classList.remove("hidden");

        console.log(
          `Found ${matchingArtists.length} matching artists (showing 50 max)`
        );
      }, 200);
    };

    artistsSearch?.addEventListener("input", handleArtistSearch);
    timelineScrollRef?.addEventListener("wheel", handleWheel);
    browse();
    window.addEventListener("resize", browse);

    return () => {
      const artistsSearch = artistsRef.current?.artistsSearchRef;
      if (searchDebounceRef.current !== null) {
        clearTimeout(searchDebounceRef.current);
      }
      artistsSearch?.removeEventListener("input", handleArtistSearch);
      timelineScrollRef?.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", browse);
    };
  }, [apiData]);

  // Handle horizontal resize - only update genre bars
  useEffect(() => {
    if (!apiData) return;

    const updateGenrePositions = () => {
      const bars = document.querySelectorAll(
        ".bar"
      ) as NodeListOf<HTMLDivElement>;
      const middlePx = window.innerWidth * (middlePercent / 100);

      bars.forEach((bar) => {
        const caption = bar.querySelector(".caption") as HTMLDivElement;
        const nameCaption = bar.querySelector(
          ".caption p:first-child"
        ) as HTMLParagraphElement;

        if (!caption || !nameCaption) return;

        const barWidth = parseFloat(bar.style.width) || 0;
        const actualBarWidth = middlePx * (barWidth / 100);
        const nameWidth = nameCaption.offsetWidth;
        const genre = bar.dataset.genre as string;

        function genreInfo(genre: string) {
          const match = genreMap.find(([color, name]) => color === genre);
          return [match ? match[1] : genre, match ? match[3] : "black"];
        }

        if (nameWidth + 32 > actualBarWidth) {
          caption.style.transform = `translateX(calc(100% + 12px))`;
          caption.style.justifyContent = "flex-start";
          caption.style.color = "white";
        } else {
          caption.style.transform = `translateX(0px)`;
          caption.style.justifyContent = "space-between";
          caption.style.color = genreInfo(genre)[1];
        }
      });
    };

    updateGenrePositions();
    window.addEventListener("resize", updateGenrePositions);

    return () => {
      window.removeEventListener("resize", updateGenrePositions);
    };
  }, [leftPercent, rightPercent, apiData]);

  return (
    <main className="w-screen h-screen overflow-hidden p-1">
      <div className="relative w-full h-full">
        <div
          className="absolute top-0 left-0 right-0"
          style={{ height: `${topPercent}%` }}
          ref={topSide}
        >
          {/* Left panel - Artists */}
          <div
            className="absolute top-0 bottom-0 left-0 flex"
            style={{ width: `${leftPercent}%` }}
            ref={leftSide}
          >
            <div className="flex-1 h-full overflow-hidden">
              <Artists ref={artistsRef} />
            </div>
          </div>

          {/* Middle panel - Genres */}
          <div
            className="absolute top-0 bottom-0"
            style={{ left: `${leftPercent}%`, width: `${middlePercent}%` }}
            ref={middleSide}
          >
            <Genres
              onGenreClick={handleGenreClick}
              activeGenres={genreFiltersRef.current}
              ref={genresRef}
            />
            <div
              className="absolute top-0 -left-2 bottom-0 w-4 cursor-col-resize z-10 drag-handle"
              ref={resizeLeftHorizontal}
            ></div>
            <div
              className="absolute top-0 -right-2 bottom-0 w-4 cursor-col-resize z-10 drag-handle"
              ref={resizeRightHorizontal}
            ></div>
          </div>

          {/* Right panel - Songs */}
          <div
            className="absolute top-0 bottom-0 right-0 flex"
            style={{ width: `${rightPercent}%` }}
            ref={rightSide}
          >
            <div className="flex-1 h-full overflow-hidden">
              <Songs ref={songsRef} />
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
