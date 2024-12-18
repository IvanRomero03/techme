"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faBell,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import type { Session } from "next-auth";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "t/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { UserRole, readableRole } from "techme/util/UserRole";
import { NotificationBell } from "./NotificationBell";

interface TopNavBarProps {
  session?: Session;
  isCollapsed: boolean;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ session }) => {
  return (
    <div
      className={`flex items-center justify-between bg-white px-6 py-3 shadow-lg transition-all duration-300`}
    >
      <div className="flex items-center space-x-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
          {session?.user?.name?.charAt(0) ?? "G"}
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-800">
            {session?.user?.name ?? "Guest"}
          </h4>
          <p className="text-sm text-gray-500">
            {readableRole(session?.user?.role ?? UserRole.Unauthorized)}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative flex w-64 items-center rounded-full bg-gray-100 px-3 py-1 shadow-md">
          <FontAwesomeIcon icon={faSearch} className="h-4 w-4 text-gray-500" />
          <input
            className="h-8 w-full border-none bg-transparent pl-2 text-gray-700 focus:outline-none focus:ring-0"
            placeholder="Search..."
          />
        </div>

        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex cursor-pointer items-center space-x-2 p-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                {session?.user?.name?.charAt(0) ?? "G"}
              </div>
              <FontAwesomeIcon
                icon={faChevronDown}
                className="h-4 w-4 text-gray-600"
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled>Profile</DropdownMenuItem>
            <DropdownMenuItem disabled>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TopNavBar;
