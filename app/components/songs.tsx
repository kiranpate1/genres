import { forwardRef } from "react";

type props = {};

const Songs = forwardRef<HTMLDivElement, props>(({}: props, ref) => {
  return (
    <div className="w-full h-full p-1">
      <div className="relative w-full h-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.15)] rounded-lg overflow-scroll flex flex-col">
        <div className="relative w-full h-full" ref={ref}></div>
      </div>
    </div>
  );
});
export default Songs;
