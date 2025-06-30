// types/next-auth.d.ts
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
    }
    backendToken: string
    userData: {
      id: string
      name: string
      surname: string
      email: string
      phone: string
      role: string
      google_id?: string
      created_at: string
    }
  }

  interface User {
    id: string
    role: string
    backendToken: string
    userData: any
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    backendToken: string
    userData: any
  }
}