import { type Metadata } from "next";
import { getServerAuthSession } from "techme/server/auth";
import { redirect } from "next/navigation";
import { UserRole } from "techme/util/UserRole";

export const metadata: Metadata = {
  title: "TechMe Projects",
  description: "Neoris & TechMe",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerAuthSession();
  if (
    !session?.user ||
    !(
      session.user.role === UserRole.Admin || session.user.role === UserRole.GDM
    )
  ) {
    redirect("/");
  }
  return children;
}
