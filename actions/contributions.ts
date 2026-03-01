/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { hasPermission, auditLog } from "@/lib/permissions"

// =============================
// GET ALL CONTRIBUTION TYPES
// =============================
export async function getContributionTypes() {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }
  if (!hasPermission(session.user.role, "viewContributions"))
    return { error: "Unauthorized" }

  const types = await prisma.contributionType.findMany({
    where: { churchId: session.user.churchId },
    orderBy: { createdAt: "desc" },
  })

  return { success: true, types }
}

// =============================
// CREATE CONTRIBUTION TYPE
// =============================
export async function createContributionType(data: {
  name: string
  description: string
}) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }
  if (!hasPermission(session.user.role, "manageContributionTypes"))
    return { error: "You don't have permission to create contribution types" }

  if (!data.name.trim()) return { error: "Name is required" }

  const churchId = session.user.churchId

  try {
    const type = await prisma.contributionType.create({
      data: {
        churchId,
        name: data.name.trim(),
        description: data.description.trim() || null,
      },
    })

    await auditLog({
      churchId,
      userId: session.user.id,
      action: "CONTRIBUTION_TYPE_CREATED",
      entityType: "ContributionType",
      entityId: type.id,
      metadata: { name: data.name },
    })

    return { success: true, type }
  } catch (error) {
    console.error(error)
    return { error: "Failed to create contribution type" }
  }
}

// =============================
// TOGGLE CONTRIBUTION TYPE ACTIVE
// =============================
export async function toggleContributionType(id: string) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }
  if (!hasPermission(session.user.role, "manageContributionTypes"))
    return { error: "Unauthorized" }

  const churchId = session.user.churchId

  const type = await prisma.contributionType.findFirst({
    where: { id, churchId },
  })
  if (!type) return { error: "Not found" }

  const updated = await prisma.contributionType.update({
    where: { id },
    data: { isActive: !type.isActive },
  })

  return { success: true, type: updated }
}

// =============================
// RECORD CONTRIBUTION
// =============================
export async function recordContribution(data: {
  memberId: string
  contributionTypeId: string
  amount: number
  paymentMethod: string
}) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }
  if (!hasPermission(session.user.role, "recordContribution"))
    return { error: "You don't have permission to record contributions" }

  if (!data.amount || data.amount <= 0)
    return { error: "Amount must be greater than 0" }

  const churchId = session.user.churchId

  // Verify member belongs to this church
  const member = await prisma.member.findFirst({
    where: { id: data.memberId, churchId },
  })
  if (!member) return { error: "Member not found" }

  // Verify contribution type belongs to this church
  const type = await prisma.contributionType.findFirst({
    where: { id: data.contributionTypeId, churchId, isActive: true },
  })
  if (!type) return { error: "Contribution type not found" }

  try {
    const contribution = await prisma.contribution.create({
      data: {
        churchId,
        memberId: data.memberId,
        contributionTypeId: data.contributionTypeId,
        amount: data.amount,
        paymentMethod: data.paymentMethod as any,
        recordedBy: session.user.id,
      },
    })

    await auditLog({
      churchId,
      userId: session.user.id,
      action: "CONTRIBUTION_RECORDED",
      entityType: "Contribution",
      entityId: contribution.id,
      metadata: {
        memberId: data.memberId,
        amount: data.amount,
        type: type.name,
      },
    })

    return { success: true, contribution }
  } catch (error) {
    console.error(error)
    return { error: "Failed to record contribution" }
  }
}

// =============================
// GET CONTRIBUTIONS LIST
// =============================
export async function getContributions(contributionTypeId?: string) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }
  if (!hasPermission(session.user.role, "viewContributions"))
    return { error: "Unauthorized" }

  const churchId = session.user.churchId

  const contributions = await prisma.contribution.findMany({
    where: {
      churchId,
      ...(contributionTypeId ? { contributionTypeId } : {}),
    },
    include: {
      member: true,
      contributionType: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return { success: true, contributions }
}