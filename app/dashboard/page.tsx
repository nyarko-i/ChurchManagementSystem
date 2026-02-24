/* eslint-disable react/no-unescaped-entities */
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function DashboardPage(props: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const searchParams = await props.searchParams
  const isUnauthorized = searchParams?.error === "unauthorized"

  const memberCount = await prisma.member.count({
    where: { churchId: session.user.churchId },
  })

  return (
    <div>
      {/* Unauthorized Warning */}
      {isUnauthorized && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
          ⚠️ You don't have permission to access that page.
        </div>
      )}

      {/* Welcome */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 mt-1">Here's what's happening in your church</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Total Members</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{memberCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Total Giving (This Month)</p>
          <p className="text-3xl font-bold text-green-600 mt-1">GHS 0</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Last Attendance</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">0</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/dashboard/members/new"
            className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition border border-gray-100">
            <p className="text-2xl mb-2">👤</p>
            <p className="text-sm font-medium text-gray-700">Add Member</p>
          </Link>
          <Link href="/dashboard/tithe"
            className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition border border-gray-100">
            <p className="text-2xl mb-2">📖</p>
            <p className="text-sm font-medium text-gray-700">Record Tithe</p>
          </Link>
          <Link href="/dashboard/welfare"
            className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition border border-gray-100">
            <p className="text-2xl mb-2">🏥</p>
            <p className="text-sm font-medium text-gray-700">Welfare</p>
          </Link>
          <Link href="/dashboard/sms"
            className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition border border-gray-100">
            <p className="text-2xl mb-2">📩</p>
            <p className="text-sm font-medium text-gray-700">Send SMS</p>
          </Link>
          <Link href="/dashboard/offerings"
            className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition border border-gray-100">
            <p className="text-2xl mb-2">🙏</p>
            <p className="text-sm font-medium text-gray-700">Record Offering</p>
          </Link>
          <Link href="/dashboard/contributions"
            className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition border border-gray-100">
            <p className="text-2xl mb-2">💰</p>
            <p className="text-sm font-medium text-gray-700">Contributions</p>
          </Link>
          <Link href="/dashboard/expenses"
            className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition border border-gray-100">
            <p className="text-2xl mb-2">📋</p>
            <p className="text-sm font-medium text-gray-700">Expenses</p>
          </Link>
          <Link href="/dashboard/finance"
            className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition border border-gray-100">
            <p className="text-2xl mb-2">📊</p>
            <p className="text-sm font-medium text-gray-700">Finance Report</p>
          </Link>
        </div>
      </div>

    </div>
  )
}