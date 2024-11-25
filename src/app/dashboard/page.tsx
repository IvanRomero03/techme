// app/dashboard/admin.tsx
import { redirect } from "next/navigation";
import { getServerAuthSession } from "techme/server/auth";
import { UserRole } from "techme/util/UserRole";

const AdminPage = async () => {
  const session = await getServerAuthSession();
  if (!session?.user || session.user.role === UserRole.Unauthorized) {
    redirect("/");
  }
  const desiredUrl = "/dashboard/" + session.user.role.toLowerCase();
  redirect(desiredUrl);
  return <h1>Please Login with a Registered Account with valid role</h1>;
};

export default AdminPage;
