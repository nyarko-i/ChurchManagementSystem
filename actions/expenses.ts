/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { hasPermission, auditLog } from "@/lib/permissions"

// =============================
// RECORD EXPENSE
// =============================
export async function recordExpense(data: {
  title: string
  category: string
  amount: number
  description: string
}) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }
  if (!hasPermission(session.user.role, "recordExpense"))
    return { error: "You don't have permission to record expenses" }

  if (!data.title.trim()) return { error: "Title is required" }
  if (!data.category.trim()) return { error: "Category is required" }
  if (!data.amount || data.amount <= 0) return { error: "Amount must be greater than 0" }

  const churchId = session.user.churchId

  try {
    const expense = await prisma.expense.create({
      data: {
        churchId,
        title: data.title.trim(),
        category: data.category.trim(),
        amount: data.amount,
        description: data.description.trim() || null,
        recordedBy: session.user.id,
      },
    })

    await auditLog({
      churchId,
      userId: session.user.id,
      action: "EXPENSE_RECORDED",
      entityType: "Expense",
      entityId: expense.id,
      metadata: { title: data.title, amount: data.amount, category: data.category },
    })

    return { success: true, expense }
  } catch (error) {
    console.error(error)
    return { error: "Failed to record expense" }
  }
}

// =============================
// GET EXPENSES
// =============================
export async function getExpenses(month?: number, year?: number) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }
  if (!hasPermission(session.user.role, "viewExpenses"))
    return { error: "Unauthorized" }

  const churchId = session.user.churchId

  const where: any = { churchId, isDeleted: false }

  if (month && year) {
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0, 23, 59, 59)
    where.createdAt = { gte: start, lte: end }
  }

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)

  // Group by category
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount
    return acc
  }, {} as Record<string, number>)

  return { success: true, expenses, totalAmount, byCategory }
}

// =============================
// SOFT DELETE EXPENSE
// =============================
export async function deleteExpense(id: string) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }
  if (!hasPermission(session.user.role, "recordExpense"))
    return { error: "Unauthorized" }

  const churchId = session.user.churchId

  const expense = await prisma.expense.findFirst({
    where: { id, churchId, isDeleted: false },
  })
  if (!expense) return { error: "Expense not found" }

  try {
    await prisma.expense.update({
      where: { id },
      data: { isDeleted: true },
    })

    await auditLog({
      churchId,
      userId: session.user.id,
      action: "EXPENSE_DELETED",
      entityType: "Expense",
      entityId: id,
      metadata: { title: expense.title, amount: expense.amount },
    })

    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to delete expense" }
  }
}