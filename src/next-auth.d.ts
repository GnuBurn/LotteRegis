import 'next-auth'
import type { Role } from '@/interface'

declare module 'next-auth' {
  interface Session {
    user: {
      _id: string
      name: string
      email: string
      role: Role
      token: string
    }
  }

  interface User {
    _id: string
    role: Role
    token: string
  }
}
