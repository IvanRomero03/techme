"use client";

import {
  faAt,
  faBell,
  faCalendar,
  faChevronLeft,
  faChevronRight,
  faCog,
  faEnvelope,
  faFileAlt,
  faQuestionCircle,
  faSignOutAlt,
  faUser,
  faTableColumns,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import Link from "next/link";
import React from "react";

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  session?: Session;
}

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  toggleCollapse,
  session,
}) => {
  const userRole = session?.user?.role?.toLowerCase() || "guest";

  return (
    <div
      className={`flex flex-col ${isCollapsed ? "w-20" : "w-64"} transition-width fixed left-0 top-0 z-40 h-screen justify-center bg-black text-white shadow-lg duration-300`}
    >
      <div
        className="flex h-20 items-center justify-between bg-black px-4"
        onClick={toggleCollapse}
      >
        <span className="flex items-center space-x-2 text-2xl font-bold hover:cursor-pointer">
          <FontAwesomeIcon icon={faAt} className="h-6 w-6" />
          {!isCollapsed && <span>TechMe</span>}
        </span>
        <button className="text-white focus:outline-none">
          <FontAwesomeIcon
            icon={isCollapsed ? faChevronRight : faChevronLeft}
            className="h-4 w-4"
          />
        </button>
      </div>

      <nav className="mt-4 flex flex-grow flex-col justify-center">
        <Link
          href={`/dashboard/${userRole}`}
          className="flex items-center justify-center px-6 py-3 transition hover:bg-gray-700"
        >
          <FontAwesomeIcon
            icon={faTableColumns}
            className="mr-3 h-5 w-5 self-center"
          />
          {!isCollapsed && <span className="flex-grow text-lg">Dashboard</span>}
        </Link>
        <Link
          href="/projects"
          className="flex items-center justify-center px-6 py-3 transition hover:bg-gray-700"
        >
          <FontAwesomeIcon
            icon={faFileAlt}
            className="mr-3 h-5 w-5 self-center"
          />
          {!isCollapsed && <span className="flex-grow text-lg">Projects</span>}
        </Link>

        <Link
          href="/notifications"
          className="flex items-center justify-center px-6 py-3 transition hover:bg-gray-700"
        >
          <FontAwesomeIcon icon={faBell} className="mr-3 h-5 w-5 self-center" />
          {!isCollapsed && (
            <span className="flex-grow text-lg">Notifications</span>
          )}
          {!isCollapsed && (
            <span className="rounded-full bg-gray-600 px-2 py-1 text-xs">
              2
            </span>
          )}
        </Link>

        <Link
          href="/calendar"
          className="flex items-center justify-center px-6 py-3 transition hover:bg-gray-700"
        >
          <FontAwesomeIcon
            icon={faCalendar}
            className="mr-3 h-5 w-5 self-center"
          />
          {!isCollapsed && <span className="flex-grow text-lg">Calendar</span>}
        </Link>

        <Link
          href="/documents"
          className="flex items-center justify-center px-6 py-3 transition hover:bg-gray-700"
        >
          <FontAwesomeIcon
            icon={faFileAlt}
            className="mr-3 h-5 w-5 self-center"
          />
          {!isCollapsed && <span className="flex-grow text-lg">Documents</span>}
        </Link>

        <Link
          href="/members"
          className="flex items-center justify-center px-6 py-3 transition hover:bg-gray-700"
        >
          <FontAwesomeIcon icon={faUser} className="mr-3 h-5 w-5 self-center" />
          {!isCollapsed && <span className="flex-grow text-lg">Members</span>}
        </Link>

        <Link
          href="/settings"
          className="mt-auto flex items-center px-6 py-3 transition hover:bg-gray-700"
        >
          <FontAwesomeIcon icon={faCog} className="mr-3 h-5 w-5 self-center" />
          {!isCollapsed && <span className="flex-grow text-lg">Settings</span>}
        </Link>

        <div className="mt-4 border-t border-gray-600">
          <Link
            href="/help"
            className="flex items-center justify-center px-6 py-3 transition hover:bg-gray-700"
          >
            <FontAwesomeIcon
              icon={faQuestionCircle}
              className="mr-3 h-5 w-5 self-center"
            />
            {!isCollapsed && <span className="flex-grow text-lg">Help</span>}
          </Link>

          <Link
            href="/contact"
            className="flex items-center justify-center px-6 py-3 transition hover:bg-gray-700"
          >
            <FontAwesomeIcon
              icon={faEnvelope}
              className="mr-3 h-5 w-5 self-center"
            />
            {!isCollapsed && (
              <span className="flex-grow text-lg">Contact Us</span>
            )}
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center px-6 py-3 transition hover:bg-gray-700"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <FontAwesomeIcon
              icon={faSignOutAlt}
              className="mr-3 h-5 w-5 self-center"
            />
            {!isCollapsed && <span className="flex-grow text-lg">Log Out</span>}
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
