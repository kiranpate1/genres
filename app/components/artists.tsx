import { forwardRef, useRef, useImperativeHandle } from "react";

export type ArtistsHandle = {
  artistsList: HTMLDivElement | null;
  artistsSearchRef: HTMLInputElement | null;
  artistsSearchResults: HTMLDivElement | null;
};

type Props = {};

const Artists = forwardRef<ArtistsHandle, Props>((props, ref) => {
  const artistsList = useRef<HTMLDivElement>(null);
  const artistsSearchRef = useRef<HTMLInputElement>(null);
  const artistsSearchResults = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    artistsList: artistsList.current,
    artistsSearchRef: artistsSearchRef.current,
    artistsSearchResults: artistsSearchResults.current,
  }));

  return (
    <div className="w-full h-full p-1">
      <div className="relative w-full h-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.15)] rounded-lg overflow-hidden flex flex-col">
        {/* <div className="min-h-10 border-b border-[rgba(255,255,255,0.15)] flex items-stretch">
          <button className="flex justify-center items-center flex-1">
            <h3>Songs</h3>
          </button>
          <div className="w-px h-full bg-[rgba(255,255,255,0.15)]"></div>
          <button className="flex justify-center items-center flex-1">
            <h3>Artists</h3>
          </button>
        </div> */}
        <div
          className="w-full h-full flex flex-col items-start flex-1 overflow-scroll"
          ref={artistsList}
        ></div>
        <div className="relative min-h-10 p-1">
          <input
            type="text"
            placeholder="Search artists..."
            className="w-full h-full px-2.5 text-sm border border-[rgba(255,255,255,0.15)] rounded-full outline-none focus:border-[rgba(255,255,255,0.3)] focus:bg-[rgba(255,255,255,0.03)] placeholder:text-[rgba(255,255,255,0.4)]"
            ref={artistsSearchRef}
          />
          <div
            ref={artistsSearchResults}
            className="absolute bottom-full left-1 right-1 mb-1 max-h-60 overflow-y-auto bg-[rgba(0,0,0,0.95)] border border-[rgba(255,255,255,0.15)] rounded-lg hidden"
          ></div>
        </div>
      </div>
    </div>
  );
});

export default Artists;
