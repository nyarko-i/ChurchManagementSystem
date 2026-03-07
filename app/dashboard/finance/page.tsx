import { requirePermission } from "@/lib/permissions"
import { getFinanceSummary } from "@/actions/finance"
import MonthYearSelector from "@/components/MonthYearSelector"
import FinanceDashboard from "@/components/FinanceDashboard"

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
]

export default async function FinancePage(props: {
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  await requirePermission("viewFinance")

  const searchParams = await props.searchParams
  const now = new Date()
  const month = parseInt(searchParams.month ?? String(now.getMonth() + 1))
  const year = parseInt(searchParams.year ?? String(now.getFullYear()))

  const result = await getFinanceSummary(month, year)

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Finance Report</h2>
          <p className="text-gray-500 mt-1">
            {MONTHS[month - 1]} {year} — Full financial overview
          </p>
        </div>
      </div>

      <MonthYearSelector
        month={month}
        year={year}
        basePath="/dashboard/finance"
      />

      {result.success ? (
        <FinanceDashboard
          month={month}
          year={year}
          main={result.main!}
          tithe={result.tithe!}
          welfare={result.welfare!}
          trend={result.trend!}
        />
      ) : (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Failed to load finance data.
        </div>
      )}
    </div>
  )
}