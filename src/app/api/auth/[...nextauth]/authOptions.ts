import type { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { apiFetch } from '@/libs/api'
import type { Role } from '@/interface'

type LoginData = { id: string; name: string; email: string; role: Role; token: string }

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null
        const res = await apiFetch<LoginData>('/auth/login', {
          method: 'POST',
          body: { email: credentials.email, password: credentials.password },
        })
        if (!res.ok) return null
        const { id, name, email, role, token } = res.data
        return { id, _id: id, name, email, role, token }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/signin' },
  callbacks: {
    async jwt({ token, user }) {
      return user ? { ...token, ...user } : token
    },
    async session({ session, token }) {
      session.user = {
        _id: token._id as string,
        name: token.name as string,
        email: token.email as string,
        role: token.role as Role,
        token: token.token as string,
      }
      return session
    },
  },
}
