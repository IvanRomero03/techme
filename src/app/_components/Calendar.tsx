// app/_components/CalendarComponent.tsx

"use client";

import * as React from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Define the locales for date-fns
const locales = {
  "en-US": enUS,
};

// Configure the localizer for react-big-calendar
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Example events
const events = [
  {
    title: "Meeting with John",
    start: new Date(2024, 8, 10, 10, 0), // September 10, 2024, 10:00 AM
    end: new Date(2024, 8, 10, 11, 0),   // September 10, 2024, 11:00 AM
  },
  {
    title: "Lunch with Sarah",
    start: new Date(2024, 8, 12, 12, 30), // September 12, 2024, 12:30 PM
    end: new Date(2024, 8, 12, 13, 30),   // September 12, 2024, 1:30 PM
  },
  {
    title: "Project Deadline",
    start: new Date(2024, 8, 15),         // September 15, 2024
    end: new Date(2024, 8, 15),           // September 15, 2024
  },
];

const CalendarComponent = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Calendar</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500, width: "100%" }}
        className="shadow-lg rounded-md bg-white p-4"
      />
    </div>
  );
};

export default CalendarComponent;