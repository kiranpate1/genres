import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import { genreMap } from "../utils/genreMap";

type Genre = {
  color: string;
  name: string;
  textColor: string;
};

type props = {
  onGenreClick?: (genreColor: string) => void;
  activeGenres?: string[];
};

export type GenresHandle = {
  genreList: HTMLDivElement | null;
  musicVideoRef: HTMLDivElement | null;
};

const Genres = forwardRef<GenresHandle, props>(
  ({ onGenreClick, activeGenres = [] }: props, ref) => {
    const genresContainer = useRef<HTMLDivElement>(null);
    const genreListRef = useRef<HTMLDivElement>(null);
    const musicVideoRef = useRef<HTMLDivElement>(null);
    const [genres, setGenres] = useState<Genre[]>([]);

    useImperativeHandle(ref, () => ({
      genreList: genreListRef.current,
      musicVideoRef: musicVideoRef.current,
    }));

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
        const genreList: Genre[] = [];

        data.forEach((item: any, i: number) => {
          const genreInfoArray = genreInfo(item.Genre);
          const bar = document.createElement("div");
          bar.setAttribute("data-genre", item.Genre);
          bar.classList.add("bar", "absolute", "w-[0%]", "rounded-br-sm");
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

          // Store genre data for React rendering
          genreList.push({
            color: item.Genre,
            name: genreInfoArray[0],
            textColor: genreInfoArray[1],
          });
        });

        setGenres(genreList);
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
          <div className="absolute right-2 bottom-2 w-[calc(100%-1rem)] flex justify-end items-end gap-2 z-99">
            <div
              className="relative flex-1 max-w-80 h-54 border border-[rgba(255,255,255,0.15)] rounded-lg bg-[#0D0D0D] overflow-hidden"
              ref={musicVideoRef}
            ></div>
            <div className="border border-[rgba(255,255,255,0.15)] rounded-lg bg-[#0D0D0D] w-[420px]">
              <div
                className="flex justify-end flex-wrap gap-1.5 p-1.5"
                ref={genreListRef}
              >
                {genres.map((genre) => (
                  <div
                    key={genre.color}
                    className="relative h-7 px-1.5 rounded-sm overflow-hidden flex justify-center items-center cursor-pointer border hover:after:block after:bg-[rgba(255,255,255,0.15)] after:absolute after:inset-0 after:hidden"
                    style={{
                      backgroundColor: activeGenres.includes(genre.color)
                        ? genre.color
                        : "transparent",
                      color: activeGenres.includes(genre.color)
                        ? genre.textColor
                        : "rgba(255,255,255,0.7)",
                      borderColor: activeGenres.includes(genre.color)
                        ? "transparent"
                        : "rgba(255,255,255,0.15)",
                    }}
                    data-genre={genre.color}
                    onClick={() => onGenreClick?.(genre.color)}
                  >
                    <h3>{genre.name}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default Genres;
