"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { sendWelcomeEmail } from "@/actions/auth"

async function requireSuperAdmin() {
  const session = await auth()
  if (!session?.user?.isSuperAdmin) {
    throw new Error("Unauthorized — Super Admin access required")
  }
  return session
}

export async function getAllChurches() {
  await requireSuperAdmin()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const churches = await (prisma as any).church.findMany({
    include: {
      _count: { select: { users: true, members: true, titheRecords: true, offerings: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return churches
}

export async function getChurchStats(churchId: string) {
  await requireSuperAdmin()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  // TitheRecord — uses month + year fields
  const titheRecords = await prisma.titheRecord.findMany({
    where: { churchId, month: currentMonth, year: currentYear },
  })
  const tithe = titheRecords.reduce((sum, r) => sum + (r.monthlyAmount ?? 0), 0)

  // Offering — uses serviceDate field
  const offeringRecords = await prisma.offering.findMany({
    where: {
      churchId,
      serviceDate: { gte: startOfMonth, lte: endOfMonth },
    },
  })
  const offerings = offeringRecords.reduce((sum, r) => sum + r.totalAmount, 0)

  // Expense — uses createdAt + amount fields
  const expenseRecords = await prisma.expense.findMany({
    where: {
      churchId,
      isDeleted: false,
      createdAt: { gte: startOfMonth, lte: endOfMonth },
    },
  })
  const expenses = expenseRecords.reduce((sum, e) => sum + e.amount, 0)

  const memberCount = await prisma.member.count({ where: { churchId } })

  return { tithe, offerings, expenses, memberCount }
}

export async function toggleChurchStatus(churchId: string, isActive: boolean) {
  await requireSuperAdmin()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).church.update({
    where: { id: churchId },
    data: { subscriptionStatus: isActive ? "active" : "suspended" },
  })

  revalidatePath("/admin")
}

export async function changeSubscriptionPlan(churchId: string, plan: string) {
  await requireSuperAdmin()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).church.update({
    where: { id: churchId },
    data: { subscriptionPlan: plan },
  })

  revalidatePath("/admin")
}

export async function addChurch(data: {
  churchName: string
  adminName: string
  adminEmail: string
  adminPassword: string
  plan: string
}) {
  await requireSuperAdmin()

  const bcrypt = await import("bcryptjs")
  const passwordHash = await bcrypt.hash(data.adminPassword, 12)

  const slug = data.churchName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const church = await (prisma as any).church.create({
    data: {
      name: data.churchName,
      slug: `${slug}-${Date.now()}`,
      email: data.adminEmail,
      phone: "",
      subscriptionPlan: data.plan,
      subscriptionStatus: "active",
    },
  })

  await prisma.user.create({
    data: {
      name: data.adminName,
      email: data.adminEmail,
      passwordHash,
      role: "pastor",
      churchId: church.id,
      isActive: true,
    },
  })

  // Send welcome email automatically
  await sendWelcomeEmail({
    churchName: data.churchName,
    adminName: data.adminName,
    email: data.adminEmail,
    password: data.adminPassword,
  })

  revalidatePath("/admin")
  return { success: true }
}