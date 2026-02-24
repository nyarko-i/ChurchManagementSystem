/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { hasPermission, auditLog } from "@/lib/permissions"

// =============================
// GET WELFARE SETTINGS
// =============================
export async function getWelfareSettings() {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }

  const settings = await prisma.welfareSettings.findUnique({
    where: { churchId: session.user.churchId },
  })

  return { success: true, settings }
}

// =============================
// SAVE WELFARE SETTINGS
// =============================
export async function saveWelfareSettings(amount: number, effectiveYear: number) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }
  if (!hasPermission(session.user.role, "manageSettings"))
    return { error: "Only admins can change welfare settings" }

  if (amount <= 0) return { error: "Amount must be greater than 0" }

  const churchId = session.user.churchId

  try {
    const settings = await prisma.welfareSettings.upsert({
      where: { churchId },
      update: { amount, effectiveYear, updatedBy: session.user.id },
      create: { churchId, amount, effectiveYear, updatedBy: session.user.id },
    })

    await auditLog({
      churchId,
      userId: session.user.id,
      action: "WELFARE_SETTINGS_UPDATED",
      entityType: "WelfareSettings",
      entityId: settings.id,
      metadata: { amount, effectiveYear },
    })

    return { success: true, settings }
  } catch (error) {
    console.error(error)
    return { error: "Failed to save settings" }
  }
}

// =============================
// GET MEMBERS WELFARE STATUS
// =============================
export async function getMembersWelfareStatus(month: number, year: number) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }
  if (!hasPermission(session.user.role, "viewWelfare"))
    return { error: "Unauthorized" }

  const churchId = session.user.churchId

  const [members, settings] = await Promise.all([
    prisma.member.findMany({
      where: { churchId, status: "active" },
      include: {
        welfareContributions: {
          where: { month, year, churchId },
        },
      },
      orderBy: { firstName: "asc" },
    }),
    prisma.welfareSettings.findUnique({
      where: { churchId },
    }),
  ])

  return { success: true, members, settings }
}

// =============================
// GET OR CREATE WELFARE RECORD
// =============================
export async function getWelfareRecord(
  memberId: string,
  month: number,
  year: number
) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }
  if (!hasPermission(session.user.role, "viewWelfare"))
    return { error: "Unauthorized" }

  const churchId = session.user.churchId

  const member = await prisma.member.findFirst({
    where: { id: memberId, churchId },
  })
  if (!member) return { error: "Member not found" }

  const settings = await prisma.welfareSettings.findUnique({
    where: { churchId },
  })
  if (!settings) return { error: "Welfare amount not configured yet" }

  let record = await prisma.welfareContribution.findUnique({
    where: {
      churchId_memberId_month_year: { churchId, memberId, month, year },
    },
  })

  if (!record) {
    record = await prisma.welfareContribution.create({
      data: {
        churchId,
        memberId,
        month,
        year,
        requiredAmount: settings.amount,
        totalPaid: 0,
        recordedBy: session.user.id,
      },
    })
  }

  return { success: true, record, member, settings }
}

// =============================
// SAVE WELFARE RECORD (weekly/monthly)
// =============================
export async function saveWelfareRecord(data: {
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
  if (!hasPermission(session.user.role, "recordWelfare"))
    return { error: "You don't have permission to record welfare" }

  const churchId = session.user.churchId

  // Validate no negative amounts
  const amounts = [
    data.week1Amount,
    data.week2Amount,
    data.week3Amount,
    data.week4Amount,
    data.monthlyAmount,
  ].filter((a) => a !== null)

  if (amounts.some((a) => a! < 0))
    return { error: "Amounts cannot be negative" }

  // Cannot record future months
  const now = new Date()
  if (
    data.year > now.getFullYear() ||
    (data.year === now.getFullYear() && data.month > now.getMonth() + 1)
  ) {
    return { error: "Cannot record payment for a future month" }
  }

  const member = await prisma.member.findFirst({
    where: { id: data.memberId, churchId },
  })
  if (!member) return { error: "Member not found" }

  const settings = await prisma.welfareSettings.findUnique({
    where: { churchId },
  })
  if (!settings) return { error: "Welfare amount not configured yet" }

  const totalPaid =
    (data.week1Amount ?? 0) +
    (data.week2Amount ?? 0) +
    (data.week3Amount ?? 0) +
    (data.week4Amount ?? 0) +
    (data.monthlyAmount ?? 0)

  try {
    const record = await prisma.welfareContribution.upsert({
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
        totalPaid,
        paymentMethod: data.paymentMethod as any,
        requiredAmount: settings.amount,
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
        totalPaid,
        requiredAmount: settings.amount,
        paymentMethod: data.paymentMethod as any,
        recordedBy: session.user.id,
      },
    })

    await auditLog({
      churchId,
      userId: session.user.id,
      action: "WELFARE_CONTRIBUTION_RECORDED",
      entityType: "WelfareContribution",
      entityId: record.id,
      metadata: { month: data.month, year: data.year, memberId: data.memberId, totalPaid },
    })

    return { success: true, record }
  } catch (error) {
    console.error(error)
    return { error: "Failed to save welfare record" }
  }
}

// =============================
// BULK PAY MULTIPLE MONTHS
// =============================
export async function bulkPayWelfare(data: {
  memberId: string
  months: { month: number; year: number }[]
  paymentMethod: string
}) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }
  if (!hasPermission(session.user.role, "recordWelfare"))
    return { error: "Unauthorized" }

  const churchId = session.user.churchId

  const member = await prisma.member.findFirst({
    where: { id: data.memberId, churchId },
  })
  if (!member) return { error: "Member not found" }

  const settings = await prisma.welfareSettings.findUnique({
    where: { churchId },
  })
  if (!settings) return { error: "Welfare amount not configured yet" }

  try {
    // Create/update each month as fully paid and signed
    for (const { month, year } of data.months) {
      const record = await prisma.welfareContribution.upsert({
        where: {
          churchId_memberId_month_year: {
            churchId,
            memberId: data.memberId,
            month,
            year,
          },
        },
        update: {
          monthlyAmount: settings.amount,
          totalPaid: settings.amount,
          requiredAmount: settings.amount,
          paymentMethod: data.paymentMethod as any,
          isSigned: true,
          signedBy: session.user.id,
          signedAt: new Date(),
          recordedBy: session.user.id,
        },
        create: {
          churchId,
          memberId: data.memberId,
          month,
          year,
          monthlyAmount: settings.amount,
          totalPaid: settings.amount,
          requiredAmount: settings.amount,
          paymentMethod: data.paymentMethod as any,
          isSigned: true,
          signedBy: session.user.id,
          signedAt: new Date(),
          recordedBy: session.user.id,
        },
      })

      await auditLog({
        churchId,
        userId: session.user.id,
        action: "WELFARE_BULK_PAID",
        entityType: "WelfareContribution",
        entityId: record.id,
        metadata: { month, year, memberId: data.memberId },
      })
    }

    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to record bulk payment" }
  }
}

// =============================
// SIGN OFF WELFARE RECORD
// =============================
export async function signOffWelfare(
  memberId: string,
  month: number,
  year: number
) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }
  if (!hasPermission(session.user.role, "recordWelfare"))
    return { error: "Unauthorized" }

  const churchId = session.user.churchId

  const now = new Date()
  if (
    year > now.getFullYear() ||
    (year === now.getFullYear() && month > now.getMonth() + 1)
  ) {
    return { error: "Cannot sign off a future month" }
  }

  try {
    const record = await prisma.welfareContribution.update({
      where: {
        churchId_memberId_month_year: { churchId, memberId, month, year },
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
      action: "WELFARE_SIGNED_OFF",
      entityType: "WelfareContribution",
      entityId: record.id,
      metadata: { month, year, memberId },
    })

    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to sign off" }
  }
}

// =============================
// GET WELFARE REQUESTS
// =============================
export async function getWelfareRequests() {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }
  if (!hasPermission(session.user.role, "viewWelfare"))
    return { error: "Unauthorized" }

  const requests = await prisma.welfareRequest.findMany({
    where: { churchId: session.user.churchId },
    include: { member: true, payout: true },
    orderBy: { createdAt: "desc" },
  })

  return { success: true, requests }
}

// =============================
// FILE WELFARE REQUEST
// =============================
export async function fileWelfareRequest(data: {
  memberId: string
  type: string
  description: string
}) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }
  if (!hasPermission(session.user.role, "recordWelfare"))
    return { error: "Unauthorized" }

  const churchId = session.user.churchId

  const member = await prisma.member.findFirst({
    where: { id: data.memberId, churchId },
  })
  if (!member) return { error: "Member not found" }

  // Count unpaid months as a warning
  const unpaidCount = await prisma.welfareContribution.count({
    where: { churchId, memberId: data.memberId, isSigned: false },
  })

  try {
    const request = await prisma.welfareRequest.create({
      data: {
        churchId,
        memberId: data.memberId,
        type: data.type as any,
        description: data.description,
      },
    })

    await auditLog({
      churchId,
      userId: session.user.id,
      action: "WELFARE_REQUEST_FILED",
      entityType: "WelfareRequest",
      entityId: request.id,
      metadata: { memberId: data.memberId, type: data.type, unpaidMonths: unpaidCount },
    })

    return { success: true, request, unpaidMonths: unpaidCount }
  } catch (error) {
    console.error(error)
    return { error: "Failed to file request" }
  }
}

// =============================
// APPROVE / REJECT WELFARE REQUEST
// =============================
export async function updateWelfareRequest(
  requestId: string,
  status: "approved" | "rejected",
  approvedAmount?: number
) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }
  if (!hasPermission(session.user.role, "approveWelfare"))
    return { error: "You don't have permission to approve welfare requests" }

  const churchId = session.user.churchId

  if (status === "approved" && (!approvedAmount || approvedAmount <= 0))
    return { error: "Please enter a valid approved amount" }

  try {
    const request = await prisma.welfareRequest.update({
      where: { id: requestId, churchId },
      data: {
        status,
        approvedBy: session.user.id,
        approvedAmount: status === "approved" ? approvedAmount : null,
        approvedAt: new Date(),
      },
    })

    await auditLog({
      churchId,
      userId: session.user.id,
      action: `WELFARE_REQUEST_${status.toUpperCase()}`,
      entityType: "WelfareRequest",
      entityId: request.id,
      metadata: { approvedAmount },
    })

    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to update request" }
  }
}

// =============================
// RECORD WELFARE PAYOUT
// =============================
export async function recordWelfarePayout(requestId: string, amount: number) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }
  if (!hasPermission(session.user.role, "recordPayout"))
    return { error: "You don't have permission to record payouts" }

  const churchId = session.user.churchId

  const request = await prisma.welfareRequest.findFirst({
    where: { id: requestId, churchId, status: "approved" },
  })
  if (!request) return { error: "Approved request not found" }

  const existingPayout = await prisma.welfarePayout.findUnique({
    where: { requestId },
  })
  if (existingPayout) return { error: "Payout already recorded" }

  try {
    const payout = await prisma.welfarePayout.create({
      data: { churchId, requestId, amount, paidBy: session.user.id },
    })

    await auditLog({
      churchId,
      userId: session.user.id,
      action: "WELFARE_PAYOUT_RECORDED",
      entityType: "WelfarePayout",
      entityId: payout.id,
      metadata: { requestId, amount },
    })

    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to record payout" }
  }
}