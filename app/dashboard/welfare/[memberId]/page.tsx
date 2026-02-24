"use client"

import { useState, useEffect, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { saveWelfareRecord, signOffWelfare, bulkPayWelfare } from "@/actions/welfare"

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
]

export default function WelfareBookPage({
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
  const [requiredAmount, setRequiredAmount] = useState(0)
  const [isSigned, setIsSigned] = useState(false)

  // Bulk pay state
  const [showBulk, setShowBulk] = useState(false)
  const [bulkMonths, setBulkMonths] = useState<number>(1)
  const [bulkPaymentMethod, setBulkPaymentMethod] = useState("cash")

  const [form, setForm] = useState({
    week1Amount: "",
    week2Amount: "",
    week3Amount: "",
    week4Amount: "",
    monthlyAmount: "",
    paymentMethod: "cash",
  })

  useEffect(() => {
    fetch(`/api/welfare/${memberId}?month=${month}&year=${year}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.member) {
          setMemberName(`${data.member.firstName} ${data.member.lastName}`)
        }
        if (data.settings) {
          setRequiredAmount(data.settings.amount)
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

  const isFullyPaid = requiredAmount > 0 && total >= requiredAmount

  async function handleSave() {
    setLoading(true)
    setError("")
    setSuccess("")

    const result = await saveWelfareRecord({
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
      setSuccess("Welfare record saved!")
    }
  }

  async function handleSignOff() {
    if (!confirm("Sign off this month? This cannot be undone.")) return

    setLoading(true)
    const result = await signOffWelfare(memberId, month, year)
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setIsSigned(true)
      setSuccess("Signed off successfully!")
    }
  }

  async function handleBulkPay() {
    if (bulkMonths < 1) return

    // Generate list of months starting from current
    const monthsList: { month: number; year: number }[] = []
    let m = month
    let y = year
    for (let i = 0; i < bulkMonths; i++) {
      monthsList.push({ month: m, year: y })
      m++
      if (m > 12) { m = 1; y++ }
    }

    setLoading(true)
    setError("")

    const result = await bulkPayWelfare({
      memberId,
      months: monthsList,
      paymentMethod: bulkPaymentMethod,
    })

    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(`${bulkMonths} month(s) paid and signed off successfully!`)
      setShowBulk(false)
      setTimeout(() => router.push("/dashboard/welfare"), 1500)
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
            ← Back to Welfare
          </button>
          <h2 className="text-2xl font-bold text-gray-800">{memberName}</h2>
          <p className="text-gray-500 mt-1">
            Welfare — {MONTHS[month - 1]} {year} | Required: GHS {requiredAmount.toFixed(2)}
          </p>
        </div>

        <div className="flex gap-3">
          {isSigned && (
            <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-700">
              ✓ Signed Off
            </span>
          )}
          <button
            onClick={() => setShowBulk(!showBulk)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition"
          >
            Pay Multiple Months
          </button>
        </div>
      </div>

      {/* Bulk Pay Panel */}
      {showBulk && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-purple-800 mb-4">
            Pay Multiple Months at Once
          </h3>
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Number of Months
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={bulkMonths}
                onChange={(e) => setBulkMonths(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 w-24"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Payment Method
              </label>
              <select
                value={bulkPaymentMethod}
                onChange={(e) => setBulkPaymentMethod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900"
              >
                <option value="cash">Cash</option>
                <option value="momo">MoMo</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Amount</p>
              <p className="text-lg font-bold text-purple-700">
                GHS {(requiredAmount * bulkMonths).toFixed(2)}
              </p>
            </div>
            <button
              onClick={handleBulkPay}
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-50"
            >
              {loading ? "Processing..." : "Confirm Payment"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-8 max-w-2xl border border-gray-100">

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-6 text-sm">{success}</div>
        )}
        {isSigned && (
          <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg mb-6 text-sm">
            ⚠️ This record has been signed off and cannot be edited.
          </div>
        )}

        {/* Weekly Payments */}
        <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Weekly Payments
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

        {/* Monthly One-shot */}
        <p className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Monthly Payment (One-shot)
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
        <div className={`rounded-lg p-4 mb-6 ${
          isFullyPaid ? "bg-green-50" : "bg-blue-50"
        }`}>
          <p className="text-sm text-gray-600">
            Total Paid / Required
          </p>
          <p className={`text-2xl font-bold mt-1 ${
            isFullyPaid ? "text-green-600" : "text-blue-700"
          }`}>
            GHS {total.toFixed(2)} / GHS {requiredAmount.toFixed(2)}
          </p>
          {isFullyPaid && (
            <p className="text-xs text-green-600 mt-1">✓ Fully paid for this month</p>
          )}
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
              disabled={loading || !isFullyPaid}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              Sign Off Month
            </button>
          </div>
        )}

        {!isSigned && !isFullyPaid && total > 0 && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            GHS {(requiredAmount - total).toFixed(2)} remaining to complete payment
          </p>
        )}

      </div>
    </div>
  )
}