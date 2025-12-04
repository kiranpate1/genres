import { forwardRef } from "react";

type Props = {};

const Artists = forwardRef<HTMLDivElement, Props>((props, ref) => {
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
          className="w-full h-full flex flex-col items-end flex-1 overflow-hidden"
          ref={ref}
        ></div>
      </div>
    </div>
  );
});

export default Artists;
