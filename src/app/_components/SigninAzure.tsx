'use client';

import { signIn } from 'next-auth/react';
import { FaMicrosoft } from 'react-icons/fa'; // Import the Microsoft icon from react-icons

export default function SigninAzure() {
  return (
    <button
      className='bg-white border border-zinc-300 py-1 rounded-md w-full text-zinc-700 flex items-center justify-center my-5'
      onClick={() => signIn('azure-ad')}
    >
      <FaMicrosoft className='text-blue-600 mr-2' />
      Sign in with Azure
    </button>
  );
}
