/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const {
  handlers: adminHandlers,
  auth: adminAuth,
  signIn: adminSignIn,
  signOut: adminSignOut,
} = NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: "next-auth.admin-session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    Credentials({
      id: "super-admin-credentials",
      name: "SuperAdmin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
       
      authorize: async (credentials): Promise<any> => {
        if (!credentials?.email || !credentials?.password) return null

        const admin = await (prisma as any).superAdmin.findUnique({
          where: { email: credentials.email as string },
        })

        if (!admin || !admin.isActive) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          admin.passwordHash
        )
        if (!valid) return null

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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isSuperAdmin = true
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.isSuperAdmin = true
      return session
    },
  },
  pages: {
    signIn: "/admin/login",
  },
})