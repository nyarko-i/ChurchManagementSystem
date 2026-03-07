/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { hasPermission, auditLog } from "@/lib/permissions"

// =============================
// RECORD OFFERING
// =============================
export async function recordOffering(data: {
  serviceDate: string
  serviceType: string
  cashAmount: number
  momoAmount: number
  notes: string
}) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }
  if (!hasPermission(session.user.role, "recordOffering"))
    return { error: "You don't have permission to record offerings" }

  if (data.cashAmount < 0 || data.momoAmount < 0)
    return { error: "Amounts cannot be negative" }

  if (data.cashAmount === 0 && data.momoAmount === 0)
    return { error: "Please enter at least one amount" }

  const churchId = session.user.churchId
  const totalAmount = data.cashAmount + data.momoAmount

  try {
    const offering = await prisma.offering.create({
      data: {
        churchId,
        serviceDate: new Date(data.serviceDate),
        serviceType: data.serviceType as any,
        cashAmount: data.cashAmount,
        momoAmount: data.momoAmount,
        totalAmount,
        notes: data.notes || null,
        recordedBy: session.user.id,
      },
    })

    await auditLog({
      churchId,
      userId: session.user.id,
      action: "OFFERING_RECORDED",
      entityType: "Offering",
      entityId: offering.id,
      metadata: { totalAmount, serviceType: data.serviceType },
    })

    return { success: true, offering }
  } catch (error) {
    console.error(error)
    return { error: "Failed to record offering" }
  }
}

// =============================
// GET OFFERINGS
// =============================
export async function getOfferings(month?: number, year?: number) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }
  if (!hasPermission(session.user.role, "viewOffering"))
    return { error: "Unauthorized" }

  const churchId = session.user.churchId

  const where: any = { churchId }

  if (month && year) {
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0, 23, 59, 59)
    where.serviceDate = { gte: start, lte: end }
  }

  const offerings = await prisma.offering.findMany({
    where,
    orderBy: { serviceDate: "desc" },
  })

  const totalCash = offerings.reduce((sum, o) => sum + o.cashAmount, 0)
  const totalMomo = offerings.reduce((sum, o) => sum + o.momoAmount, 0)
  const totalAmount = offerings.reduce((sum, o) => sum + o.totalAmount, 0)

  return { success: true, offerings, totalCash, totalMomo, totalAmount }
}