"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { hasPermission } from "@/lib/permissions"

// =============================
// GET FULL FINANCE SUMMARY
// =============================
export async function getFinanceSummary(month: number, year: number) {
  const session = await auth()
  if (!session) return { error: "Unauthorized" }
  if (!hasPermission(session.user.role, "viewFinance"))
    return { error: "Unauthorized" }

  const churchId = session.user.churchId

  const start = new Date(year, month - 1, 1)
  const end = new Date(year, month, 0, 23, 59, 59)

  // ── MAIN ACCOUNT ──
  const [offerings, contributions, expenses] = await Promise.all([
    prisma.offering.findMany({
      where: { churchId, serviceDate: { gte: start, lte: end } },
      orderBy: { serviceDate: "asc" },
    }),
    prisma.contribution.findMany({
      where: { churchId, createdAt: { gte: start, lte: end } },
      include: { 
        member: true,
        contributionType: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.expense.findMany({
      where: { churchId, isDeleted: false, createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: "asc" },
    }),
  ])

  const totalOfferings = offerings.reduce((s, o) => s + o.totalAmount, 0)
  const totalContributions = contributions.reduce((s, c) => s + c.amount, 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const mainBalance = totalOfferings + totalContributions - totalExpenses

  // ── TITHE ACCOUNT ──
  const titheRecords = await prisma.titheRecord.findMany({
    where: { churchId, year, month },
    include: { member: true },
  })

  const totalTithe = titheRecords.reduce((s, t) =>
    s +
    (t.week1Amount ?? 0) +
    (t.week2Amount ?? 0) +
    (t.week3Amount ?? 0) +
    (t.week4Amount ?? 0) +
    (t.monthlyAmount ?? 0), 0)

  // ── WELFARE ACCOUNT ──
  const [welfareContributions, welfarePayouts] = await Promise.all([
    prisma.welfareContribution.findMany({
      where: { churchId, month, year },
      include: { member: true },
    }),
    prisma.welfarePayout.findMany({
      where: { churchId, paidAt: { gte: start, lte: end } },
      include: { request: { include: { member: true } } },
    }),
  ])

  const totalWelfareIn = welfareContributions.reduce((s, w) => s + w.totalPaid, 0)
  const totalWelfareOut = welfarePayouts.reduce((s, w) => s + w.amount, 0)
  const welfareBalance = totalWelfareIn - totalWelfareOut

  // ── MONTHLY TREND (last 6 months) ──
  const trend = []
  for (let i = 5; i >= 0; i--) {
    let m = month - i
    let y = year
    if (m <= 0) { m += 12; y -= 1 }

    const s = new Date(y, m - 1, 1)
    const e = new Date(y, m, 0, 23, 59, 59)

    const [tOfferings, tContributions, tExpenses, tTithe, tWelfareIn, tWelfareOut] =
      await Promise.all([
        prisma.offering.aggregate({
          where: { churchId, serviceDate: { gte: s, lte: e } },
          _sum: { totalAmount: true },
        }),
        prisma.contribution.aggregate({
          where: { churchId, createdAt: { gte: s, lte: e } },
          _sum: { amount: true },
        }),
        prisma.expense.aggregate({
          where: { churchId, isDeleted: false, createdAt: { gte: s, lte: e } },
          _sum: { amount: true },
        }),
        prisma.titheRecord.findMany({
          where: { churchId, year: y, month: m },
        }),
        prisma.welfareContribution.aggregate({
          where: { churchId, month: m, year: y },
          _sum: { totalPaid: true },
        }),
        prisma.welfarePayout.aggregate({
          where: { churchId, paidAt: { gte: s, lte: e } },
          _sum: { amount: true },
        }),
      ])

    const titheTotal = tTithe.reduce((sum, t) =>
      sum +
      (t.week1Amount ?? 0) +
      (t.week2Amount ?? 0) +
      (t.week3Amount ?? 0) +
      (t.week4Amount ?? 0) +
      (t.monthlyAmount ?? 0), 0)

    trend.push({
      month: new Date(y, m - 1).toLocaleString("default", { month: "short" }),
      offerings: tOfferings._sum.totalAmount ?? 0,
      contributions: tContributions._sum.amount ?? 0,
      expenses: tExpenses._sum.amount ?? 0,
      tithe: titheTotal,
      welfareIn: tWelfareIn._sum.totalPaid ?? 0,
      welfareOut: tWelfareOut._sum.amount ?? 0,
    })
  }

  return {
    success: true,
    main: {
      totalOfferings,
      totalContributions,
      totalExpenses,
      balance: mainBalance,
      offerings,
      contributions,
      expenses,
    },
    tithe: {
      total: totalTithe,
      records: titheRecords,
    },
    welfare: {
      totalIn: totalWelfareIn,
      totalOut: totalWelfareOut,
      balance: welfareBalance,
      contributions: welfareContributions,
      payouts: welfarePayouts,
    },
    trend,
  }
}