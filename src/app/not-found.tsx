import Link from 'next/link'
import { buttonPrimary } from '@/components/ui'

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-5 py-24 text-center">
      <p className="text-6xl text-primary">404</p>
      <h1 className="mt-4 text-3xl font-semibold">We couldn&apos;t find that page</h1>
      <p className="mt-3 text-muted">The workshop may have been removed, or the link is incorrect.</p>
      <Link href="/workshops" className={`${buttonPrimary} mt-8`}>Browse workshops</Link>
    </main>
  )
}
