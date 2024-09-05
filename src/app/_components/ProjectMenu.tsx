"use client";

import React, { useState } from "react";
import { Button } from "t/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "t/components/ui/card";
import { cn } from "lib/utils";

export default function ProjectMenu() {
  const [activeMenuItem, setActiveMenuItem] = useState("Estimations");

  const menuItems = [
    "Requirements",
    "Planning",
    "Analysis",
    "Estimations",
    "Proposals",
    "Validation",
  ];

  const handleMenuClick = (item: string) => {
    setActiveMenuItem(item);
  };

  return (
    <div className="flex h-full w-full">
      {/* Sidebar Menu */}
      <div className="my-4 w-1/5 rounded-2xl bg-gray-100 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item}>
              <button
                className={cn(
                  "w-full rounded-md px-4 py-2 text-left transition-colors",
                  activeMenuItem === item ? "bg-gray-200" : "bg-transparent",
                )}
                onClick={() => handleMenuClick(item)}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="mx-6 w-3/4 rounded-2xl border p-8 shadow-md">
        {/* Estimations Section */}
        <h2 className="mb-4 text-2xl font-bold">{activeMenuItem}</h2>

        <div className="mb-6 grid grid-cols-2 gap-5">
          {/* Example Phase Cards */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle>Phase</CardTitle>
            </CardHeader>
            <CardContent className="flex space-x-4">
              <Button variant="outline">Time Estimation</Button>
              <Button variant="outline">Manforce</Button>
            </CardContent>
          </Card>
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle>Phase</CardTitle>
            </CardHeader>
            <CardContent className="flex space-x-4">
              <Button variant="outline">Time Estimation</Button>
              <Button variant="outline">Manforce</Button>
            </CardContent>
          </Card>
        </div>

        {/* New Phase Button */}
        <div className="mb-6 flex">
          <Button variant="default">New Phase</Button>
        </div>

        {/* Total Estimation Section */}
        <h3 className="mb-4 text-xl font-bold">Total Estimation</h3>
        <div className="flex space-x-4">
          <Button variant="outline">Time Estimation</Button>
          <Button variant="outline">Manforce</Button>
        </div>
      </div>
    </div>
  );
};

