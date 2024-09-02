"use client";
import { useMyPresence, useOthers } from "@liveblocks/react/suspense";
import React from "react";
import Cursor from "./Cursor";

const COLORS = [
  "#E57373",
  "#9575CD",
  "#4FC3F7",
  "#81C784",
  "#FFF176",
  "#FF8A65",
  "#F06292",
  "#7986CB",
];

export default function LiveCursors({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ cursor }, updateMyPresence] = useMyPresence();
  const others = useOthers();
  return (
    <div
      onPointerMove={(event) => {
        // Update the user cursor position on every pointer move
        updateMyPresence({
          cursor: {
            x: Math.round(event.clientX),
            y: Math.round(event.clientY),
          },
        });
      }}
      onPointerLeave={() =>
        // When the pointer goes out, set cursor to null
        updateMyPresence({
          cursor: undefined,
        })
      }
    >
      {
        /**
         * Iterate over other users and display a cursor based on their presence
         */
        others.map(({ connectionId, presence }) => {
          if (presence.cursor === null || presence.cursor === undefined) {
            return null;
          }

          return (
            <Cursor
              key={`cursor-${connectionId}`}
              // connectionId is an integer that is incremented at every new connections
              // Assigning a color with a modulo makes sure that a specific user has the same colors on every clients
              color={COLORS[connectionId % COLORS.length]!}
              x={presence.cursor.x}
              y={presence.cursor.y}
            />
          );
        })
      }
      {children}
    </div>
  );
}
