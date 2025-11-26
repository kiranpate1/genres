import { useEffect, useRef } from "react";
import { genreMap } from "./genreMap";

type props = {};

const Genres = ({}: props) => {
  const genresContainer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    /* map bars */
    function getGenresFromAPI() {
      var url =
        "https://opensheet.elk.sh/1oxsWP57qoaxOZFUpPmwQ-Dkagv0o87qurp92_-VKITQ/allGenres";
      var obj: any;
      fetch(url)
        .then((res) => res.json())
        .then((data) => (obj = data))
        .then(() => getGenres(obj));
    }

    getGenresFromAPI();

    function getGenres(data: any) {
      data.forEach((item: any, i: number) => {
        const genreInfoArray = genreInfo(item.Genre);
        const bar = document.createElement("div");
        bar.setAttribute("data-genre", item.Genre);
        bar.classList.add("bar", "absolute", "w-full");
        bar.style.height = "var(--bar-height)";
        // bar.style.width = "0%";
        bar.style.transition = "var(--bar-transition)";
        bar.style.transform = `translateY(${i * 100}%)`;
        bar.style.backgroundColor = item.Genre;
        bar.innerHTML = `<div class="caption absolute inset-[4px_6px_auto_6px] flex justify-between items-center gap-1.5 text-inherit"><p class="whitespace-nowrap text-inherit">${genreInfoArray[0]}</p><p>0</p></div>`;
        bar.style.color = genreInfoArray[1];
        bar.style.transition = "0.6s ease width 0.2s";
        bar.addEventListener("transitionend", () => {
          bar.style.transition = "var(--bar-transition)";
        });
        genresContainer.current?.appendChild(bar);

        // const genreMap = document.querySelector(".genre-map");
        // const mapItem = document.createElement("div");
        // mapItem.classList.add("map-item");
        // mapItem.style.backgroundColor = item.Genre;
        // genreMap.appendChild(mapItem);
      });
    }

    function genreInfo(genre: string) {
      const match = genreMap.find(([color, name]) => color === genre);
      return [match ? match[1] : genre, match ? match[2] : "black"];
    }
  }, []);
  return (
    <div className="w-full h-full p-1">
      <div className="relative w-full h-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.15)] rounded-lg overflow-hidden">
        <div className="relative w-full h-full" ref={genresContainer}></div>
      </div>
    </div>
  );
};

export default Genres;
