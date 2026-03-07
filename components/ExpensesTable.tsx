"use client"

import { useState } from "react"
import { deleteExpense } from "@/actions/expenses"

type Expense = {
  id: string
  title: string
  category: string
  amount: number
  description: string | null
  createdAt: Date
}

export default function ExpensesTable({
  expenses,
}: {
  expenses: Expense[]
}) {
  const [localExpenses, setLocalExpenses] = useState(expenses)
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState("")

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this expense?")) return

    setLoading(id)
    const result = await deleteExpense(id)
    setLoading(null)

    if (result.error) {
      setMessage(`Error: ${result.error}`)
    } else {
      setLocalExpenses(localExpenses.filter((e) => e.id !== id))
      setMessage("Expense deleted.")
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
              <th className="text-left px-6 py-3 text-gray-600 font-medium">Title</th>
              <th className="text-left px-6 py-3 text-gray-600 font-medium">Category</th>
              <th className="text-left px-6 py-3 text-gray-600 font-medium">Amount</th>
              <th className="text-left px-6 py-3 text-gray-600 font-medium">Description</th>
              <th className="text-left px-6 py-3 text-gray-600 font-medium">Date</th>
              <th className="text-left px-6 py-3 text-gray-600 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {localExpenses.map((e) => (
              <tr key={e.id} className="border-b hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-800">{e.title}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {e.category}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-red-500">
                  GHS {e.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-gray-400 text-xs max-w-xs truncate">
                  {e.description ?? "—"}
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(e.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(e.id)}
                    disabled={loading === e.id}
                    className="text-red-400 hover:text-red-600 text-xs font-medium transition disabled:opacity-50"
                  >
                    {loading === e.id ? "..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {localExpenses.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            No expenses recorded for this month.
          </div>
        )}
      </div>
    </div>
  )
}
