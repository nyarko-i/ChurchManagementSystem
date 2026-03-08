/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

// ── UPDATE CHURCH PROFILE ─────────────────────────────────
export async function updateChurchProfile(data: {
  name: string
  email: string
  phone: string
  address: string
}) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }
  const churchId = session.user.churchId

  try {
    await prisma.church.update({
      where: { id: churchId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address || null,
      },
    })
    revalidatePath("/dashboard/settings")
    return { success: true }
  } catch {
    return { error: "Failed to update church profile" }
  }
}

// ── UPDATE WELFARE SETTINGS ───────────────────────────────
export async function updateWelfareSettings(data: {
  amount: number
  effectiveYear: number
}) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }
  const churchId = session.user.churchId

  try {
    await prisma.welfareSettings.upsert({
      where: { churchId },
      update: {
        amount: data.amount,
        effectiveYear: data.effectiveYear,
        updatedBy: session.user.name,
      },
      create: {
        churchId,
        amount: data.amount,
        effectiveYear: data.effectiveYear,
        updatedBy: session.user.name,
      },
    })
    revalidatePath("/dashboard/settings")
    return { success: true }
  } catch {
    return { error: "Failed to update welfare settings" }
  }
}

// ── CHANGE PASSWORD ───────────────────────────────────────
export async function changePassword(data: {
  currentPassword: string
  newPassword: string
}) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) return { error: "User not found" }

  const match = await bcrypt.compare(data.currentPassword, user.passwordHash)
  if (!match) return { error: "Current password is incorrect" }

  if (data.newPassword.length < 6) {
    return { error: "New password must be at least 6 characters" }
  }

  const hashed = await bcrypt.hash(data.newPassword, 10)

  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: hashed },
  })

  return { success: true }
}

// ── GET STAFF USERS ───────────────────────────────────────
export async function getStaffUsers() {
  const session = await auth()
  if (!session) return []
  const churchId = session.user.churchId

  return prisma.user.findMany({
    where: { churchId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  })
}

// ── ADD STAFF USER ────────────────────────────────────────
export async function addStaffUser(data: {
  name: string
  email: string
  password: string
  role: string
}) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }
  const churchId = session.user.churchId

  // Only admin roles can add staff
  const allowedRoles = ["super_admin", "pastor"]
  if (!allowedRoles.includes(session.user.role)) {
    return { error: "You do not have permission to add staff" }
  }

  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) return { error: "A user with this email already exists" }

  if (data.password.length < 6) {
    return { error: "Password must be at least 6 characters" }
  }

  const hashed = await bcrypt.hash(data.password, 10)

  try {
    await prisma.user.create({
      data: {
        churchId,
        name: data.name,
        email: data.email,
        passwordHash: hashed,
        role: data.role as any,
        isActive: true,
      },
    })
    revalidatePath("/dashboard/settings")
    return { success: true }
  } catch {
    return { error: "Failed to add staff member" }
  }
}

// ── TOGGLE STAFF ACTIVE STATUS ────────────────────────────
export async function toggleStaffStatus(userId: string, isActive: boolean) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }

  const allowedRoles = ["super_admin", "pastor"]
  if (!allowedRoles.includes(session.user.role)) {
    return { error: "You do not have permission to do this" }
  }

  // Cannot deactivate yourself
  if (userId === session.user.id) {
    return { error: "You cannot deactivate your own account" }
  }

  await prisma.user.update({
    where: { id: userId, churchId: session.user.churchId },
    data: { isActive },
  })

  revalidatePath("/dashboard/settings")
  return { success: true }
}

// ── REMOVE STAFF USER ─────────────────────────────────────
export async function removeStaffUser(userId: string) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }

  const allowedRoles = ["super_admin", "pastor"]
  if (!allowedRoles.includes(session.user.role)) {
    return { error: "You do not have permission to do this" }
  }

  if (userId === session.user.id) {
    return { error: "You cannot remove your own account" }
  }

  await prisma.user.delete({
    where: { id: userId, churchId: session.user.churchId },
  })

  revalidatePath("/dashboard/settings")
  return { success: true }
}