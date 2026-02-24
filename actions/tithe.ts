/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { hasPermission, auditLog } from "@/lib/permissions"

// =============================
// GET OR CREATE TITHE RECORD
// =============================
export async function getTitheRecord(
  memberId: string,
  month: number,
  year: number
) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }
  if (!hasPermission(session.user.role, "viewTithe"))
    return { error: "Unauthorized" }

  const churchId = session.user.churchId

  // Verify member belongs to this church
  const member = await prisma.member.findFirst({
    where: { id: memberId, churchId },
  })
  if (!member) return { error: "Member not found" }

  let record = await prisma.titheRecord.findUnique({
    where: {
      churchId_memberId_month_year: {
        churchId,
        memberId,
        month,
        year,
      },
    },
  })

  // Auto create if not exists
  if (!record) {
    record = await prisma.titheRecord.create({
      data: {
        churchId,
        memberId,
        month,
        year,
        recordedBy: session.user.id,
      },
    })
  }

  return { success: true, record }
}

// =============================
// SAVE TITHE RECORD
// =============================
export async function saveTitheRecord(data: {
  memberId: string
  month: number
  year: number
  week1Amount: number | null
  week2Amount: number | null
  week3Amount: number | null
  week4Amount: number | null
  monthlyAmount: number | null
  paymentMethod: string
}) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }
  if (!hasPermission(session.user.role, "recordTithe"))
    return { error: "You don't have permission to record tithe" }

  const churchId = session.user.churchId

  // Validate amounts are positive
  const amounts = [
    data.week1Amount,
    data.week2Amount,
    data.week3Amount,
    data.week4Amount,
    data.monthlyAmount,
  ].filter((a) => a !== null)

  if (amounts.some((a) => a! < 0)) {
    return { error: "Amounts cannot be negative" }
  }

  // Verify member belongs to this church
  const member = await prisma.member.findFirst({
    where: { id: data.memberId, churchId },
  })
  if (!member) return { error: "Member not found" }

  try {
    const record = await prisma.titheRecord.upsert({
      where: {
        churchId_memberId_month_year: {
          churchId,
          memberId: data.memberId,
          month: data.month,
          year: data.year,
        },
      },
      update: {
        week1Amount: data.week1Amount,
        week2Amount: data.week2Amount,
        week3Amount: data.week3Amount,
        week4Amount: data.week4Amount,
        monthlyAmount: data.monthlyAmount,
        paymentMethod: data.paymentMethod as any,
        recordedBy: session.user.id,
      },
      create: {
        churchId,
        memberId: data.memberId,
        month: data.month,
        year: data.year,
        week1Amount: data.week1Amount,
        week2Amount: data.week2Amount,
        week3Amount: data.week3Amount,
        week4Amount: data.week4Amount,
        monthlyAmount: data.monthlyAmount,
        paymentMethod: data.paymentMethod as any,
        recordedBy: session.user.id,
      },
    })

    await auditLog({
      churchId,
      userId: session.user.id,
      action: "TITHE_RECORDED",
      entityType: "TitheRecord",
      entityId: record.id,
      metadata: { month: data.month, year: data.year, memberId: data.memberId },
    })

    return { success: true, record }
  } catch (error) {
    console.error(error)
    return { error: "Failed to save tithe record" }
  }
}

// =============================
// SIGN OFF TITHE RECORD
// =============================
export async function signOffTithe(
  memberId: string,
  month: number,
  year: number
) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }
  if (!hasPermission(session.user.role, "signOffTithe"))
    return { error: "You don't have permission to sign off tithe" }

  const churchId = session.user.churchId

  // Cannot sign off future months
  const now = new Date()
  if (
    year > now.getFullYear() ||
    (year === now.getFullYear() && month > now.getMonth() + 1)
  ) {
    return { error: "Cannot sign off a future month" }
  }

  try {
    const record = await prisma.titheRecord.update({
      where: {
        churchId_memberId_month_year: {
          churchId,
          memberId,
          month,
          year,
        },
      },
      data: {
        isSigned: true,
        signedBy: session.user.id,
        signedAt: new Date(),
      },
    })

    await auditLog({
      churchId,
      userId: session.user.id,
      action: "TITHE_SIGNED_OFF",
      entityType: "TitheRecord",
      entityId: record.id,
      metadata: { month, year, memberId },
    })

    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to sign off tithe" }
  }
}

// =============================
// GET ALL MEMBERS TITHE STATUS
// =============================
export async function getMembersTitheStatus(month: number, year: number) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }
  if (!hasPermission(session.user.role, "viewTithe"))
    return { error: "Unauthorized" }

  const churchId = session.user.churchId

  const members = await prisma.member.findMany({
    where: { churchId, status: "active" },
    include: {
      titheRecords: {
        where: { month, year, churchId },
      },
    },
    orderBy: { firstName: "asc" },
  })

  return { success: true, members }
}