import Link from "next/link"

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

export function LoginForm() {
  return (
    <Card className="mx-auto max-w-sm m:10">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/api/auth/callback/google" passHref>
            <Button variant="default" className="w-full">
                Login with Google
            </Button>
        </Link>
          
          <Button variant="outline" className="w-full mt-3">
            Login with Microsoft
          </Button>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="#" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
