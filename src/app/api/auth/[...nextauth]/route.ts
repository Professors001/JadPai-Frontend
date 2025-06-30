// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // Email/Password Credentials Provider - calls your backend API
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Call your backend login API
          const response = await fetch(`${process.env.BACKEND_URL}/users/auth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            console.error('Login failed:', data.message)
            return null
          }

          // Return user object that matches NextAuth User type
          return {
            id: data.user.id,
            email: data.user.email,
            name: `${data.user.name} ${data.user.surname}`,
            role: data.user.role,
            backendToken: data.token, // Store backend JWT token
            userData: data.user, // Store full user data
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Call your backend API to handle Google login/signup
          const response = await fetch(`${process.env.BACKEND_URL}/api/auth/google`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name?.split(' ')[0] || '',
              surname: user.name?.split(' ').slice(1).join(' ') || '',
              google_id: account.providerAccountId,
              image: user.image,
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            console.error('Google login failed:', data.message)
            return false
          }

          // Store backend data in user object
          user.id = data.user.id
          user.role = data.user.role
          user.backendToken = data.token
          user.userData = data.user

          return true
        } catch (error) {
          console.error('Google sign-in error:', error)
          return false
        }
      }
      
      return true
    },

    async jwt({ token, user, account }) {
      // Store user data in JWT token on first sign in
      if (user) {
        token.id = user.id
        token.role = user.role
        token.backendToken = user.backendToken
        token.userData = user.userData
      }
      
      return token
    },

    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.backendToken = token.backendToken as string
        session.userData = token.userData
      }
      return session
    },
  },
  
  pages: {
    signIn: '/auth/signin',
  },
  
  session: {
    strategy: 'jwt',
  },
})

export { handler as GET, handler as POST }