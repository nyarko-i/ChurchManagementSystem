import { requirePermission } from "@/lib/permissions"
import { getMembersWelfareStatus, getWelfareRequests } from "@/actions/welfare"
import MonthYearSelector from "@/components/MonthYearSelector"
import WelfareContributionsTable from "@/components/WelfareContributionsTable"
import WelfareRequestsTable from "@/components/WelfareRequestsTable"
import WelfareSettingsForm from "@/components/WelfareSettingsForm"
import Link from "next/link"

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
]

export default async function WelfarePage(props: {
  searchParams: Promise<{ month?: string; year?: string; tab?: string }>
}) {
  await requirePermission("viewWelfare")

  const searchParams = await props.searchParams
  const now = new Date()
  const month = parseInt(searchParams.month ?? String(now.getMonth() + 1))
  const year = parseInt(searchParams.year ?? String(now.getFullYear()))
  const tab = searchParams.tab ?? "contributions"

  const [statusResult, requestsResult] = await Promise.all([
    getMembersWelfareStatus(month, year),
    getWelfareRequests(),
  ])

  const members = statusResult.success ? statusResult.members ?? [] : []
  const settings = statusResult.success ? statusResult.settings ?? null : null
  const requests = requestsResult.success ? requestsResult.requests ?? [] : []

  const paidCount = members.filter(
    (m) => m.welfareContributions[0]?.isSigned === true
  ).length
  const unpaidCount = members.length - paidCount
  const pendingRequests = requests.filter((r) => r.status === "pending").length

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Welfare</h2>
          <p className="text-gray-500 mt-1">
            {MONTHS[month - 1]} {year} —
            Monthly Amount: {settings ? `GHS ${settings.amount}` : "Not set"}
          </p>
        </div>
        <Link
          href="/dashboard/welfare/request/new"
          className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition"
        >
          + File Request
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Signed Off This Month</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{paidCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Unpaid This Month</p>
          <p className="text-3xl font-bold text-red-500 mt-1">{unpaidCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Pending Requests</p>
          <p className="text-3xl font-bold text-yellow-500 mt-1">{pendingRequests}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "contributions", label: "Contributions" },
          { key: "requests", label: "Requests" },
          { key: "settings", label: "Settings" },
        ].map((t) => (
          <Link
            key={t.key}
            href={`/dashboard/welfare?tab=${t.key}&month=${month}&year=${year}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.key
                ? "bg-blue-700 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "contributions" && (
        <>
          <MonthYearSelector
            month={month}
            year={year}
            basePath="/dashboard/welfare"
          />
          <WelfareContributionsTable
            members={members}
            month={month}
            year={year}
          />
        </>
      )}

      {tab === "requests" && (
        <WelfareRequestsTable requests={requests} />
      )}

      {tab === "settings" && (
        <WelfareSettingsForm settings={settings} />
      )}
    </div>
  )
}