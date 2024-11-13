"use client";

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
import {
  FaChartPie,
  FaClipboardList,
  FaProjectDiagram,
  FaTasks,
  FaUsers,
} from "react-icons/fa";
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

const PmDashboard = () => {
  const { data: projects } = api.projects.getMyProjectsStatus.useQuery();
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
          <CardTitle>
            <FaChartPie className="mr-2 inline-block" />
            Analyze Projects
          </CardTitle>
          <CardDescription>View project analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="rounded px-4 py-2 text-white">Analyze</Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-lg transition-shadow hover:shadow-2xl">
        <CardHeader>
          <CardTitle>
            <FaUsers className="mr-2 inline-block" />
            View Clients
          </CardTitle>
          <CardDescription>Manage your clients</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="rounded px-4 py-2 text-white"
            onClick={() => {
              window.location.href = "/clients";
            }}
          >
            View Clients
          </Button>
        </CardContent>
      </Card>

      <Card className="col-span-3 rounded-2xl shadow-lg transition-shadow hover:shadow-2xl">
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
          <CardTitle>
            <FaClipboardList className="mr-2 inline-block" />
            Your tasks (3)
          </CardTitle>
          <CardDescription>Manage your tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold">Task 1 Name</h4>
                <p className="text-sm text-gray-500">Project: Project A</p>
                <p className="text-sm text-gray-500">Category: Development</p>
              </div>
              <a href="/tasks/view/1" className="text-blue-500 hover:underline">
                View
              </a>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold">Task 2 Name</h4>
                <p className="text-sm text-gray-500">Project: Project B</p>
                <p className="text-sm text-gray-500">Category: Design</p>
              </div>
              <a href="/tasks/view/2" className="text-blue-500 hover:underline">
                View
              </a>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold">Task 3 Name</h4>
                <p className="text-sm text-gray-500">Project: Project C</p>
                <p className="text-sm text-gray-500">Category: Marketing</p>
              </div>
              <a href="/tasks/view/3" className="text-blue-500 hover:underline">
                View
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PmDashboard;
