"use client";

import { signIn } from "next-auth/react";
import { FaMicrosoft } from "react-icons/fa"; // Import the Microsoft icon from react-icons

export default function SigninAzure() {
  return (
    <button
      className="my-5 flex w-full items-center justify-center rounded-md border border-zinc-300 bg-white py-1 text-zinc-700"
      onClick={() => signIn("azure-ad", { callbackUrl: "/login/redirects" })}
    >
      <FaMicrosoft className="mr-2 text-blue-600" />
      Sign in with Azure
    </button>
  );
}
