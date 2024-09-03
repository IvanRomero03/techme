'use client';

import { signIn } from 'next-auth/react';
import { FaGoogle } from 'react-icons/fa'; 

export default function SigninGoogle() {
  return (
    <button
      className='bg-white border border-zinc-300 py-1 rounded-md w-full text-zinc-700 flex items-center justify-center'
      onClick={() => signIn('google')}
    >
      <FaGoogle className='text-red-700 mr-2' />
      Sign in with Google
    </button>
  );
}
