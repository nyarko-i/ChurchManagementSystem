import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import type { NextAuthConfig } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      churchId: string
      name: string
      email: string
      isSuperAdmin?: boolean
    }
  }
  interface User {
    role?: string
    churchId?: string
    isSuperAdmin?: boolean
  }
}

const config: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.churchId = user.churchId
        token.isSuperAdmin = user.isSuperAdmin ?? false
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as string
      session.user.churchId = token.churchId as string
      session.user.isSuperAdmin = token.isSuperAdmin as boolean
      return session
    },
  },
  providers: [
    Credentials({
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })
        if (!user || !user.isActive) return null
        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )
        if (!passwordMatch) return null
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          churchId: user.churchId,
          isSuperAdmin: false,
        }
      },
    }),

    Credentials({
      id: "super-admin-credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      authorize: async (credentials): Promise<any> => {
        if (!credentials?.email || !credentials?.password) return null
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const admin = await (prisma as any).superAdmin.findUnique({
          where: { email: credentials.email as string },
        })
        if (!admin || !admin.isActive) return null
        const valid = await bcrypt.compare(
          credentials.password as string,
          admin.passwordHash
        )
        if (!valid) return null
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma as any).superAdmin.update({
          where: { id: admin.id },
          data: { lastLoginAt: new Date() },
        })
        return {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: "super_admin",
          churchId: "",
          isSuperAdmin: true,
        }
      },
    }),
  ],
}

export const { handlers, signIn, signOut, auth } = NextAuth(config)
export const adminAuth = auth