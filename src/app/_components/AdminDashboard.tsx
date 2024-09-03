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
import { FaProjectDiagram, FaUsers, FaCalendarAlt, FaTasks } from "react-icons/fa"; // Import icons
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
ChartJS.register(CategoryScale, LinearScale, ArcElement, Title, Tooltip, Legend);

export function AdminDashboard() {
  return (
    <div className="p-6 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {/* Pending Projects Card */}
      <Card className="shadow-lg hover:shadow-2xl transition-shadow rounded-2xl">
        <CardHeader>
          <CardTitle>
            <FaProjectDiagram className="inline-block mr-2" />
            Pending Projects
          </CardTitle>
          <CardDescription>2 projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-lg font-medium">Project A</p>
            <p className="text-red-500 text-lg">1 Day Left</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="link" className="flex items-center space-x-2">
            <FaTasks />
            <span>View Details</span>
          </Button>
        </CardFooter>
      </Card>

      {/* Co-workers Card */}
      <Card className="shadow-lg hover:shadow-2xl transition-shadow rounded-2xl">
        <CardHeader>
          <CardTitle>
            <FaUsers className="inline-block mr-2" />
            Co-workers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="link" className="flex items-center space-x-2">
            <FaUsers />
            <span>View Co-workers</span>
          </Button>
        </CardContent>
      </Card>

      {/* Calendar Card */}
      <Card className="shadow-lg hover:shadow-2xl transition-shadow rounded-2xl">
        <CardHeader>
          <CardTitle>
            <FaCalendarAlt className="inline-block mr-2" />
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

      {/* Current Project Status Card */}
      <Card className="col-span-2 shadow-lg hover:shadow-2xl transition-shadow rounded-2xl">
        <CardHeader>
          <CardTitle>
            <FaTasks className="inline-block mr-2" />
            Current Project Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Project A</Label>
              <Progress value={75} className="mt-1" />
            </div>
            <div>
              <Label>Project B</Label>
              <Progress value={45} className="mt-1" />
            </div>
            <div>
              <Label>Project C</Label>
              <Progress value={60} className="mt-1" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Export Data</Button>
          <Button variant="outline">Last 10 Projects</Button>
        </CardFooter>
      </Card>

      {/* Top Categories Card */}
      <Card className="shadow-lg hover:shadow-2xl transition-shadow rounded-2xl">
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
