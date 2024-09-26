import { cn } from "lib/utils";
import React, { useMemo } from "react";
import { getContrastingColor } from "techme/util/getContrastingColor";

type Props = {
  color: string;
  textColor: string;
  x: number;
  y: number;
  name?: string;
};

export default function Cursor({ color, textColor, x, y, name }: Props) {
  if (name != undefined) {
    if (name.length > 0) {
      name = name[0]?.toUpperCase() + name.slice(1);
    }
  }
  const textColorCont = useMemo(
    () => (color ? getContrastingColor(color) : undefined),
    [color],
  );
  return (
    <>
      <svg
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: `translateX(${x}px) translateY(${y}px)`,
        }}
        width="24"
        height="36"
        viewBox="0 0 24 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          // d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
          d="M0.928548 2.18278C0.619075 1.37094 1.42087 0.577818 2.2293 0.896107L14.3863 5.68247C15.2271 6.0135 15.2325 7.20148 14.3947 7.54008L9.85984 9.373C9.61167 9.47331 9.41408 9.66891 9.31127 9.91604L7.43907 14.4165C7.09186 15.2511 5.90335 15.2333 5.58136 14.3886L0.928548 2.18278Z"
          fill={color}
        />
      </svg>
      {name != undefined && (
        <div
          className={cn("rounded-lg px-2 py-1 text-xs font-semibold")}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: `translateX(${x + 12}px) translateY(${y + 10}px)`,
            backgroundImage: `linear-gradient(to bottom right, ${color.toLowerCase()}, ${textColor.toLowerCase()})`,
          }}
        >
          <p
            className={"backdrop-invert-0"}
            style={{
              color: textColorCont,
            }}
          >
            {name}
          </p>
        </div>
      )}
    </>
  );
}
