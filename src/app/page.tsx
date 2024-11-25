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
import { UserRole } from "techme/util/UserRole";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerAuthSession();

  if (session?.user && session.user.role !== UserRole.Unauthorized) {
    redirect("/dashboard/");
  }

  return (
    <Card className="m:10 mx-auto max-w-sm">
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

        {session && session.user.role !== UserRole.Unauthorized && (
          <>
            <Link href={`/dashboard/${session.user.role.toLowerCase()}`}>
              <Button variant="default" className="mt-4 w-full">
                Go to Dashboard
              </Button>
            </Link>

            <SignOut />
          </>
        )}
        {session && session.user.role === UserRole.Unauthorized && (
          <p className="mt-4 text-center text-red-500">
            You are not authorized to access this page. Please contact your
            admin
          </p>
        )}
      </CardContent>
    </Card>
  );
}
