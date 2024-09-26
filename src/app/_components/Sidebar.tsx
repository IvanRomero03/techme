"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAt,
  faBars,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faBell,
  faCalendar,
  faFileAlt,
  faUser,
  faCog,
  faSignOutAlt,
  faQuestionCircle,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleCollapse }) => {
  const [isOverviewOpen, setIsOverviewOpen] = React.useState(true);

  const toggleOverview = () => setIsOverviewOpen(!isOverviewOpen);

  return (
    <div
      className={`flex flex-col ${isCollapsed ? "w-20" : "w-64"} transition-width fixed left-0 top-0 z-40 h-screen bg-black text-white shadow-lg duration-300`}
    >
      <div className="flex h-20 items-center justify-between bg-black px-4">
        <span className="flex items-center space-x-2 text-2xl font-bold">
          <FontAwesomeIcon icon={faAt} className="h-6 w-6" />
          {!isCollapsed && <span>TechMe</span>}
        </span>
        <button
          onClick={toggleCollapse}
          className="text-white focus:outline-none"
        >
          <FontAwesomeIcon
            icon={isCollapsed ? faChevronRight : faChevronLeft}
            className="h-4 w-4"
          />
        </button>
      </div>

      <nav className="mt-4 flex flex-grow flex-col">
        <div>
          <button
            onClick={toggleOverview}
            className="flex w-full items-center px-6 py-3 transition hover:bg-gray-700"
          >
            <FontAwesomeIcon icon={faBars} className="mr-3 h-5 w-5" />
            {!isCollapsed && (
              <span className="flex-grow text-lg">Overview</span>
            )}
            {!isCollapsed && (
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`h-4 w-4 transition-transform ${isOverviewOpen ? "rotate-180 transform" : ""}`}
              />
            )}
          </button>
          {!isCollapsed && isOverviewOpen && (
            <div className="ml-10 mt-2">
              <Link
                href="/dashboard/admin"
                className="flex items-center px-6 py-2 transition hover:bg-gray-700"
              >
                <FontAwesomeIcon icon={faFileAlt} className="mr-3 h-4 w-4" />
                <span>Summary</span>
              </Link>
              <Link
                href="/projects"
                className="flex items-center px-6 py-2 transition hover:bg-gray-700"
              >
                <FontAwesomeIcon icon={faFileAlt} className="mr-3 h-4 w-4" />
                <span>Projects</span>
              </Link>
            </div>
          )}
        </div>

        <Link
          href="/notifications"
          className="flex items-center px-6 py-3 transition hover:bg-gray-700"
        >
          <FontAwesomeIcon icon={faBell} className="mr-3 h-5 w-5" />
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
          className="flex items-center px-6 py-3 transition hover:bg-gray-700"
        >
          <FontAwesomeIcon icon={faCalendar} className="mr-3 h-5 w-5" />
          {!isCollapsed && <span className="flex-grow text-lg">Calendar</span>}
        </Link>

        <Link
          href="/documents"
          className="flex items-center px-6 py-3 transition hover:bg-gray-700"
        >
          <FontAwesomeIcon icon={faFileAlt} className="mr-3 h-5 w-5" />
          {!isCollapsed && <span className="flex-grow text-lg">Documents</span>}
        </Link>

        <Link
          href="/members"
          className="flex items-center px-6 py-3 transition hover:bg-gray-700"
        >
          <FontAwesomeIcon icon={faUser} className="mr-3 h-5 w-5" />
          {!isCollapsed && <span className="flex-grow text-lg">Members</span>}
        </Link>

        <Link
          href="/settings"
          className="mt-auto flex items-center px-6 py-3 transition hover:bg-gray-700"
        >
          <FontAwesomeIcon icon={faCog} className="mr-3 h-5 w-5" />
          {!isCollapsed && <span className="flex-grow text-lg">Settings</span>}
        </Link>

        <div className="mt-4 border-t border-gray-600">
          <Link
            href="/help"
            className="flex items-center px-6 py-3 transition hover:bg-gray-700"
          >
            <FontAwesomeIcon icon={faQuestionCircle} className="mr-3 h-5 w-5" />
            {!isCollapsed && <span className="flex-grow text-lg">Help</span>}
          </Link>

          <Link
            href="/contact"
            className="flex items-center px-6 py-3 transition hover:bg-gray-700"
          >
            <FontAwesomeIcon icon={faEnvelope} className="mr-3 h-5 w-5" />
            {!isCollapsed && (
              <span className="flex-grow text-lg">Contact Us</span>
            )}
          </Link>

          <Link
            href="/"
            className="flex items-center px-6 py-3 transition hover:bg-gray-700"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 h-5 w-5" />
            {!isCollapsed && <span className="flex-grow text-lg">Log Out</span>}
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
