import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export default auth(async (req) => {
  const { pathname } = req.nextUrl

  // ── ADMIN ROUTES — handle FIRST ────────────────────────
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next()
    }

    const token = await getToken({
      req: req as unknown as NextRequest,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token?.isSuperAdmin) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }

    return NextResponse.next()
  }

  // ── LANDING PAGE ───────────────────────────────────────
  if (pathname === "/") return NextResponse.next()

  // ── PUBLIC AUTH PAGES ──────────────────────────────────
  const isLoginPage = pathname === "/login"
  const isRegisterPage = pathname === "/register"
  const isForgotPassword = pathname === "/forgot-password"
  const isResetPassword = pathname === "/reset-password"

  // ── CHURCH ROUTES ──────────────────────────────────────
  const isLoggedIn = !!req.auth

  if (!isLoggedIn && !isLoginPage && !isRegisterPage && !isForgotPassword && !isResetPassword) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (isLoggedIn && (isLoginPage || isRegisterPage)) {
    // Don't redirect super admin to dashboard
    if (req.auth?.user?.isSuperAdmin) return NextResponse.next()
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
}