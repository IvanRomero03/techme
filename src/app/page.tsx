import Link from "next/link";
import { Button } from "t/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "t/components/ui/card";
import { getServerAuthSession } from "techme/server/auth";
import SigninAzure from "./_components/SigninAzure";
import SigninGoogle from "./_components/SigninGoogle";
import SignOut from "./_components/SignOut";
import { LoginForm } from "./_components/login";

export default async function Home() {
  const session = await getServerAuthSession();

  return (
    <Card className="m:10 mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Click the button below to Sign in</CardDescription>
      </CardHeader>
      <CardContent>
        {!session && (
          <>
            <LoginForm />
            <SigninGoogle />
            <SigninAzure />
          </>
        )}

        {session && (
          <>
            <Link href={`/dashboard/${session.user.role.toLowerCase()}`}>
              <Button variant="default" className="mt-4 w-full">
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
