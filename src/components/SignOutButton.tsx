'use client'

import { signOut } from 'next-auth/react'
import { buttonSecondary } from './ui'

export default function SignOutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: '/' })} className={`${buttonSecondary} px-4! py-2! text-sm!`}>
      Sign out
    </button>
  )
}
