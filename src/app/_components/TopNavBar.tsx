"use client";

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBell, faChevronDown } from '@fortawesome/free-solid-svg-icons';

interface TopNavBarProps {
  session: any; // Replace with actual session type if available
  isCollapsed: boolean;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ session, isCollapsed }) => {
  return (
    <div
      className={`flex items-center justify-between px-6 py-3 bg-white shadow-lg transition-all duration-300`}
      style={{
        width: `calc(100% - ${isCollapsed ? "80px" : "256px"})`,
        marginLeft: isCollapsed ? "80px" : "256px",
      }}
    >
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          {session?.user?.name?.charAt(0) || 'G'}
        </div>
        <div>
          <h4 className="font-semibold text-lg text-gray-800">{session?.user?.name || 'Guest'}</h4>
          <p className="text-sm text-gray-500">Comercial</p>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative flex items-center bg-gray-100 rounded-full shadow-md px-3 py-1 w-64">
          <FontAwesomeIcon icon={faSearch} className="text-gray-500 w-4 h-4" />
          <input
            className="bg-transparent border-none focus:ring-0 focus:outline-none pl-2 text-gray-700 w-full h-8"
            placeholder="Search..."
          />
        </div>

        <button className="relative p-2">
          <FontAwesomeIcon icon={faBell} className="text-gray-600 w-5 h-5" />
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-semibold text-white bg-red-500 rounded-full">4</span>
        </button>

        <div className="flex items-center space-x-2 p-2 cursor-pointer">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            {session?.user?.name?.charAt(0) || 'G'}
          </div>
          <FontAwesomeIcon icon={faChevronDown} className="text-gray-600 w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default TopNavBar;
