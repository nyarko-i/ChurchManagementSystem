import { auth } from "@/auth"
import { redirect } from "next/navigation"

// =============================
// ROLE HIERARCHY
// =============================
export const ROLES = {
  super_admin: 4,
  pastor: 3,
  treasurer: 2,
  secretary: 1,
} as const

export type UserRole = keyof typeof ROLES

// =============================
// PERMISSION RULES
// =============================
export const PERMISSIONS = {
  // Members
  managemembers:      ["super_admin", "pastor", "secretary"],
  viewMembers:        ["super_admin", "pastor", "treasurer", "secretary"],

  // Tithe
  recordTithe:        ["super_admin", "treasurer"],
  viewTithe:          ["super_admin", "pastor", "treasurer"],
  signOffTithe:       ["super_admin", "treasurer"],

  // Welfare contributions
  recordWelfare:      ["super_admin", "treasurer", "secretary"],
  viewWelfare:        ["super_admin", "pastor", "treasurer"],
  approveWelfare:     ["super_admin", "pastor", "treasurer"],
  recordPayout:       ["super_admin", "treasurer"],

  // Contributions
  recordContribution: ["super_admin", "treasurer", "secretary"],
  viewContributions:  ["super_admin", "pastor", "treasurer"],
  manageContributionTypes: ["super_admin", "treasurer"],

  // Offering
  recordOffering:     ["super_admin", "treasurer"],
  viewOffering:       ["super_admin", "pastor", "treasurer"],

  // Expenses
  recordExpense:      ["super_admin", "treasurer"],
  viewExpenses:       ["super_admin", "pastor", "treasurer"],

  // Finance dashboard
  viewFinance:        ["super_admin", "pastor", "treasurer"],

  // SMS
  sendSms:            ["super_admin", "pastor", "secretary"],

  // Settings
  manageSettings:     ["super_admin"],
} as const

export type Permission = keyof typeof PERMISSIONS

// =============================
// CHECK PERMISSION (returns boolean)
// =============================
export function hasPermission(
  role: string,
  permission: Permission
): boolean {
  const allowedRoles = PERMISSIONS[permission] as readonly string[]
  return allowedRoles.includes(role)
}

// =============================
// REQUIRE PERMISSION (use in server components/actions)
// Redirects if not allowed
// =============================
export async function requirePermission(permission: Permission) {
  const session = await auth()

  if (!session) redirect("/login")

  const allowed = hasPermission(session.user.role, permission)

  if (!allowed) redirect("/dashboard?error=unauthorized")

  return session
}

// =============================
// AUDIT LOGGER
// =============================
import { prisma } from "@/lib/prisma"

export async function auditLog({
  churchId,
  userId,
  action,
  entityType,
  entityId,
  metadata,
}: {
  churchId: string
  userId: string
  action: string
  entityType: string
  entityId: string
  metadata?: object
}) {
  try {
    await prisma.auditLog.create({
      data: {
        churchId,
        userId,
        action,
        entityType,
        entityId,
        metadata: metadata ?? {},
      },
    })
  } catch (error) {
    console.error("Audit log failed:", error)
  }
}