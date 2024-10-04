"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "t/components/ui/select";
import { api } from "techme/trpc/react";
import { readableRole, UserRole } from "techme/util/UserRole";

type Member = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

function SelectableRole({ row }: { row: { original: Member } }) {
  const member = row.original;
  const [role, setRole] = useState(readableRole(member.role));
  const { mutateAsync } = api.members.updateUserRole.useMutation();
  const { members } = api.useUtils();
  return (
    <Select
      onValueChange={async (value) => {
        if (value === (member.role as string)) return;
        if (!value) return;
        await mutateAsync({ id: member.id, role: value });
        setRole(readableRole(value as UserRole));
        row.original.role = value as UserRole;
        void members.getMembers.invalidate();
      }}
    >
      <SelectTrigger>{role}</SelectTrigger>
      <SelectContent>
        <SelectItem value={UserRole.ProjectManager}>Project Manager</SelectItem>
        <SelectItem value={UserRole.Comercial}>Comercial</SelectItem>
        <SelectItem value={UserRole.DigitalLead}>Digital Lead</SelectItem>
        <SelectItem value={UserRole.LeadPresales}>Lead Presales</SelectItem>
        <SelectItem value={UserRole.GDM}>GDM</SelectItem>
        <SelectItem value={UserRole.Admin}>Admin</SelectItem>
        <SelectItem value={UserRole.Unauthorized}>Unauthorized</SelectItem>
      </SelectContent>
    </Select>
  );
}

export const columns: ColumnDef<Member>[] = [
  {
    accessorKey: "name",
    header: "Name",
    enableSorting: true,
    accessorFn: (row) => row.name,
  },
  {
    accessorKey: "email",
    header: "Email",
    enableSorting: true,
    accessorFn: (row) => row.email,
  },
  {
    // accessorKey: "role",
    header: "Role",
    enableSorting: true,
    accessorFn: (row) => readableRole(row.role),
    cell: SelectableRole,
  },
];
