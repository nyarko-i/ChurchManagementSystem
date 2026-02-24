"use client"

//import { useState } from "react"
import Link from "next/link"

type Member = {
  id: string
  firstName: string
  lastName: string
  phone: string | null
  welfareContributions: {
    totalPaid: number
    requiredAmount: number
    isSigned: boolean
    paymentMethod: string
  }[]
}

export default function WelfareContributionsTable({
  members,
  month,
  year,
}: {
  members: Member[]
  month: number
  year: number
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left px-6 py-3 text-gray-600 font-medium">Member</th>
            <th className="text-left px-6 py-3 text-gray-600 font-medium">Phone</th>
            <th className="text-left px-6 py-3 text-gray-600 font-medium">Paid</th>
            <th className="text-left px-6 py-3 text-gray-600 font-medium">Required</th>
            <th className="text-left px-6 py-3 text-gray-600 font-medium">Status</th>
            <th className="text-left px-6 py-3 text-gray-600 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => {
            const record = member.welfareContributions[0]
            const totalPaid = record?.totalPaid ?? 0
            const required = record?.requiredAmount ?? 0
            const isSigned = record?.isSigned ?? false
            const isFullyPaid = required > 0 && totalPaid >= required

            return (
              <tr key={member.id} className="border-b hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-800">
                  {member.firstName} {member.lastName}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {member.phone ?? "—"}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {totalPaid > 0 ? `GHS ${totalPaid.toFixed(2)}` : "—"}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {required > 0 ? `GHS ${required.toFixed(2)}` : "—"}
                </td>
                <td className="px-6 py-4">
                  {isSigned ? (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      ✓ Signed
                    </span>
                  ) : isFullyPaid ? (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                      Pending Sign Off
                    </span>
                  ) : totalPaid > 0 ? (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      Partial
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-500">
                      Unpaid
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/dashboard/welfare/${member.id}?month=${month}&year=${year}`}
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
  )
}