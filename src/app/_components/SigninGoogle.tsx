"use client";

import { signIn } from "next-auth/react";
import { FaGoogle } from "react-icons/fa";

export default function SigninGoogle() {
  return (
    <button
      className="flex w-full items-center justify-center rounded-md border border-zinc-300 bg-white py-1 text-zinc-700"
      onClick={() => signIn("google", { callbackUrl: "/login/redirects" })}
    >
      <FaGoogle className="mr-2 text-red-700" />
      Sign in with Google
    </button>
  );
}
