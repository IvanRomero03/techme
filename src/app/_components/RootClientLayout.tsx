"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopNavBar from "./TopNavBar";
import { TRPCReactProvider } from "techme/trpc/react";

interface RootClientLayoutProps {
  children: React.ReactNode;
  session: any; // Replace with actual session type if available
}

const RootClientLayout: React.FC<RootClientLayoutProps> = ({ children, session }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <TRPCReactProvider>
      <div className="flex h-screen">
        <Sidebar isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />
        <div className={`flex flex-col w-full transition-all duration-300`}>
          <TopNavBar session={session} isCollapsed={isCollapsed} />
          <div className="p-4 flex-grow bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
            {children}
          </div>
        </div>
      </div>
    </TRPCReactProvider>
  );
};

export default RootClientLayout;
