"use client";

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAt, faBars, faChevronDown, faChevronLeft, faChevronRight, faBell, faCalendar, faFileAlt, faUser, faCog, faSignOutAlt, faQuestionCircle, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleCollapse }) => {
  const [isOverviewOpen, setIsOverviewOpen] = React.useState(false);

  const toggleOverview = () => setIsOverviewOpen(!isOverviewOpen);

  return (
    <div className={`flex flex-col ${isCollapsed ? 'w-20' : 'w-64'} h-screen bg-black text-white fixed top-0 left-0 z-40 shadow-lg transition-width duration-300`}>
      <div className="flex items-center justify-between h-20 px-4 bg-black">
        <span className="text-2xl font-bold flex items-center space-x-2">
          <FontAwesomeIcon icon={faAt} className="w-6 h-6" />
          {!isCollapsed && <span>TechMe</span>}
        </span>
        <button onClick={toggleCollapse} className="text-white focus:outline-none">
          <FontAwesomeIcon icon={isCollapsed ? faChevronRight : faChevronLeft} className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex flex-col flex-grow mt-4">
        <div>
          <button
            onClick={toggleOverview}
            className="flex items-center w-full px-6 py-3 hover:bg-gray-700 transition"
          >
            <FontAwesomeIcon icon={faBars} className="w-5 h-5 mr-3" />
            {!isCollapsed && <span className="text-lg flex-grow">Overview</span>}
            {!isCollapsed && <FontAwesomeIcon icon={faChevronDown} className={`w-4 h-4 transition-transform ${isOverviewOpen ? 'transform rotate-180' : ''}`} />}
          </button>
          {!isCollapsed && isOverviewOpen && (
            <div className="ml-10 mt-2">
              <Link href="/summary" className="flex items-center px-6 py-2 hover:bg-gray-700 transition">
                <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4 mr-3" />
                <span>Summary</span>
              </Link>
              <Link href="/projects" className="flex items-center px-6 py-2 hover:bg-gray-700 transition">
                <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4 mr-3" />
                <span>Projects</span>
              </Link>
            </div>
          )}
        </div>

        <Link href="/notifications" className="flex items-center px-6 py-3 hover:bg-gray-700 transition">
          <FontAwesomeIcon icon={faBell} className="w-5 h-5 mr-3" />
          {!isCollapsed && (
            <span className="text-lg flex-grow">Notifications</span>
          )}
          {!isCollapsed && (
            <span className="bg-gray-600 rounded-full px-2 py-1 text-xs">2</span>
          )}
        </Link>

        <Link href="/calendar" className="flex items-center px-6 py-3 hover:bg-gray-700 transition">
          <FontAwesomeIcon icon={faCalendar} className="w-5 h-5 mr-3" />
          {!isCollapsed && <span className="text-lg flex-grow">Calendar</span>}
        </Link>

        <Link href="/documents" className="flex items-center px-6 py-3 hover:bg-gray-700 transition">
          <FontAwesomeIcon icon={faFileAlt} className="w-5 h-5 mr-3" />
          {!isCollapsed && <span className="text-lg flex-grow">Documents</span>}
        </Link>

        <Link href="/customers" className="flex items-center px-6 py-3 hover:bg-gray-700 transition">
          <FontAwesomeIcon icon={faUser} className="w-5 h-5 mr-3" />
          {!isCollapsed && <span className="text-lg flex-grow">Customers</span>}
        </Link>

        <Link href="/settings" className="flex items-center px-6 py-3 hover:bg-gray-700 transition mt-auto">
          <FontAwesomeIcon icon={faCog} className="w-5 h-5 mr-3" />
          {!isCollapsed && <span className="text-lg flex-grow">Settings</span>}
        </Link>

        <div className="mt-4 border-t border-gray-600">
          <Link href="/help" className="flex items-center px-6 py-3 hover:bg-gray-700 transition">
            <FontAwesomeIcon icon={faQuestionCircle} className="w-5 h-5 mr-3" />
            {!isCollapsed && <span className="text-lg flex-grow">Help</span>}
          </Link>

          <Link href="/contact" className="flex items-center px-6 py-3 hover:bg-gray-700 transition">
            <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5 mr-3" />
            {!isCollapsed && <span className="text-lg flex-grow">Contact Us</span>}
          </Link>

          <Link href="/logout" className="flex items-center px-6 py-3 hover:bg-gray-700 transition">
            <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5 mr-3" />
            {!isCollapsed && <span className="text-lg flex-grow">Log Out</span>}
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
