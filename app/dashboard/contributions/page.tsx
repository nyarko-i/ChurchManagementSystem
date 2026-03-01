import { requirePermission } from "@/lib/permissions"
import { getContributionTypes, getContributions } from "@/actions/contributions"
import ContributionTypesPanel from "@/components/ContributionTypesPanel"
import RecordContributionForm from "@/components/RecordContributionForm"
import Link from "next/link"

export default async function ContributionsPage(props: {
  searchParams: Promise<{ tab?: string; typeId?: string }>
}) {
  await requirePermission("viewContributions")

  const searchParams = await props.searchParams
  const tab = searchParams.tab ?? "list"
  const typeId = searchParams.typeId ?? ""

  const [typesResult, contributionsResult] = await Promise.all([
    getContributionTypes(),
    getContributions(typeId || undefined),
  ])

  const types = typesResult.success ? typesResult.types ?? [] : []
  const contributions = contributionsResult.success
    ? contributionsResult.contributions ?? []
    : []

  const totalAmount = contributions.reduce((sum, c) => sum + c.amount, 0)

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Contributions</h2>
          <p className="text-gray-500 mt-1">
            Custom church contribution collections
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "list", label: "All Contributions" },
          { key: "record", label: "Record Contribution" },
          { key: "types", label: "Manage Types" },
        ].map((t) => (
          <Link
            key={t.key}
            href={`/dashboard/contributions?tab=${t.key}`}
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

      {/* List Tab */}
      {tab === "list" && (
        <div>
          {/* Filter by type */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 mb-6 flex gap-4 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Filter by Type
              </label>
              <div className="flex gap-2 flex-wrap">
                <Link
                  href="/dashboard/contributions?tab=list"
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    !typeId
                      ? "bg-blue-700 text-white border-blue-700"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  All
                </Link>
                {types.map((t) => (
                  <Link
                    key={t.id}
                    href={`/dashboard/contributions?tab=list&typeId=${t.id}`}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      typeId === t.id
                        ? "bg-blue-700 text-white border-blue-700"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {t.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
            <p className="text-sm text-gray-500">Total Contributions</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              GHS {totalAmount.toFixed(2)}
            </p>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Member</th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Type</th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Amount</th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Method</th>
                  <th className="text-left px-6 py-3 text-gray-600 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {c.member.firstName} {c.member.lastName}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {c.contributionType.name}
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-600">
                      GHS {c.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 capitalize">
                      {c.paymentMethod}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {contributions.length === 0 && (
              <div className="p-12 text-center text-gray-400">
                No contributions recorded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Record Tab */}
      {tab === "record" && (
        <RecordContributionForm types={types.filter((t) => t.isActive)} />
      )}

      {/* Types Tab */}
      {tab === "types" && (
        <ContributionTypesPanel types={types} />
      )}
    </div>
  )
}