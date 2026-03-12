"use server"

import { neon } from "@neondatabase/serverless"
import { auth as adminAuth } from "@/auth"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

async function requireSuperAdmin() {
  const session = await adminAuth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session
}

export async function changeAdminPassword(data: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}) {
  const session = await requireSuperAdmin()

  if (data.newPassword !== data.confirmPassword) {
    return { error: "New passwords do not match" }
  }

  // Password strength validation
  if (data.newPassword.length < 12)
    return { error: "Password must be at least 12 characters" }
  if (!/[A-Z]/.test(data.newPassword))
    return { error: "Password must contain at least one uppercase letter" }
  if (!/[a-z]/.test(data.newPassword))
    return { error: "Password must contain at least one lowercase letter" }
  if (!/[0-9]/.test(data.newPassword))
    return { error: "Password must contain at least one number" }
  if (!/[^A-Za-z0-9]/.test(data.newPassword))
    return { error: "Password must contain at least one special character" }

  const sql = neon(process.env.DATABASE_URL!)

  // Get current hash
  const rows = await sql`SELECT "passwordHash" FROM "SuperAdmin" WHERE id = ${session.user.id} LIMIT 1`
  if (!rows.length) return { error: "Account not found" }

  const valid = await bcrypt.compare(data.currentPassword, rows[0].passwordHash)
  if (!valid) return { error: "Current password is incorrect" }

  // Prevent reuse of same password
  const same = await bcrypt.compare(data.newPassword, rows[0].passwordHash)
  if (same) return { error: "New password must be different from current password" }

  const newHash = await bcrypt.hash(data.newPassword, 14)

  await sql`UPDATE "SuperAdmin" SET "passwordHash" = ${newHash} WHERE id = ${session.user.id}`

  revalidatePath("/admin/account")
  return { success: true }
}

export async function getAdminProfile() {
  const session = await requireSuperAdmin()

  const sql = neon(process.env.DATABASE_URL!)
  const rows = await sql`
    SELECT id, name, email, "createdAt", "lastLoginAt"
    FROM "SuperAdmin"
    WHERE id = ${session.user.id}
    LIMIT 1
  `

  return rows[0] ?? null
}