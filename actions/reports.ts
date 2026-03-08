/* eslint-disable @typescript-eslint/no-unused-vars */
"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function getTitheReport(month: number, year: number) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")
  const churchId = session.user.churchId

  const records = await prisma.titheRecord.findMany({
    where: { churchId, month, year },
    include: { member: { select: { firstName: true, lastName: true, memberNumber: true } } },
    orderBy: { createdAt: "asc" },
  })

  const total = records.reduce((sum, r) =>
    sum + (r.week1Amount ?? 0) + (r.week2Amount ?? 0) +
    (r.week3Amount ?? 0) + (r.week4Amount ?? 0) + (r.monthlyAmount ?? 0), 0)

  return { records, total }
}

export async function getWelfareReport(month: number, year: number) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")
  const churchId = session.user.churchId

  const contributions = await prisma.welfareContribution.findMany({
    where: { churchId, month, year },
    include: { member: { select: { firstName: true, lastName: true, memberNumber: true } } },
    orderBy: { createdAt: "asc" },
  })

  const payouts = await prisma.welfarePayout.findMany({
    where: {
      churchId,
      paidAt: {
        gte: new Date(year, month - 1, 1),
        lte: new Date(year, month, 0, 23, 59, 59),
      },
    },
    include: {
      request: {
        include: { member: { select: { firstName: true, lastName: true, memberNumber: true } } },
      },
    },
    orderBy: { paidAt: "asc" },
  })

  const totalIn = contributions.reduce((sum, c) => sum + c.totalPaid, 0)
  const totalOut = payouts.reduce((sum, p) => sum + p.amount, 0)

  return { contributions, payouts, totalIn, totalOut, balance: totalIn - totalOut }
}

export async function getOfferingsReport(month: number, year: number) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")
  const churchId = session.user.churchId

  const records = await prisma.offering.findMany({
    where: {
      churchId,
      serviceDate: {
        gte: new Date(year, month - 1, 1),
        lte: new Date(year, month, 0, 23, 59, 59),
      },
    },
    orderBy: { serviceDate: "asc" },
  })

  const total = records.reduce((sum, r) => sum + r.totalAmount, 0)
  const totalCash = records.reduce((sum, r) => sum + r.cashAmount, 0)
  const totalMomo = records.reduce((sum, r) => sum + r.momoAmount, 0)

  return { records, total, totalCash, totalMomo }
}

export async function getExpensesReport(month: number, year: number) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")
  const churchId = session.user.churchId

  const records = await prisma.expense.findMany({
    where: {
      churchId,
      isDeleted: false,
      createdAt: {
        gte: new Date(year, month - 1, 1),
        lte: new Date(year, month, 0, 23, 59, 59),
      },
    },
    orderBy: { createdAt: "asc" },
  })

  const total = records.reduce((sum, r) => sum + r.amount, 0)

  // Group by category
  const byCategory = records.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] ?? 0) + r.amount
    return acc
  }, {} as Record<string, number>)

  return { records, total, byCategory }
}

export async function getContributionsReport(month: number, year: number) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")
  const churchId = session.user.churchId

  const records = await prisma.contribution.findMany({
    where: {
      churchId,
      createdAt: {
        gte: new Date(year, month - 1, 1),
        lte: new Date(year, month, 0, 23, 59, 59),
      },
    },
    include: {
      member: { select: { firstName: true, lastName: true, memberNumber: true } },
      contributionType: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  const total = records.reduce((sum, r) => sum + r.amount, 0)

  const byType = records.reduce((acc, r) => {
    const name = r.contributionType.name
    acc[name] = (acc[name] ?? 0) + r.amount
    return acc
  }, {} as Record<string, number>)

  return { records, total, byType }
}

export async function getNewMembersReport(month: number, year: number) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")
  const churchId = session.user.churchId

  const records = await prisma.member.findMany({
    where: {
      churchId,
      joinDate: {
        gte: new Date(year, month - 1, 1),
        lte: new Date(year, month, 0, 23, 59, 59),
      },
    },
    orderBy: { joinDate: "asc" },
  })

  return { records, total: records.length }
}

export async function getFinanceSummaryReport(month: number, year: number) {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")
  const churchId = session.user.churchId

  const [tithe, offerings, expenses, contributions, welfare] = await Promise.all([
    getTitheReport(month, year),
    getOfferingsReport(month, year),
    getExpensesReport(month, year),
    getContributionsReport(month, year),
    getWelfareReport(month, year),
  ])

  const totalIncome = tithe.total + offerings.total + contributions.total
  const netBalance = totalIncome - expenses.total

  return { tithe, offerings, expenses, contributions, welfare, totalIncome, netBalance }
}