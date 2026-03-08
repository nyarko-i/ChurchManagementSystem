/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import Link from "next/link"

export default async function DashboardHomePage() {
  const session = await auth()
  if (!session) return null
  const churchId = session.user.churchId

  const today = new Date()
  const month = today.getMonth() + 1
  const year = today.getFullYear()

  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month, 0, 23, 59, 59)

  // ── STATS ────────────────────────────────────────────────
  const [
    totalMembers,
    activeMembers,
    titheRecords,
    offerings,
    expenses,
    welfareContributions,
    welfarePayouts,
    recentTithe,
    recentOfferings,
    recentExpenses,
    recentContributions,
    birthdaysThisMonth,
  ] = await Promise.all([
    prisma.member.count({ where: { churchId } }),
    prisma.member.count({ where: { churchId, status: "active" } }),

    prisma.titheRecord.findMany({
      where: { churchId, month, year },
      select: {
        week1Amount: true,
        week2Amount: true,
        week3Amount: true,
        week4Amount: true,
        monthlyAmount: true,
      },
    }),

    prisma.offering.findMany({
      where: {
        churchId,
        serviceDate: { gte: monthStart, lte: monthEnd },
      },
      select: { totalAmount: true },
    }),

    prisma.expense.findMany({
      where: {
        churchId,
        isDeleted: false,
        createdAt: { gte: monthStart, lte: monthEnd },
      },
      select: { amount: true },
    }),

    prisma.welfareContribution.findMany({
      where: { churchId, month, year },
      select: { totalPaid: true },
    }),

    prisma.welfarePayout.findMany({
      where: {
        churchId,
        paidAt: { gte: monthStart, lte: monthEnd },
      },
      select: { amount: true },
    }),

    // Recent tithe (last 5)
    prisma.titheRecord.findMany({
      where: { churchId },
      include: { member: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    // Recent offerings (last 5)
    prisma.offering.findMany({
      where: { churchId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    // Recent expenses (last 5)
    prisma.expense.findMany({
      where: { churchId, isDeleted: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    // Recent contributions (last 5)
    prisma.contribution.findMany({
      where: { churchId },
      include: {
        member: { select: { firstName: true, lastName: true } },
        contributionType: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    // Birthdays this month
    prisma.member.findMany({
      where: {
        churchId,
        status: "active",
        dateOfBirth: { not: null },
      },
      select: { firstName: true, lastName: true, dateOfBirth: true },
    }),
  ])

  // Calculate totals
  const titheTotal = titheRecords.reduce((sum, r) => {
    return (
      sum +
      (r.week1Amount ?? 0) +
      (r.week2Amount ?? 0) +
      (r.week3Amount ?? 0) +
      (r.week4Amount ?? 0) +
      (r.monthlyAmount ?? 0)
    )
  }, 0)

  const offeringsTotal = offerings.reduce((sum, o) => sum + o.totalAmount, 0)
  const expensesTotal = expenses.reduce((sum, e) => sum + e.amount, 0)
  const welfareIn = welfareContributions.reduce((sum, c) => sum + c.totalPaid, 0)
  const welfareOut = welfarePayouts.reduce((sum, p) => sum + p.amount, 0)
  const welfareBalance = welfareIn - welfareOut
  const mainBalance = offeringsTotal + (recentContributions.length > 0 ? 0 : 0) - expensesTotal

  // Birthdays this month
  const thisMonthBirthdays = birthdaysThisMonth.filter((m) => {
    const dob = new Date(m.dateOfBirth!)
    return dob.getMonth() + 1 === month
  })

  // Today's birthdays
  const todayBirthdays = birthdaysThisMonth.filter((m) => {
    const dob = new Date(m.dateOfBirth!)
    return dob.getMonth() + 1 === month && dob.getDate() === today.getDate()
  })

  // Merge recent activity
  type Activity = {
    id: string
    label: string
    amount?: number
    type: "tithe" | "offering" | "expense" | "contribution"
    date: Date
  }

  const activity: Activity[] = [
    ...recentTithe.map((r) => ({
      id: r.id,
      label: `${r.member.firstName} ${r.member.lastName} — Tithe`,
      amount:
        (r.week1Amount ?? 0) +
        (r.week2Amount ?? 0) +
        (r.week3Amount ?? 0) +
        (r.week4Amount ?? 0) +
        (r.monthlyAmount ?? 0),
      type: "tithe" as const,
      date: r.createdAt,
    })),
    ...recentOfferings.map((o) => ({
      id: o.id,
      label: `${o.serviceType} Offering`,
      amount: o.totalAmount,
      type: "offering" as const,
      date: o.createdAt,
    })),
    ...recentExpenses.map((e) => ({
      id: e.id,
      label: `${e.title} — ${e.category}`,
      amount: e.amount,
      type: "expense" as const,
      date: e.createdAt,
    })),
    ...recentContributions.map((c) => ({
      id: c.id,
      label: `${c.member.firstName} ${c.member.lastName} — ${c.contributionType.name}`,
      amount: c.amount,
      type: "contribution" as const,
      date: c.createdAt,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10)

  const formatDate = (date: Date) => {
    const d = new Date(date)
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
  }

  const monthName = today.toLocaleString("default", { month: "long" })

  return (
    <div className="p-6 space-y-8">

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {session.user.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here&apos;s what&apos;s happening this month — {monthName} {year}
          </p>
        </div>
        {todayBirthdays.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm">
            <p className="font-semibold text-yellow-800">🎂 Today&apos;s Birthdays</p>
            {todayBirthdays.map((m, i) => (
              <p key={i} className="text-yellow-700 text-xs mt-0.5">
                {m.firstName} {m.lastName}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm col-span-1">
          <p className="text-xs text-gray-500 font-medium">Total Members</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{activeMembers}</p>
          <p className="text-xs text-gray-400 mt-1">{totalMembers} total</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Tithe This Month</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            GHS {titheTotal.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{titheRecords.length} records</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Offerings This Month</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            GHS {offeringsTotal.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{offerings.length} services</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Expenses This Month</p>
          <p className="text-2xl font-bold text-red-500 mt-1">
            GHS {expensesTotal.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{expenses.length} records</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Welfare Balance</p>
          <p className={`text-2xl font-bold mt-1 ${welfareBalance >= 0 ? "text-green-600" : "text-red-500"}`}>
            GHS {welfareBalance.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Out: GHS {welfareOut.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Main Balance</p>
          <p className={`text-2xl font-bold mt-1 ${(offeringsTotal - expensesTotal) >= 0 ? "text-green-600" : "text-red-500"}`}>
            GHS {(offeringsTotal - expensesTotal).toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Offerings - Expenses</p>
        </div>

      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: "Add Member", href: "/dashboard/members/new", icon: "👤", color: "bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100" },
            { label: "Record Tithe", href: "/dashboard/tithe", icon: "📖", color: "bg-purple-50 border-purple-100 text-purple-700 hover:bg-purple-100" },
            { label: "Record Offering", href: "/dashboard/offerings", icon: "🙏", color: "bg-green-50 border-green-100 text-green-700 hover:bg-green-100" },
            { label: "Add Expense", href: "/dashboard/expenses", icon: "💸", color: "bg-red-50 border-red-100 text-red-700 hover:bg-red-100" },
            { label: "Send SMS", href: "/dashboard/sms", icon: "📱", color: "bg-orange-50 border-orange-100 text-orange-700 hover:bg-orange-100" },
            { label: "Finance Report", href: "/dashboard/finance", icon: "📊", color: "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100" },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border text-center transition ${action.color}`}
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs font-semibold">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-700">Recent Activity</h3>
          </div>
          <div className="divide-y">
            {activity.map((item) => (
              <div key={item.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {item.type === "tithe" ? "📖" :
                     item.type === "offering" ? "🙏" :
                     item.type === "expense" ? "💸" : "💰"}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-700 capitalize">{item.label}</p>
                    <p className="text-xs text-gray-400">{formatDate(item.date)}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${
                  item.type === "expense" ? "text-red-500" : "text-green-600"
                }`}>
                  {item.type === "expense" ? "-" : "+"}GHS {item.amount?.toFixed(2) ?? "0.00"}
                </span>
              </div>
            ))}
            {activity.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-400 text-sm">
                No recent activity
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-6">

          {/* Birthdays This Month */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-700">🎂 Birthdays This Month</h3>
            </div>
            <div className="divide-y max-h-48 overflow-y-auto">
              {thisMonthBirthdays.length === 0 ? (
                <p className="px-5 py-4 text-sm text-gray-400">No birthdays this month</p>
              ) : (
                thisMonthBirthdays
                  .sort((a, b) => new Date(a.dateOfBirth!).getDate() - new Date(b.dateOfBirth!).getDate())
                  .map((m, i) => {
                    const dob = new Date(m.dateOfBirth!)
                    const isToday = dob.getDate() === today.getDate()
                    return (
                      <div key={i} className={`px-5 py-2.5 flex justify-between items-center ${isToday ? "bg-yellow-50" : ""}`}>
                        <p className="text-sm text-gray-700">
                          {isToday && "🎉 "}{m.firstName} {m.lastName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {String(dob.getDate()).padStart(2, "0")}/{String(month).padStart(2, "0")}
                        </p>
                      </div>
                    )
                  })
              )}
            </div>
          </div>

          {/* Month Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
            <h3 className="font-semibold text-gray-700">📅 {monthName} Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Income</span>
                <span className="font-semibold text-green-600">
                  GHS {(offeringsTotal + titheTotal).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Expenses</span>
                <span className="font-semibold text-red-500">
                  GHS {expensesTotal.toFixed(2)}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-gray-700 font-medium">Net Balance</span>
                <span className={`font-bold ${(offeringsTotal + titheTotal - expensesTotal) >= 0 ? "text-green-600" : "text-red-500"}`}>
                  GHS {(offeringsTotal + titheTotal - expensesTotal).toFixed(2)}
                </span>
              </div>
            </div>
            <Link
              href="/dashboard/finance"
              className="block w-full text-center text-xs font-semibold text-blue-700 hover:underline mt-2"
            >
              View Full Finance Report →
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}