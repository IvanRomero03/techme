import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { getServerAuthSession } from "techme/server/auth";
import "techme/styles/globals.css";
import RootClientLayout from "./_components/RootClientLayout";
import { Toaster } from "t/components/ui/toaster";

export const metadata: Metadata = {
  title: "TechMe",
  description: "Neoris & TechMe",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerAuthSession();

  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <RootClientLayout session={session ?? undefined}>
          {children}
        </RootClientLayout>
        <Toaster />
      </body>
    </html>
  );
}
