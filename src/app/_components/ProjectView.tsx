"use client";

import { Ellipsis } from "lucide-react";
import { useRouter } from "next/navigation"; // Import useRouter from Next.js
import { Button } from "t/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "t/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "t/components/ui/dropdown-menu";
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
import { api } from "techme/trpc/react";
import { AddProject } from "./AddProject";
import { format } from "date-fns";
import {
  type ProjectStage,
  type ProjectStatus,
  readableProjectStage,
  readableProjectStatus,
} from "techme/util/Readables";

export function ProjectView() {
  const router = useRouter();

  const { mutateAsync: deleteProject } =
    api.projects.deleteProject.useMutation();
  const utils = api.useUtils();

  const handleRemove = async (id: number) => {
    await deleteProject({
      projectId: id,
    });
    await utils.projects.invalidate();
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
              <TableHead>Current Stage</TableHead>
              <TableHead>End date</TableHead>
              <TableHead>View</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectsLoading && <div>Loading...</div>}
            {projects?.map((project) => (
              <TableRow
                key={project.project.id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => router.push(`/projects/${project.project.id}`)}
              >
                <TableCell className="font-medium">
                  {project.project.name}
                </TableCell>
                <TableCell>
                  {readableProjectStatus(
                    project.project.status as ProjectStatus,
                  )}
                </TableCell>
                <TableCell>{project.project.category}</TableCell>
                <TableCell>
                  {readableProjectStage(project.project.stage as ProjectStage)}
                </TableCell>
                <TableCell>
                  {project.project.endDate != null &&
                    format(project.project.endDate, "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  <Button
                    variant="link"
                    onClick={() =>
                      router.push(`/projects/${project.project.id}`)
                    }
                  >
                    View
                  </Button>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="outline">
                        <Ellipsis className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={async () =>
                          await handleRemove(project.project.id)
                        }
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
