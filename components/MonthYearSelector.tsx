"use client"

import { useRouter } from "next/navigation"

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
]

export default function MonthYearSelector({
  month,
  year,
  basePath = "/dashboard/tithe",
}: {
  month: number
  year: number
  basePath?: string
}) {
  const router = useRouter()

  function handleChange(newMonth: number, newYear: number) {
    router.push(`${basePath}?month=${newMonth}&year=${newYear}`)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 mb-6 flex gap-4">
      <div>
        <label className="block text-xs text-gray-500 mb-1">Month</label>
        <select
          value={month}
          onChange={(e) => handleChange(parseInt(e.target.value), year)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">Year</label>
        <select
          value={year}
          onChange={(e) => handleChange(month, parseInt(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[2023, 2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  )
}