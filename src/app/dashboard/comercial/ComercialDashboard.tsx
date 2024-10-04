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
import { FaChartPie, FaProjectDiagram, FaTasks, FaUsers } from "react-icons/fa"; // Import icons
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

const ComercialDashboard = () => {
  const { data: projects } = api.projects.getMyProjectsStatus.useQuery();
  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="rounded-2xl shadow-lg transition-shadow hover:shadow-2xl">
        <CardHeader>
          <CardTitle>
            <FaProjectDiagram className="mr-2 inline-block" />
            Start New Project
          </CardTitle>
          <CardDescription>Initiate a new project</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href={"/projects"}>
            <Button className="rounded px-4 py-2 text-white">
              Start Project
            </Button>
          </Link>
        </CardContent>
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
    </div>
  );
};

export default ComercialDashboard;
