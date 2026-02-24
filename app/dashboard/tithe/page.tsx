import { requirePermission } from "@/lib/permissions"
import { getMembersTitheStatus } from "@/actions/tithe"
import MonthYearSelector from "@/components/MonthYearSelector"
import Link from "next/link"

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
]

export default async function TithePage(props: {
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  await requirePermission("viewTithe")

  const searchParams = await props.searchParams
  const now = new Date()
  const month = parseInt(searchParams.month ?? String(now.getMonth() + 1))
  const year = parseInt(searchParams.year ?? String(now.getFullYear()))

  const result = await getMembersTitheStatus(month, year)
  const members = result.success ? result.members ?? [] : []

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tithe Records</h2>
          <p className="text-gray-500 mt-1">
            {MONTHS[month - 1]} {year}
          </p>
        </div>
      </div>

      {/* Month/Year Selector */}
      <MonthYearSelector month={month} year={year} />

      {/* Members Tithe Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-gray-600 font-medium">Member</th>
              <th className="text-left px-6 py-3 text-gray-600 font-medium">Week 1</th>
              <th className="text-left px-6 py-3 text-gray-600 font-medium">Week 2</th>
              <th className="text-left px-6 py-3 text-gray-600 font-medium">Week 3</th>
              <th className="text-left px-6 py-3 text-gray-600 font-medium">Week 4</th>
              <th className="text-left px-6 py-3 text-gray-600 font-medium">Monthly</th>
              <th className="text-left px-6 py-3 text-gray-600 font-medium">Total</th>
              <th className="text-left px-6 py-3 text-gray-600 font-medium">Status</th>
              <th className="text-left px-6 py-3 text-gray-600 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const record = member.titheRecords[0]
              const total =
                (record?.week1Amount ?? 0) +
                (record?.week2Amount ?? 0) +
                (record?.week3Amount ?? 0) +
                (record?.week4Amount ?? 0) +
                (record?.monthlyAmount ?? 0)

              return (
                <tr key={member.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {member.firstName} {member.lastName}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {record?.week1Amount ? `GHS ${record.week1Amount}` : "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {record?.week2Amount ? `GHS ${record.week2Amount}` : "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {record?.week3Amount ? `GHS ${record.week3Amount}` : "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {record?.week4Amount ? `GHS ${record.week4Amount}` : "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {record?.monthlyAmount ? `GHS ${record.monthlyAmount}` : "—"}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800">
                    {total > 0 ? `GHS ${total}` : "—"}
                  </td>
                  <td className="px-6 py-4">
                    {record?.isSigned ? (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        ✓ Signed
                      </span>
                    ) : total > 0 ? (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                        Pending
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                        No Record
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/tithe/${member.id}?month=${month}&year=${year}`}
                      className="text-blue-600 hover:underline text-xs font-medium"
                    >
                      Record →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {members.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            No active members found.
          </div>
        )}
      </div>
    </div>
  )
}