"use client";
// app/_components/AdminDashboard.tsx
import * as React from "react";
import { Button } from "t/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "t/components/ui/card";
import { Input } from "t/components/ui/input";
import { Label } from "t/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "t/components/ui/select";
import { Progress } from "t/components/ui/progress";
import { Doughnut } from "react-chartjs-2";
import {
  FaProjectDiagram,
  FaUsers,
  FaCalendarAlt,
  FaTasks,
  FaChartPie,
} from "react-icons/fa"; // Import icons
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

const ComercialDashboard = () => {
  return (
    <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Start New Project Card */}
      <Card className="rounded-2xl shadow-lg transition-shadow hover:shadow-2xl">
        <CardHeader>
          <CardTitle>
            <FaProjectDiagram className="mr-2 inline-block" />
            Start New Project
          </CardTitle>
          <CardDescription>Initiate a new project</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="rounded px-4 py-2 text-white"
            onClick={() => {
              // Navigate to the clients page
              window.location.href = "/projects";
            }}
          >
            Start Project
          </Button>
        </CardContent>
      </Card>

      {/* Analyze Projects Card */}
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

      {/* View Clients Card */}
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

      {/* Current Project Status Card */}
      {/*Modify to make dynamic*/}
      <Card className="col-span-3 rounded-2xl shadow-lg transition-shadow hover:shadow-2xl">
        <CardHeader>
          <CardTitle>
            <FaTasks className="mr-2 inline-block" />
            Current Project Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Button
                variant={"ghost"}
                // Adjust to navigate to the projects page according to ID
                onClick={() => {
                  window.location.href = "/projects";
                }}
              >
                Project A
              </Button>
              <Progress value={75} className="mt-1" />
            </div>
            <div>
              <Button
                variant={"ghost"}
                onClick={() => {
                  window.location.href = "/projects";
                }}
              >
                Project B
              </Button>
              <Progress value={45} className="mt-1" />
            </div>
            <div>
              <Button
                variant={"ghost"}
                onClick={() => {
                  window.location.href = "/projects";
                }}
              >
                Project C
              </Button>
              <Progress value={60} className="mt-1" />
            </div>
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
