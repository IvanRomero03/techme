import { api } from "techme/trpc/server";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { UserRole } from "techme/util/UserRole";
import { Button } from "t/components/ui/button";
import { InviteMember } from "./InviteForm";

export default async function Members() {
  const members = await api.members.getMembers();

  return (
    <div className="flex w-full flex-col justify-center">
      <Button className="m-4 flex w-2/4 self-center">Invite new member</Button>
      <InviteMember />
      <DataTable
        columns={columns}
        data={members.map((m) => ({
          name: m.name ?? "Unknown",
          email: m.email,
          role: (m.role ?? UserRole.Unauthorized) as UserRole,
          id: m.id,
        }))}
      />
    </div>
  );
}
