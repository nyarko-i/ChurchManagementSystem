"use server"

import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { resetPasswordEmailHtml } from "@/lib/emails/reset-password-email"
import { welcomeEmailHtml } from "@/lib/emails/welcome-email"
import crypto from "crypto"
import bcrypt from "bcryptjs"

const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

// ── REQUEST PASSWORD RESET ─────────────────────────────
export async function requestPasswordReset(email: string) {
  // Always return success to prevent email enumeration
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { success: true }

  // Delete any existing tokens for this email
  await prisma.passwordResetToken.deleteMany({ where: { email } })

  // Create new token — expires in 1 hour
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  await prisma.passwordResetToken.create({
    data: { email, token, expiresAt },
  })

  const resetUrl = `${BASE_URL}/reset-password?token=${token}`

  await sendEmail({
    to: email,
    subject: "Reset your ChurchCore password",
    html: resetPasswordEmailHtml({
      adminName: user.name,
      resetUrl,
      expiresIn: "1 hour",
    }),
  })

  return { success: true }
}

// ── VERIFY RESET TOKEN ─────────────────────────────────
export async function verifyResetToken(token: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  })

  if (!record) return { valid: false, error: "Invalid or expired link" }
  if (record.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { token } })
    return { valid: false, error: "This link has expired. Please request a new one." }
  }

  return { valid: true, email: record.email }
}

// ── RESET PASSWORD ─────────────────────────────────────
export async function resetPassword(token: string, newPassword: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  })

  if (!record || record.expiresAt < new Date()) {
    return { success: false, error: "Invalid or expired link" }
  }

  if (newPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" }
  }

  const passwordHash = await bcrypt.hash(newPassword, 12)

  await prisma.user.update({
    where: { email: record.email },
    data: { passwordHash },
  })

  // Delete used token
  await prisma.passwordResetToken.delete({ where: { token } })

  return { success: true }
}

// ── SEND WELCOME EMAIL (called when admin creates a church) ──
export async function sendWelcomeEmail({
  churchName,
  adminName,
  email,
  password,
}: {
  churchName: string
  adminName: string
  email: string
  password: string
}) {
  const loginUrl = `${BASE_URL}/login`

  await sendEmail({
    to: email,
    subject: `Welcome to ChurchCore — Your church is ready!`,
    html: welcomeEmailHtml({
      churchName,
      adminName,
      email,
      password,
      loginUrl,
    }),
  })

  return { success: true }
}