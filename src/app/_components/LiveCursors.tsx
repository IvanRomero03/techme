"use client";
import { useMyPresence, useOthers } from "@liveblocks/react/suspense";
import React from "react";
import Cursor from "./Cursor";
import { Session } from "next-auth";

const COLORS = [
  ["#FF0099", "#FF7A00"],
  ["#002A95", "#00A0D2"],
  ["#6116FF", "#E32DD1"],
  ["#0EC4D1", "#1BCC00"],
  ["#FF00C3", "#FF3333"],
  ["#00C04D", "#00FFF0"],
  ["#5A2BBE", "#C967EC"],
  ["#46BE2B", "#67EC86"],
  ["#F49300", "#FFE600"],
  ["#F42900", "#FF9000"],
  ["#00FF94", "#0094FF"],
  ["#00FF40", "#1500FF"],
  ["#00FFEA", "#BF00FF"],
  ["#FFD600", "#BF00FF"],
  ["#484559", "#282734"],
  ["#881B9A", "#1D051E"],
  ["#FF00F5", "#00FFD1"],
  ["#9A501B", "#1E0505"],
  ["#FF008A", "#FAFF00"],
  ["#22BC09", "#002B1B"],
  ["#FF0000", "#000000"],
  ["#00FFB2", "#000000"],
  ["#0066FF", "#000000"],
  ["#FA00FF", "#000000"],
  ["#00A3FF", "#000000"],
  ["#00FF94", "#000000"],
  ["#AD00FF", "#000000"],
  ["#F07777", "#4E0073"],
  ["#AC77F0", "#003C73"],
];

export default function LiveCursors({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session;
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
            name: session?.user?.name?.split(" ")[0] ?? undefined,
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
              color={COLORS[connectionId % COLORS.length]![0]!}
              textColor={COLORS[connectionId % COLORS.length]![1]!}
              name={presence.cursor.name}
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
