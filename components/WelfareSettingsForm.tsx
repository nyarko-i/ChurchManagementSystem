"use client"

import { useState } from "react"
import { saveWelfareSettings } from "@/actions/welfare"

type Settings = {
  amount: number
  effectiveYear: number
} | null

export default function WelfareSettingsForm({
  settings,
}: {
  settings: Settings
}) {
  const [amount, setAmount] = useState(settings?.amount?.toString() ?? "")
  const [effectiveYear, setEffectiveYear] = useState(
    settings?.effectiveYear?.toString() ?? new Date().getFullYear().toString()
  )
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function handleSave() {
    const parsedAmount = parseFloat(amount)
    if (!parsedAmount || parsedAmount <= 0) {
      setMessage("Please enter a valid amount")
      return
    }
    setLoading(true)
    setMessage("")
    const result = await saveWelfareSettings(parsedAmount, parseInt(effectiveYear))
    setLoading(false)
    if (result.error) {
      setMessage(`Error: ${result.error}`)
    } else {
      setMessage("Settings saved successfully!")
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 max-w-md border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        Welfare Contribution Settings
      </h3>

      {message && (
        <div className={`p-3 rounded-lg mb-4 text-sm ${
          message.startsWith("Error")
            ? "bg-red-50 text-red-600"
            : "bg-green-50 text-green-600"
        }`}>
          {message}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Monthly Amount (GHS)
        </label>
        <input
          type="number"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 10"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        />
        <p className="text-xs text-gray-400 mt-1">
          Fixed amount every member pays monthly
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Effective Year
        </label>
        <select
          value={effectiveYear}
          onChange={(e) => setEffectiveYear(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 transition disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Settings"}
      </button>
    </div>
  )
}