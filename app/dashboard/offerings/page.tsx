import { requirePermission } from "@/lib/permissions"
import { getOfferings } from "@/actions/offerings"
import MonthYearSelector from "@/components/MonthYearSelector"
import RecordOfferingForm from "@/components/RecordOfferingForm"
import Link from "next/link"

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
]

const SERVICE_TYPES: Record<string, string> = {
  sunday: "🙏 Sunday Service",
  midweek: "📖 Midweek Service",
  special: "⭐ Special Service",
}

export default async function OfferingsPage(props: {
  searchParams: Promise<{ tab?: string; month?: string; year?: string }>
}) {
  await requirePermission("viewOffering")

  const searchParams = await props.searchParams
  const tab = searchParams.tab ?? "list"
  const now = new Date()
  const month = parseInt(searchParams.month ?? String(now.getMonth() + 1))
  const year = parseInt(searchParams.year ?? String(now.getFullYear()))

  const result = await getOfferings(month, year)
  const offerings = result.success ? result.offerings ?? [] : []
  const totalCash = result.success ? result.totalCash ?? 0 : 0
  const totalMomo = result.success ? result.totalMomo ?? 0 : 0
  const totalAmount = result.success ? result.totalAmount ?? 0 : 0

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Offerings</h2>
          <p className="text-gray-500 mt-1">
            Service collection records — {MONTHS[month - 1]} {year}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "list", label: "Offering Records" },
          { key: "record", label: "Record Offering" },
        ].map((t) => (
          <Link
            key={t.key}
            href={`/dashboard/offerings?tab=${t.key}&month=${month}&year=${year}`}
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

      {tab === "list" && (
        <div>
          <MonthYearSelector
            month={month}
            year={year}
            basePath="/dashboard/offerings"
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <p className="text-sm text-gray-500">Total Cash</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                GHS {totalCash.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <p className="text-sm text-gray-500">Total MoMo</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                GHS {totalMomo.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <p className="text-sm text-gray-500">Total Offering</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                GHS {totalAmount.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Date</th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Service</th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Cash</th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">MoMo</th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Total</th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {offerings.map((o) => (
                  <tr key={o.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-800">
                      {new Date(o.serviceDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {SERVICE_TYPES[o.serviceType] ?? o.serviceType}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      GHS {o.cashAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      GHS {o.momoAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-600">
                      GHS {o.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {o.notes ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {offerings.length === 0 && (
              <div className="p-12 text-center text-gray-400">
                No offerings recorded for this month.
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "record" && <RecordOfferingForm />}
    </div>
  )
}