'use client'

import { useEffect } from 'react'
import { buttonPrimary } from '@/components/ui'

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="text-3xl font-semibold">Something went wrong</h1>
      <p className="mt-3 text-muted">Please try again in a moment.</p>
      <button onClick={() => retry()} className={`${buttonPrimary} mt-8`}>Try again</button>
    </main>
  )
}
