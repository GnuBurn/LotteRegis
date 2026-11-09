import type { Metadata } from 'next'
import { Suspense } from 'react'
import AuthShell from '@/components/AuthShell'
import SignInForm from '@/components/SignInForm'

export const metadata: Metadata = { title: 'Sign in' }

export default function SignInPage({ searchParams }: PageProps<'/signin'>) {
  return (
    <AuthShell
      heading="You're one step away from entering the draw."
      subheading="Sign in to apply for lottery workshops and keep track of your seats."
      title="Sign in"
    >
      <Suspense fallback={<div className="h-72" />}>
        <SignInFormWithParams searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  )
}

async function SignInFormWithParams({ searchParams }: { searchParams: PageProps<'/signin'>['searchParams'] }) {
  const { callbackUrl, error } = await searchParams
  // Only allow same-site redirects after sign-in
  const target = typeof callbackUrl === 'string' && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//') ? callbackUrl : '/workshops'
  return <SignInForm callbackUrl={target} initialError={typeof error === 'string'} />
}
