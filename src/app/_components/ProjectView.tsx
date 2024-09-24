"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "t/components/ui/table";
import { Button } from "t/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "t/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "t/components/ui/dropdown-menu";
import { useRouter } from "next/navigation"; // Import useRouter from Next.js
import { AddProject } from "./AddProject";
import { api } from "techme/trpc/react";

// const projects = [
//   {
//     name: "Project A",
//     status: "50%", // Represents the completion status of the project
//     category: "Finance", // Category or type of the project
//     estimate: "$2,999.00", // Cost or budget estimate for the project
//     currentStage: 1, // The current stage number the project is in
//     nextStage: 2, // The next stage number that follows
//   },
//   {
//     name: "Project B",
//     status: "65%",
//     category: "Technology",
//     estimate: "$2,999.00",
//     currentStage: 4,
//     nextStage: 5,
//   },
//   {
//     name: "Project C",
//     status: "70%",
//     category: "Data",
//     estimate: "$2,999.00",
//     currentStage: 5,
//     nextStage: 6,
//   },
//   {
//     name: "Project D",
//     status: "90%",
//     category: "Technology",
//     estimate: "$2,999.00",
//     currentStage: 3,
//     nextStage: 4,
//   },
//   {
//     name: "Project E",
//     status: "10%",
//     category: "Electronics",
//     estimate: "$2,999.00",
//     currentStage: 7,
//     nextStage: 8,
//   },
// ];

export function ProjectView() {
  const router = useRouter();

  const handleViewClick = () => {
    // Navigate to the StateMenu component
    router.push("/projects/state");
  };

  const { data: projects, isLoading: projectsLoading } =
    api.projects.getMyProjects.useQuery();

  return (
    <Card className="rounded-2xl p-6 shadow-lg transition-shadow hover:shadow-2xl">
      <CardHeader className="mb-4 flex items-center justify-between">
        <CardTitle>Projects</CardTitle>
        <div className="flex space-x-4">
          <AddProject />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>A list of your current projects.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Project Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Estimate</TableHead>
              <TableHead>Current Stage</TableHead>
              <TableHead>Next Stage</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectsLoading && <div>Loading...</div>}
            {projects?.map((project) => (
              <TableRow
                key={project.project.id}
                className="cursor-pointer hover:bg-gray-100"
              >
                <TableCell className="font-medium">
                  {project.project.name}
                </TableCell>
                <TableCell>{project.project.status}</TableCell>
                <TableCell>{project.project.category}</TableCell>
                <TableCell>{project.project.stage}</TableCell>
                <TableCell>{project.project.endDate?.getDay() ?? ""}</TableCell>
                <TableCell>
                  <Button variant="link" onClick={handleViewClick}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6}>Total Projects</TableCell>
              <TableCell className="text-right">{projects?.length}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
      <CardFooter className="mt-4 flex justify-center">
        {/* Pagination */}
        <div className="flex space-x-2">
          <Button variant="outline">1</Button>
          <Button variant="outline">2</Button>
          <Button variant="outline">3</Button>
          <Button variant="outline">...</Button>
          <Button variant="outline">20</Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default ProjectView;
