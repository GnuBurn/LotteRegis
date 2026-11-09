import { getServerSession } from 'next-auth'
import { connection } from 'next/server'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'

export async function getSession() {
  // The session is per-request; tell Next.js before NextAuth touches crypto/cookies
  await connection()
  const session = await getServerSession(authOptions)
  return session?.user?.token ? session : null
}
