"use client";
// app/_components/AdminDashboard.tsx
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import Link from "next/link";
import { Doughnut } from "react-chartjs-2";
import { FaCalendarAlt, FaProjectDiagram, FaTasks } from "react-icons/fa"; // Import icons
import { Button } from "t/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "t/components/ui/card";
import { Progress } from "t/components/ui/progress";
import { api } from "techme/trpc/react";
import { readableRole, type UserRole } from "techme/util/UserRole";

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

export interface ProjectDays {
  id: number;
  name: string;
  completion_percentage: number | null;
  days_left: number | null;
}

export function AdminDashboard() {
  const { data: projects } = api.projects.getMyProjectsStatus.useQuery();
  const { data: members } = api.members.getTopMembers.useQuery();
  const { data: projectsDays, isLoading } =
    api.projects.getMyProjectsDeadline.useQuery();

  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="rounded-2xl shadow-lg transition-shadow hover:shadow-2xl">
        <CardHeader>
          <CardTitle>
            <FaProjectDiagram className="mr-2 inline-block" />
            Pending Projects
          </CardTitle>
          <CardDescription>
            {projectsDays?.length ?? 0} projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              projectsDays?.map((projectDays) => (
                <div key={projectDays.id}>
                  <p className="text-lg font-medium">{projectDays.name}</p>
                  <p
                    className={`text-lg ${typeof projectDays.days_left === "number" && projectDays.days_left <= 1 ? "text-red-500" : "text-yellow-500"}`}
                  >
                    {String(projectDays.days_left)}{" "}
                    {projectDays.days_left === 1 ? "Day" : "Days"} Left
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="link" className="flex items-center space-x-2">
            <FaTasks />
            <span>View Details</span>
          </Button>
        </CardFooter>
      </Card>

      <Card className="rounded-2xl shadow-lg transition-shadow hover:shadow-2xl">
        <CardHeader>
          <CardTitle>Co-workers</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {members?.map(
              (
                member: {
                  id: string;
                  role: string | null;
                  image: string | null;
                  name: string | null;
                  email: string;
                  emailVerified: Date | null;
                },
                index: number,
              ) => (
                <li key={index} className="flex items-center space-x-2">
                  <span className="font-medium">
                    {member.name ?? "Unknown"}
                  </span>
                  <span className="text-sm text-gray-500">
                    {readableRole(member.role as UserRole) ?? "No role"}
                  </span>
                </li>
              ),
            )}
          </ul>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-lg transition-shadow hover:shadow-2xl">
        <CardHeader>
          <CardTitle>
            <FaCalendarAlt className="mr-2 inline-block" />
            Calendar
          </CardTitle>
          <CardDescription>12/08/2024</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">2 events today</p>
        </CardContent>
        <CardFooter>
          <Button variant="link" className="flex items-center space-x-2">
            <FaCalendarAlt />
            <span>View Calendar</span>
          </Button>
        </CardFooter>
      </Card>

      <Card className="col-span-2 rounded-2xl shadow-lg transition-shadow hover:shadow-2xl">
        <CardHeader>
          <CardTitle>
            <FaTasks className="mr-2 inline-block" />
            Current Project Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects?.map((project, index) => (
              <div key={index}>
                <Link href={`/projects/${project.id}`}>
                  <Button variant={"ghost"}>{project.name}</Button>
                </Link>
                <Progress
                  value={project.completion_percentage ?? 0}
                  className="mt-1"
                />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Export Data</Button>
          <Button variant="outline">Last 10 Projects</Button>
        </CardFooter>
      </Card>

      <Card className="rounded-2xl shadow-lg transition-shadow hover:shadow-2xl">
        <CardHeader>
          <CardTitle>Top Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <Doughnut
            data={{
              labels: ["Electronics", "Laptops", "Phones"],
              datasets: [
                {
                  data: [60, 25, 15],
                  backgroundColor: ["#4b5563", "#9ca3af", "#d1d5db"],
                },
              ],
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminDashboard;
