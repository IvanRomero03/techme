import Link from "next/link";

import { LatestPost } from "techme/app/_components/post";
import { getServerAuthSession } from "techme/server/auth";
import { api, HydrateClient } from "techme/trpc/server";


import { Button } from "t/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "t/components/ui/card"
import { Input } from "t/components/ui/input"
import { Label } from "t/components/ui/label"


export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await getServerAuthSession();

  void api.post.getLatest.prefetch();

  return (
    <HydrateClient>

    <Card className="mx-auto max-w-sm m:10">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Click the button below to Sign in 
        </CardDescription>
      </CardHeader>
      <CardContent>

      <Link href={session ? "/api/auth/signout" : "/api/auth/signin"} className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20 flex justify-center">
        <Button variant="default" className="w-full">
          {session ? "Sign out" : "Sign in"}
        </Button>
        
      </Link>

        </CardContent>

        </Card>
      
    </HydrateClient>
  );
}
