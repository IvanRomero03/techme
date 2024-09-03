
'use client';

import { signOut } from 'next-auth/react';
import { Button } from "t/components/ui/button";

export default function Signout() {
  return (
    <Button variant="default"
      className='w-full mt-4'
      onClick={() => signOut()}
    > Sign Out
    </Button>
  );
}