"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopNavBar from "./TopNavBar";
import { TRPCReactProvider } from "techme/trpc/react";
import type { Session } from "next-auth";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
  useMyPresence,
  useOthers,
} from "@liveblocks/react/suspense";
import LiveCursors from "./LiveCursors";

interface RootClientLayoutProps {
  children: React.ReactNode;
  session?: Session; // Replace with actual session type if available
}

const RootClientLayout: React.FC<RootClientLayoutProps> = ({
  children,
  session,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <LiveblocksProvider
      publicApiKey={process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_API_KEY ?? ""}
    >
      <RoomProvider id="my-room" initialPresence={{ cursor: { x: 0, y: 0 } }}>
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          <TRPCReactProvider>
            <div className="flex h-screen">
              {/* Sidebar with dynamic width based on collapsed state */}
              <Sidebar
                isCollapsed={isCollapsed}
                toggleCollapse={toggleCollapse}
              />

              {/* Main Content Area */}
              <LiveCursors>
                <div
                  className={`flex flex-col transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-64"} w-full`}
                >
                  <TopNavBar session={session} isCollapsed={isCollapsed} />
                  <div className="flex-grow bg-gradient-to-b from-[#FFFFFF] to-[#FFFFFF] p-4 text-black">
                    {children}
                  </div>
                </div>
              </LiveCursors>
            </div>
          </TRPCReactProvider>
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
};

export default RootClientLayout;
