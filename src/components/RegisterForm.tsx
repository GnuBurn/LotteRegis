'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState } from 'react'
import { signIn } from 'next-auth/react'
import { signUp } from '@/app/actions'
import type { ActionState } from '@/interface'
import { Notice } from './ActionForm'
import { buttonPrimary, inputClass, labelClass } from './ui'

export default function RegisterForm() {
  const router = useRouter()

  // Creates the account on the backend, then signs the new user in straight away
  async function signUpAndSignIn(prev: ActionState, formData: FormData): Promise<ActionState> {
    const result = await signUp(prev, formData)
    if (result.error) return result

    const login = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    })
    if (login?.ok && !login.error) {
      router.replace('/workshops')
      router.refresh()
      return { success: 'Account created! Taking you to the workshops…' }
    }
    return { error: 'Your account was created, but signing in failed. Please sign in manually.' }
  }

  const [state, formAction, pending] = useActionState(signUpAndSignIn, {})

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className={labelClass}>
        Full name
        <input name="name" required autoComplete="name" className={inputClass} />
      </label>
      <label className={labelClass}>
        Email
        <input type="email" name="email" required autoComplete="email" className={inputClass} />
      </label>
      <label className={labelClass}>
        Phone number
        <input type="tel" name="tel" required autoComplete="tel" placeholder="08x-xxx-xxxx" className={inputClass} />
      </label>
      <label className={labelClass}>
        Password
        <input type="password" name="password" required minLength={6} autoComplete="new-password" className={inputClass} />
        <span className="text-xs font-normal text-muted">At least 6 characters.</span>
      </label>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Account type</legend>
        <div className="grid grid-cols-2 gap-3">
          <RoleOption value="member" title="Member" hint="Register for workshops" defaultChecked />
          <RoleOption value="admin" title="Admin" hint="Manage workshops" />
        </div>
      </fieldset>
      <Notice state={state} />
      <button type="submit" disabled={pending} className={`${buttonPrimary} mt-2 w-full`}>
        {pending ? 'Creating account…' : 'Create account'}
      </button>
      <p className="text-center text-sm text-muted">
        Already a member? <Link href="/signin" className="font-medium text-primary hover:underline">Sign in</Link>
      </p>
    </form>
  )
}

function RoleOption({ value, title, hint, defaultChecked }: { value: string; title: string; hint: string; defaultChecked?: boolean }) {
  return (
    <label className="cursor-pointer rounded-xl border border-line bg-surface p-4 transition has-checked:border-primary has-checked:bg-primary-soft/50 has-focus-visible:ring-4 has-focus-visible:ring-primary/15">
      <input type="radio" name="role" value={value} defaultChecked={defaultChecked} className="sr-only" />
      <span className="block font-medium">{title}</span>
      <span className="block text-xs text-muted">{hint}</span>
    </label>
  )
}
