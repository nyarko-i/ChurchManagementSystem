"use client"

import { useState } from "react"
import { updateWelfareRequest, recordWelfarePayout } from "@/actions/welfare"

const WELFARE_TYPES: Record<string, string> = {
  bereavement_parent: "🪦 Bereavement (Parent)",
  bereavement_child: "🪦 Bereavement (Child)",
  childbirth: "👶 Childbirth",
  marriage: "💍 Marriage",
}

type Request = {
  id: string
  type: string
  description: string
  status: string
  approvedAmount: number | null
  approvedAt: Date | null
  createdAt: Date
  member: {
    firstName: string
    lastName: string
  }
  payout?: { amount: number } | null
}

export default function WelfareRequestsTable({
  requests,
}: {
  requests: Request[]
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const [approvedAmounts, setApprovedAmounts] = useState<Record<string, string>>({})
  const [message, setMessage] = useState("")

  async function handleApprove(requestId: string) {
    const amount = parseFloat(approvedAmounts[requestId] ?? "0")
    if (!amount || amount <= 0) {
      setMessage("Please enter a valid amount")
      return
    }
    setLoading(requestId)
    const result = await updateWelfareRequest(requestId, "approved", amount)
    setLoading(null)
    if (result.error) {
      setMessage(`Error: ${result.error}`)
    } else {
      setMessage("Request approved!")
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  async function handleReject(requestId: string) {
    if (!confirm("Are you sure you want to reject this request?")) return
    setLoading(requestId)
    const result = await updateWelfareRequest(requestId, "rejected")
    setLoading(null)
    if (result.error) {
      setMessage(`Error: ${result.error}`)
    } else {
      setMessage("Request rejected.")
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  async function handlePayout(requestId: string, amount: number) {
    if (!confirm(`Record payout of GHS ${amount}?`)) return
    setLoading(requestId)
    const result = await recordWelfarePayout(requestId, amount)
    setLoading(null)
    if (result.error) {
      setMessage(`Error: ${result.error}`)
    } else {
      setMessage("Payout recorded!")
      setTimeout(() => window.location.reload(), 1000)
    }
  }

  return (
    <div>
      {message && (
        <div className={`p-3 rounded-lg mb-4 text-sm ${
          message.startsWith("Error")
            ? "bg-red-50 text-red-600"
            : "bg-green-50 text-green-600"
        }`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-gray-600 font-medium">Member</th>
              <th className="text-left px-6 py-3 text-gray-600 font-medium">Type</th>
              <th className="text-left px-6 py-3 text-gray-600 font-medium">Description</th>
              <th className="text-left px-6 py-3 text-gray-600 font-medium">Status</th>
              <th className="text-left px-6 py-3 text-gray-600 font-medium">Amount</th>
              <th className="text-left px-6 py-3 text-gray-600 font-medium">Date</th>
              <th className="text-left px-6 py-3 text-gray-600 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-b hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-800">
                  {request.member.firstName} {request.member.lastName}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {WELFARE_TYPES[request.type] ?? request.type}
                </td>
                <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                  {request.description}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    request.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : request.status === "rejected"
                      ? "bg-red-100 text-red-500"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {request.approvedAmount ? `GHS ${request.approvedAmount}` : "—"}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(request.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  {request.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Amount"
                        value={approvedAmounts[request.id] ?? ""}
                        onChange={(e) =>
                          setApprovedAmounts({
                            ...approvedAmounts,
                            [request.id]: e.target.value,
                          })
                        }
                        className="border border-gray-300 rounded px-2 py-1 text-xs w-24 text-gray-900"
                      />
                      <button
                        onClick={() => handleApprove(request.id)}
                        disabled={loading === request.id}
                        className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        disabled={loading === request.id}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {request.status === "approved" && !request.payout && (
                    <button
                      onClick={() => handlePayout(request.id, request.approvedAmount!)}
                      disabled={loading === request.id}
                      className="bg-blue-700 text-white px-3 py-1 rounded text-xs hover:bg-blue-800 transition disabled:opacity-50"
                    >
                      Record Payout
                    </button>
                  )}
                  {request.payout && (
                    <span className="text-xs text-green-600 font-medium">✓ Paid Out</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {requests.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            No welfare requests yet.
          </div>
        )}
      </div>
    </div>
  )
}