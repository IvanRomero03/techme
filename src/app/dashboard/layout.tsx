import { type Metadata } from "next";
import { getServerAuthSession } from "techme/server/auth";
import { redirect } from "next/navigation";
import { UserRole } from "techme/util/UserRole";

export const metadata: Metadata = {
  title: "TechMe Dashboard",
  description: "Neoris & TechMe",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerAuthSession();
  if (!session?.user || session.user.role === UserRole.Unauthorized) {
    redirect("/");
  }
  return children;
}
