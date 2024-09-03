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

const projects = [
  {
    name: "Project A",
    status: "50%",
    category: "Finance",
    estimate: "$2,999.00",
    currentStage: 1,
    nextStage: 2,
  },
  {
    name: "Project B",
    status: "65%",
    category: "Technology",
    estimate: "$2,999.00",
    currentStage: 4,
    nextStage: 5,
  },
  {
    name: "Project C",
    status: "70%",
    category: "Data",
    estimate: "$2,999.00",
    currentStage: 5,
    nextStage: 6,
  },
  {
    name: "Project D",
    status: "90%",
    category: "Technology",
    estimate: "$2,999.00",
    currentStage: 3,
    nextStage: 4,
  },
  {
    name: "Project E",
    status: "10%",
    category: "Electronics",
    estimate: "$2,999.00",
    currentStage: 7,
    nextStage: 8,
  },
];

export function ProjectView() {
  return (
    <Card className="rounded-2xl p-6 shadow-lg transition-shadow hover:shadow-2xl">
      <CardHeader className="mb-4 flex items-center justify-between">
        <CardTitle>Projects</CardTitle>
        <div className="flex space-x-4">
          <Button variant="default" className="flex items-center space-x-2">
            + Add Project
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Export data</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>CSV</DropdownMenuItem>
              <DropdownMenuItem>Excel</DropdownMenuItem>
              <DropdownMenuItem>PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Sort by: Project Name</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Name</DropdownMenuItem>
              <DropdownMenuItem>Status</DropdownMenuItem>
              <DropdownMenuItem>Category</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            {projects.map((project) => (
              <TableRow
                key={project.name}
                className="cursor-pointer hover:bg-gray-100"
              >
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>{project.status}</TableCell>
                <TableCell>{project.category}</TableCell>
                <TableCell>{project.estimate}</TableCell>
                <TableCell>{project.currentStage}</TableCell>
                <TableCell>{project.nextStage}</TableCell>
                <TableCell>
                  <Button variant="link">View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6}>Total Projects</TableCell>
              <TableCell className="text-right">{projects.length}</TableCell>
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
