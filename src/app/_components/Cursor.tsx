import { cn } from "lib/utils 2";
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
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
          fill={color}
        />
      </svg>
      {name != undefined && (
        <p
          className={cn("rounded-lg px-1 py-0.5 text-xs font-semibold")}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: `translateX(${x + 14}px) translateY(${y}px)`,
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
        </p>
      )}
    </>
  );
}
