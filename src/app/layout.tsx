// app/layout.tsx
import { GeistSans } from "geist/font/sans";
import "techme/styles/globals.css";
import { type Metadata } from "next";
import { getServerAuthSession } from "techme/server/auth";
import RootClientLayout from "./_components/RootClientLayout";

export const metadata: Metadata = {
  title: "Create T3 App",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
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
