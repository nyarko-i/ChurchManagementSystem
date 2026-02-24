"use client"

import { useState, useEffect, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { saveTitheRecord, signOffTithe } from "@/actions/tithe"

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
]

export default function TitheBookPage({
  params,
}: {
  params: Promise<{ memberId: string }>
}) {
  const { memberId } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()

  const now = new Date()
  const month = parseInt(searchParams.get("month") ?? String(now.getMonth() + 1))
  const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()))

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [memberName, setMemberName] = useState("")
  const [isSigned, setIsSigned] = useState(false)

  const [form, setForm] = useState({
    week1Amount: "",
    week2Amount: "",
    week3Amount: "",
    week4Amount: "",
    monthlyAmount: "",
    paymentMethod: "cash",
  })

  useEffect(() => {
    fetch(`/api/tithe/${memberId}?month=${month}&year=${year}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.member) {
          setMemberName(`${data.member.firstName} ${data.member.lastName}`)
        }
        if (data.record) {
          setForm({
            week1Amount: data.record.week1Amount ?? "",
            week2Amount: data.record.week2Amount ?? "",
            week3Amount: data.record.week3Amount ?? "",
            week4Amount: data.record.week4Amount ?? "",
            monthlyAmount: data.record.monthlyAmount ?? "",
            paymentMethod: data.record.paymentMethod ?? "cash",
          })
          setIsSigned(data.record.isSigned ?? false)
        }
        setFetching(false)
      })
  }, [memberId, month, year])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const total =
    (parseFloat(form.week1Amount) || 0) +
    (parseFloat(form.week2Amount) || 0) +
    (parseFloat(form.week3Amount) || 0) +
    (parseFloat(form.week4Amount) || 0) +
    (parseFloat(form.monthlyAmount) || 0)

  async function handleSave() {
    setLoading(true)
    setError("")
    setSuccess("")

    const result = await saveTitheRecord({
      memberId,
      month,
      year,
      week1Amount: form.week1Amount ? parseFloat(form.week1Amount) : null,
      week2Amount: form.week2Amount ? parseFloat(form.week2Amount) : null,
      week3Amount: form.week3Amount ? parseFloat(form.week3Amount) : null,
      week4Amount: form.week4Amount ? parseFloat(form.week4Amount) : null,
      monthlyAmount: form.monthlyAmount ? parseFloat(form.monthlyAmount) : null,
      paymentMethod: form.paymentMethod,
    })

    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess("Tithe record saved successfully!")
    }
  }

  async function handleSignOff() {
    if (!confirm("Are you sure you want to sign off this month? This cannot be undone.")) return

    setLoading(true)
    setError("")

    const result = await signOffTithe(memberId, month, year)
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setIsSigned(true)
      setSuccess("Tithe record signed off successfully!")
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <button
            onClick={() => router.back()}
            className="text-sm text-blue-600 hover:underline mb-2 inline-block"
          >
            ← Back to Tithe Records
          </button>
          <h2 className="text-2xl font-bold text-gray-800">{memberName}</h2>
          <p className="text-gray-500 mt-1">
            Tithe Book — {MONTHS[month - 1]} {year}
          </p>
        </div>

        {isSigned && (
          <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-700">
            ✓ Signed Off
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 max-w-2xl border border-gray-100">

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-6 text-sm">
            {success}
          </div>
        )}

        {isSigned && (
          <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg mb-6 text-sm">
            ⚠️ This record has been signed off and cannot be edited.
          </div>
        )}

        {/* Weekly Tithe */}
        <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Weekly Tithe
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {["week1Amount", "week2Amount", "week3Amount", "week4Amount"].map(
            (week, i) => (
              <div key={week}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Week {i + 1} (GHS)
                </label>
                <input
                  name={week}
                  type="number"
                  min="0"
                  value={form[week as keyof typeof form]}
                  onChange={handleChange}
                  disabled={isSigned}
                  placeholder="0.00"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            )
          )}
        </div>

        {/* Monthly Option */}
        <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Monthly Tithe (One-time payment)
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (GHS)
          </label>
          <input
            name="monthlyAmount"
            type="number"
            min="0"
            value={form.monthlyAmount}
            onChange={handleChange}
            disabled={isSigned}
            placeholder="0.00"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Method
          </label>
          <select
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
            disabled={isSigned}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-50"
          >
            <option value="cash">Cash</option>
            <option value="momo">MoMo</option>
          </select>
        </div>

        {/* Total */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">Total Tithe for {MONTHS[month - 1]}</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">GHS {total.toFixed(2)}</p>
        </div>

        {/* Buttons */}
        {!isSigned && (
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Record"}
            </button>
            <button
              onClick={handleSignOff}
              disabled={loading || total === 0}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              Sign Off Month
            </button>
          </div>
        )}

      </div>
    </div>
  )
}