"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { recordOffering } from "@/actions/offerings"

export default function RecordOfferingForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const today = new Date().toISOString().split("T")[0]

  const [form, setForm] = useState({
    serviceDate: today,
    serviceType: "sunday",
    cashAmount: "",
    momoAmount: "",
    notes: "",
  })

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const total =
    (parseFloat(form.cashAmount) || 0) +
    (parseFloat(form.momoAmount) || 0)

  async function handleSubmit() {
    setLoading(true)
    setError("")
    setSuccess("")

    const result = await recordOffering({
      serviceDate: form.serviceDate,
      serviceType: form.serviceType,
      cashAmount: parseFloat(form.cashAmount) || 0,
      momoAmount: parseFloat(form.momoAmount) || 0,
      notes: form.notes,
    })

    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess("Offering recorded successfully!")
      setForm({
        serviceDate: today,
        serviceType: "sunday",
        cashAmount: "",
        momoAmount: "",
        notes: "",
      })
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 max-w-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        Record Offering
      </h3>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">
          {success}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Service Date
        </label>
        <input
          name="serviceDate"
          type="date"
          value={form.serviceDate}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Service Type
        </label>
        <select
          name="serviceType"
          value={form.serviceType}
          onChange={handleSelectChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="sunday">🙏 Sunday Service</option>
          <option value="midweek">📖 Midweek Service</option>
          <option value="special">⭐ Special Service</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cash Amount (GHS)
        </label>
        <input
          name="cashAmount"
          type="number"
          min="0"
          value={form.cashAmount}
          onChange={handleInputChange}
          placeholder="0.00"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          MoMo Amount (GHS)
        </label>
        <input
          name="momoAmount"
          type="number"
          min="0"
          value={form.momoAmount}
          onChange={handleInputChange}
          placeholder="0.00"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (optional)
        </label>
        <input
          name="notes"
          type="text"
          value={form.notes}
          onChange={handleInputChange}
          placeholder="e.g. Easter Sunday special offering"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
      </div>

      {/* Total */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-600">Total Offering</p>
        <p className="text-2xl font-bold text-blue-700 mt-1">
          GHS {total.toFixed(2)}
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 transition disabled:opacity-50"
        >
          {loading ? "Recording..." : "Record Offering"}
        </button>
        <button
          onClick={() => router.push("/dashboard/offerings")}
          className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
