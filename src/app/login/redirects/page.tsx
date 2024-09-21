import { getServerAuthSession } from "techme/server/auth";
import { redirect } from "next/navigation";

export default async function Page({}) {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/login");
  }
  if (session) {
    redirect("/dashboard/" + session.user.role);
  }
  return (
    <div>
      <h1>Welcom</h1>
      <p>You are now logged in. Redirecting...</p>
    </div>
  );
}
