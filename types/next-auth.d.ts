import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface User {
    id: string
    name?: string | null
    email?: string | null
    role?: string
    churchId?: string
    isSuperAdmin?: boolean
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      role?: string
      churchId?: string
      isSuperAdmin?: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: string
    churchId?: string
    isSuperAdmin?: boolean
  }
}