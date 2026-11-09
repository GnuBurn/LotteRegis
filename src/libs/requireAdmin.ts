import { redirect } from 'next/navigation'
import { getSession } from './session'

// Sends non-admins away from admin pages (the backend also enforces this)
export async function requireAdmin(callbackUrl: string) {
  const session = await getSession()
  if (!session) redirect(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  if (session.user.role !== 'admin') redirect('/workshops')
  return session
}
