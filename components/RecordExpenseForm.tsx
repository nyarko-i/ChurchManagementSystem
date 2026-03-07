"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { recordExpense } from "@/actions/expenses"

const CATEGORIES = [
  "Utilities",
  "Maintenance",
  "Salaries",
  "Events",
  "Stationery",
  "Transport",
  "Donations",
  "Other",
]

export default function RecordExpenseForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [form, setForm] = useState({
    title: "",
    category: "",
    amount: "",
    description: "",
  })

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    setLoading(true)
    setError("")
    setSuccess("")

    const result = await recordExpense({
      title: form.title,
      category: form.category,
      amount: parseFloat(form.amount) || 0,
      description: form.description,
    })

    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess("Expense recorded successfully!")
      setForm({ title: "", category: "", amount: "", description: "" })
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 max-w-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        Record Expense
      </h3>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">{success}</div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          name="title"
          type="text"
          value={form.title}
          onChange={handleInputChange}
          placeholder="e.g. Generator fuel"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          name="category"
          value={form.category}
          onChange={handleSelectChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="">Select category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount (GHS)
        </label>
        <input
          name="amount"
          type="number"
          min="0"
          value={form.amount}
          onChange={handleInputChange}
          placeholder="0.00"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (optional)
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleInputChange}
          placeholder="Additional details..."
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 transition disabled:opacity-50"
        >
          {loading ? "Recording..." : "Record Expense"}
        </button>
        <button
          onClick={() => router.push("/dashboard/expenses")}
          className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}