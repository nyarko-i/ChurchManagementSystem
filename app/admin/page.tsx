/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAllChurches } from "@/actions/admin"
import AdminClient from "@/components/admin/AdminClient"

export default async function AdminPage() {
  const churches = await getAllChurches()

  const totalMembers = churches.reduce((sum: any, c: { _count: { members: any } }) => sum + c._count.members, 0)
  const totalChurches = churches.length
  const activeChurches = churches.filter((c: { subscriptionStatus: string }) => c.subscriptionStatus === "active").length
  const suspended = churches.filter((c: { subscriptionStatus: string }) => c.subscriptionStatus === "suspended").length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Super Admin</h1>
        <p className="text-gray-400 mt-1">Manage all churches on ChurchCore</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Churches", value: totalChurches, color: "text-white" },
          { label: "Active", value: activeChurches, color: "text-green-400" },
          { label: "Suspended", value: suspended, color: "text-red-400" },
          { label: "Total Members", value: totalMembers.toLocaleString(), color: "text-yellow-400" },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Churches Table + Actions */}
      <AdminClient churches={churches} />
    </div>
  )
}