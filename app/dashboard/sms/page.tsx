import { getSmsLogs } from "@/actions/sms"
import BulkSMSForm from "@/components/BulkSMSForm"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export default async function SmsPage() {
  const session = await auth()
  if (!session) return null
  const churchId = session.user.churchId

  const logs = await getSmsLogs()

  const members = await prisma.member.findMany({
    where: { churchId, status: "active", phone: { not: null } },
    select: { id: true, firstName: true, lastName: true, phone: true },
    orderBy: { firstName: "asc" },
  })

  const totalSent = logs.filter((l) => l.status === "sent").length
  const totalFailed = logs.filter((l) => l.status === "failed").length
  const birthdays = logs.filter((l) => l.type === "birthday").length
  const titheReminders = logs.filter((l) => l.type === "tithe_reminder").length
  const welfareReminders = logs.filter((l) => l.type === "welfare_reminder").length
  const bulkSent = logs.filter((l) => l.type === "bulk").length

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SMS Centre</h1>
        <p className="text-sm text-gray-500 mt-1">Send messages and view SMS history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Total Sent</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{totalSent}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">Failed</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{totalFailed}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">🎂 Birthdays</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{birthdays}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">📖 Tithe</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{titheReminders}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">🏥 Welfare</p>
          <p className="text-2xl font-bold text-orange-500 mt-1">{welfareReminders}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500">📢 Bulk</p>
          <p className="text-2xl font-bold text-gray-700 mt-1">{bulkSent}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Bulk SMS Form */}
        <BulkSMSForm members={members} />

        {/* Auto SMS Info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">⚙️ Automatic SMS Schedule</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <span className="text-xl">🎂</span>
              <div>
                <p className="font-medium text-gray-800 text-sm">Birthday Messages</p>
                <p className="text-xs text-gray-500">Sent every day to members celebrating their birthday</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
              <span className="text-xl">📖</span>
              <div>
                <p className="font-medium text-gray-800 text-sm">Tithe Reminders</p>
                <p className="text-xs text-gray-500">Sent every Sunday to members who have not paid tithe this month</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
              <span className="text-xl">🏥</span>
              <div>
                <p className="font-medium text-gray-800 text-sm">Welfare Reminders</p>
                <p className="text-xs text-gray-500">Sent on the 1st of every month to members with outstanding welfare balance</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 pt-2">
            ⚠️ Automatic SMS requires a valid Arkesel API key configured in your environment variables.
          </p>
        </div>
      </div>

      {/* SMS Logs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-700">SMS History (Last 100)</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Recipient</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Phone</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Type</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Message</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
              <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-700">
                  {log.recipientName ?? "—"}
                </td>
                <td className="px-6 py-3 text-gray-600">{log.recipientPhone}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    log.type === "birthday" ? "bg-blue-100 text-blue-700" :
                    log.type === "tithe_reminder" ? "bg-purple-100 text-purple-700" :
                    log.type === "welfare_reminder" ? "bg-orange-100 text-orange-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {log.type === "birthday" ? "🎂 Birthday" :
                     log.type === "tithe_reminder" ? "📖 Tithe" :
                     log.type === "welfare_reminder" ? "🏥 Welfare" :
                     "📢 Bulk"}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-600 max-w-xs truncate">{log.message}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    log.status === "sent"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-500"
                  }`}>
                    {log.status === "sent" ? "✓ Sent" : "✗ Failed"}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-500 text-xs">
                  {new Date(log.sentAt).toLocaleDateString("en-GB")}{" "}
                  {new Date(log.sentAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  No SMS history yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}