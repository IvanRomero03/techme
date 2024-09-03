import Link from "next/link";
import { LatestPost } from "techme/app/_components/post";
import { getServerAuthSession } from "techme/server/auth";
import { api, HydrateClient } from "techme/trpc/server";
import { signIn } from 'next-auth/react';
import { Button } from "t/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "t/components/ui/card";
import { Input } from "t/components/ui/input";
import { Label } from "t/components/ui/label";
import SigninGoogle from "./_components/SigninGoogle";
import SigninAzure from "./_components/SigninAzure";
import SignOut from "./_components/SignOut";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await getServerAuthSession();

  void api.post.getLatest.prefetch();

  return (
    <Card className="mx-auto max-w-sm m:10">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Click the button below to Sign in</CardDescription>
      </CardHeader>
      <CardContent>
        {!session && (
          <>
            <SigninGoogle />
            <SigninAzure />
          </>
        )}

        {session && (
          <>
            <Link href={"/dashboard/admin"}>
              <Button variant="default" className="w-full mt-4">
                Go to Dashboard
              </Button>
            </Link>
            
            <SignOut />


          </>
        )}
      </CardContent>
    </Card>
  );
}
