'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Notice } from './ActionForm'
import { buttonPrimary, inputClass, labelClass } from './ui'

export default function SignInForm({ callbackUrl, initialError }: { callbackUrl: string; initialError: boolean }) {
  const router = useRouter()
  const [error, setError] = useState(initialError)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(false)
    const form = new FormData(e.currentTarget)
    const result = await signIn('credentials', {
      email: form.get('email'),
      password: form.get('password'),
      redirect: false,
    })
    if (result?.ok && !result.error) {
      // Refresh so server components pick up the new session
      router.replace(callbackUrl)
      router.refresh()
    } else {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <label className={labelClass}>
        Email
        <input type="email" name="email" required autoComplete="email" className={inputClass} />
      </label>
      <label className={labelClass}>
        Password
        <input type="password" name="password" required autoComplete="current-password" className={inputClass} />
      </label>
      {error && <Notice state={{ error: 'Sign-in failed. Check your email and password.' }} />}
      <button type="submit" disabled={loading} className={`${buttonPrimary} mt-2 w-full`}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
      <p className="text-center text-sm text-muted">
        No account yet? <Link href="/register" className="font-medium text-primary hover:underline">Join now</Link>
      </p>
    </form>
  )
}
