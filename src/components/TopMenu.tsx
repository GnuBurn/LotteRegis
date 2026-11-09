import Link from 'next/link'
import { Suspense } from 'react'
import { getSession } from '@/libs/session'
import { Icon } from './icons'
import SignOutButton from './SignOutButton'
import { Avatar, buttonGhost, buttonPrimary, container } from './ui'

const linkClass = 'text-[15px] font-medium text-muted transition hover:text-ink'

// The logo and public links are static; the account area depends on the
// signed-in user, so it streams in separately.
export default function TopMenu() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
      <nav className={`${container} flex h-[72px] items-center gap-8`}>
        <Link href="/" className="mr-auto flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white">
            <Icon name="ticket" className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">Lotte Workshops</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <Link href="/workshops" className={linkClass}>Workshops</Link>
          <Link href="/#how-it-works" className={linkClass}>How the lottery works</Link>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Suspense fallback={<div className="h-10 w-48" />}>
            <AccountLinks />
          </Suspense>
        </div>
      </nav>
    </header>
  )
}

async function AccountLinks() {
  const session = await getSession()

  if (!session) {
    return (
      <>
        <Link href="/signin" className={`${buttonGhost} px-4! py-2.5!`}>Sign in</Link>
        <Link href="/register" className={`${buttonPrimary} px-4! py-2.5!`}>Create account</Link>
      </>
    )
  }

  const isAdmin = session.user.role === 'admin'
  return (
    <>
      {isAdmin && <Link href="/admin/workshops/new" className={`${linkClass} hidden sm:inline`}>New workshop</Link>}
      <Link href="/myregistrations" className={linkClass}>
        {isAdmin ? 'All registrations' : 'My registrations'}
      </Link>
      <span className="hidden items-center gap-2.5 lg:flex">
        <Avatar name={session.user.name} />
        <span className="text-sm font-medium">{session.user.name}</span>
      </span>
      <SignOutButton />
    </>
  )
}
