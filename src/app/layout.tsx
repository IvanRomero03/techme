// app/layout.tsx
import { GeistSans } from "geist/font/sans";
import "techme/styles/globals.css";
import { type Metadata } from "next";
import { getServerAuthSession } from "techme/server/auth";
import RootClientLayout from "./_components/RootClientLayout";
import { useMyPresence, useOthers } from "@liveblocks/react/suspense";

export const metadata: Metadata = {
  title: "TechMe",
  description: "Neoris & TechMe",
  icons: [{ rel: "icon", url: "/public/favicon.ico" }],
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
      </body>
    </html>
  );
}
