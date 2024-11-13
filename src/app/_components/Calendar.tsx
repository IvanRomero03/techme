"use client";

import * as React from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { api } from "techme/trpc/react"; 
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type ProjectEvent = {
  id: number;
  title: string;
  start: Date;
  end: Date;
};

type MeetingEvent = {
  id: number;
  title: string;
  start: Date;
  end: Date;
};

const CalendarComponent = () => {
  const [events, setEvents] = React.useState<(ProjectEvent | MeetingEvent)[]>([]);

  const { data: projectDates, isLoading: isLoadingProjects, error: errorProjects } = api.calendaryDates.getProjectDates.useQuery();
  const { data: meetingDates, isLoading: isLoadingMeetings, error: errorMeetings } = api.calendaryMeetings.getMeetings.useQuery();

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (projectDates && meetingDates) {
          const formattedProjectEvents = projectDates
            .map((project: { id: number; name: string; startDate: Date | null; endDate: Date | null }) => {
              const start = project.startDate ? new Date(project.startDate) : null;
              const end = project.endDate ? new Date(project.endDate) : null;

              if (start && end) {
                return {
                  title: project.name,
                  start,
                  end,
                  id: project.id,
                };
              }
              return null;
            })
            .filter((event) => event !== null) as ProjectEvent[]; 

          const formattedMeetingEvents = meetingDates
            .map((meeting: { id: number; title: string; date: Date | null }) => {
              const start = meeting.date ? new Date(meeting.date) : null;

              if (start) {
                return {
                  title: meeting.title,
                  start,
                  end: start,
                  id: meeting.id,
                };
              }
              return null;
            })
            .filter((event) => event !== null) as MeetingEvent[]; 

          setEvents([...formattedProjectEvents, ...formattedMeetingEvents]);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    
    void fetchEvents();
  }, [projectDates, meetingDates]);

  const eventStyleGetter = () => {
    return {
      style: {
        backgroundColor: "black",
        color: "white",
      },
    };
  };

  return (
    <div className="p-6">
      <h2 className="mb-4 text-2xl font-bold">Project and Meeting Calendar</h2>
      {isLoadingProjects || isLoadingMeetings ? (
        <p>Loading events...</p>
      ) : errorProjects || errorMeetings ? (
        <p>Error loading events: {errorProjects?.message ?? errorMeetings?.message}</p>
      ) : (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500, width: "100%" }}
          eventPropGetter={eventStyleGetter}
          className="rounded-md bg-white p-4 shadow-lg"
        />
      )}
    </div>
  );
};

export default CalendarComponent;
