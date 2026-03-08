import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { notFound } from "next/navigation"
import Link from "next/link"
import EditMemberForm from "@/components/EditMemberForm"

type Props = {
  params: { id: string }
}

export default async function MemberDetailPage({ params }: Props) {
  const session = await auth()
  if (!session) return null
  const churchId = session.user.churchId

  const member = await prisma.member.findFirst({
    where: { id: params.id, churchId },
  })

  if (!member) notFound()

  const [titheRecords, welfareContributions, welfareRequests, contributions, smsLogs] =
    await Promise.all([
      prisma.titheRecord.findMany({
        where: { memberId: member.id, churchId },
        orderBy: [{ year: "desc" }, { month: "desc" }],
      }),

      prisma.welfareContribution.findMany({
        where: { memberId: member.id, churchId },
        orderBy: [{ year: "desc" }, { month: "desc" }],
      }),

      prisma.welfareRequest.findMany({
        where: { memberId: member.id, churchId },
        include: { payout: true },
        orderBy: { createdAt: "desc" },
      }),

      prisma.contribution.findMany({
        where: { memberId: member.id, churchId },
        include: { contributionType: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      }),

      prisma.smsLog.findMany({
        where: { churchId, recipientPhone: member.phone ?? "" },
        orderBy: { sentAt: "desc" },
        take: 20,
      }),
    ])

  const totalTithe = titheRecords.reduce(
    (sum, r) =>
      sum +
      (r.week1Amount ?? 0) +
      (r.week2Amount ?? 0) +
      (r.week3Amount ?? 0) +
      (r.week4Amount ?? 0) +
      (r.monthlyAmount ?? 0),
    0
  )

  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0)
  const totalWelfarePaid = welfareContributions.reduce((sum, c) => sum + c.totalPaid, 0)

  const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]

  const formatDate = (date: Date | string | null) => {
    if (!date) return "—"
    const d = new Date(date)
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
  }

  return (
    <div className="p-6 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/members"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Members
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-bold text-gray-900">
            {member.firstName} {member.lastName}
          </h1>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            member.status === "active"
              ? "bg-green-100 text-green-700"
              : member.status === "inactive"
              ? "bg-gray-100 text-gray-500"
              : "bg-red-100 text-red-500"
          }`}>
            {member.status}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
          <p className="text-sm text-gray-500">Total Tithe</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">GHS {totalTithe.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">{titheRecords.length} records</p>
        </div>
        <div className="bg-green-50 rounded-xl p-5 border border-green-100">
          <p className="text-sm text-gray-500">Total Contributions</p>
          <p className="text-2xl font-bold text-green-600 mt-1">GHS {totalContributions.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">{contributions.length} records</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
          <p className="text-sm text-gray-500">Welfare Paid</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">GHS {totalWelfarePaid.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">{welfareContributions.length} months</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Personal Info + Edit */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-700">Personal Info</h3>
            </div>
            <div className="px-6 py-4 space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">Member Number</p>
                <p className="font-medium text-gray-700">{member.memberNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Full Name</p>
                <p className="font-medium text-gray-700">{member.firstName} {member.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Phone</p>
                <p className="font-medium text-gray-700">{member.phone ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="font-medium text-gray-700">{member.email ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Gender</p>
                <p className="font-medium text-gray-700 capitalize">{member.gender ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Date of Birth</p>
                <p className="font-medium text-gray-700">{formatDate(member.dateOfBirth)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Address</p>
                <p className="font-medium text-gray-700">{member.address ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Occupation</p>
                <p className="font-medium text-gray-700">{member.occupation ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Join Date</p>
                <p className="font-medium text-gray-700">{formatDate(member.joinDate)}</p>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <EditMemberForm member={member} />
        </div>

        {/* Right: History Tabs */}
        <div className="lg:col-span-2 space-y-6">

          {/* Tithe History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-700">📖 Tithe History</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Month</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">W1</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">W2</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">W3</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">W4</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Monthly</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Total</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {titheRecords.map((r) => {
                  const total =
                    (r.week1Amount ?? 0) + (r.week2Amount ?? 0) +
                    (r.week3Amount ?? 0) + (r.week4Amount ?? 0) +
                    (r.monthlyAmount ?? 0)
                  return (
                    <tr key={r.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-700 font-medium">
                        {MONTHS[r.month - 1]} {r.year}
                      </td>
                      <td className="px-6 py-3 text-gray-600">{r.week1Amount ?? "—"}</td>
                      <td className="px-6 py-3 text-gray-600">{r.week2Amount ?? "—"}</td>
                      <td className="px-6 py-3 text-gray-600">{r.week3Amount ?? "—"}</td>
                      <td className="px-6 py-3 text-gray-600">{r.week4Amount ?? "—"}</td>
                      <td className="px-6 py-3 text-gray-600">{r.monthlyAmount ?? "—"}</td>
                      <td className="px-6 py-3 font-semibold text-purple-600">
                        GHS {total.toFixed(2)}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          r.isSigned ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {r.isSigned ? "✓ Signed" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {titheRecords.length === 0 && (
                  <tr><td colSpan={8} className="px-6 py-6 text-center text-gray-400">No tithe records</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Welfare History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-700">🏥 Welfare History</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Month</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Paid</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Required</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {welfareContributions.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-700 font-medium">
                      {MONTHS[c.month - 1]} {c.year}
                    </td>
                    <td className="px-6 py-3 text-green-600 font-semibold">
                      GHS {c.totalPaid.toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      GHS {c.requiredAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        c.isSigned
                          ? "bg-green-100 text-green-700"
                          : c.totalPaid >= c.requiredAmount
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-500"
                      }`}>
                        {c.isSigned ? "✓ Signed" : c.totalPaid >= c.requiredAmount ? "Pending Sign Off" : "Partial"}
                      </span>
                    </td>
                  </tr>
                ))}
                {welfareContributions.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-6 text-center text-gray-400">No welfare records</td></tr>
                )}
              </tbody>
            </table>

            {/* Welfare Requests */}
            {welfareRequests.length > 0 && (
              <>
                <div className="px-6 py-3 border-t border-b bg-gray-50">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Welfare Requests</p>
                </div>
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">Type</th>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">Amount</th>
                      <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {welfareRequests.map((r) => (
                      <tr key={r.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-3 text-gray-700 capitalize">
                          {r.type.replace(/_/g, " ")}
                        </td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            r.status === "approved" ? "bg-green-100 text-green-700" :
                            r.status === "rejected" ? "bg-red-100 text-red-500" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gray-600">
                          {r.payout ? `GHS ${r.payout.amount.toFixed(2)}` : r.approvedAmount ? `GHS ${r.approvedAmount.toFixed(2)}` : "—"}
                        </td>
                        <td className="px-6 py-3 text-gray-500">{formatDate(r.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>

          {/* Contributions History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-700">💰 Contributions History</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Type</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Amount</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Method</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-700">{c.contributionType.name}</td>
                    <td className="px-6 py-3 font-semibold text-green-600">GHS {c.amount.toFixed(2)}</td>
                    <td className="px-6 py-3 text-gray-500 capitalize">{c.paymentMethod}</td>
                    <td className="px-6 py-3 text-gray-500">{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
                {contributions.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-6 text-center text-gray-400">No contributions</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* SMS History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-700">📱 SMS History</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Type</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Message</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {smsLogs.map((s) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        s.type === "birthday" ? "bg-blue-100 text-blue-700" :
                        s.type === "tithe_reminder" ? "bg-purple-100 text-purple-700" :
                        s.type === "welfare_reminder" ? "bg-orange-100 text-orange-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {s.type === "birthday" ? "🎂 Birthday" :
                         s.type === "tithe_reminder" ? "📖 Tithe" :
                         s.type === "welfare_reminder" ? "🏥 Welfare" :
                         "📢 Bulk"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600 max-w-xs truncate">{s.message}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        s.status === "sent" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"
                      }`}>
                        {s.status === "sent" ? "✓ Sent" : "✗ Failed"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500 text-xs">{formatDate(s.sentAt)}</td>
                  </tr>
                ))}
                {smsLogs.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-6 text-center text-gray-400">No SMS history</td></tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  )
}