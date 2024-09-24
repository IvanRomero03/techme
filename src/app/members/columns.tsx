"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "t/components/ui/select";
import { api } from "techme/trpc/react";
export enum UserRole {
  ProjectManager = "PM",
  Comercial = "CM",
  DigitalLead = "DL",
  LeadPresales = "LP",
  GDM = "GDM",
  Admin = "ADMIN",
  Unauthorized = "UNAUTH",
}

export type Member = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export function readableRole(role: UserRole) {
  switch (role) {
    case UserRole.ProjectManager:
      return "Project Manager";
    case UserRole.Comercial:
      return "Comercial";
    case UserRole.DigitalLead:
      return "Digital Lead";
    case UserRole.LeadPresales:
      return "Lead Presales";
    case UserRole.GDM:
      return "GDM";
    case UserRole.Admin:
      return "Admin";
    case UserRole.Unauthorized:
      return "Unauthorized";
  }
}

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
