"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { recordContribution } from "@/actions/contributions"

type ContributionType = {
  id: string
  name: string
  description: string | null
}

type Member = {
  id: string
  firstName: string
  lastName: string
  memberNumber: string
}

export default function RecordContributionForm({
  types,
}: {
  types: ContributionType[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [form, setForm] = useState({
    memberId: "",
    contributionTypeId: "",
    amount: "",
    paymentMethod: "cash",
  })

  useEffect(() => {
    fetch("/api/members")
      .then((res) => res.json())
      .then((data) => setMembers(data))
  }, [])

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    if (!form.memberId || !form.contributionTypeId || !form.amount) {
      setError("All fields are required")
      return
    }

    const amount = parseFloat(form.amount)
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    const result = await recordContribution({
      memberId: form.memberId,
      contributionTypeId: form.contributionTypeId,
      amount,
      paymentMethod: form.paymentMethod,
    })

    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess("Contribution recorded successfully!")
      setForm({
        memberId: "",
        contributionTypeId: "",
        amount: "",
        paymentMethod: "cash",
      })
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 max-w-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        Record Contribution
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

      {types.length === 0 && (
        <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg mb-4 text-sm">
          ⚠️ No active contribution types found. Please create one in the
          Manage Types tab first.
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Member
        </label>
        <select
          name="memberId"
          value={form.memberId}
          onChange={handleSelectChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="">Select member</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.firstName} {m.lastName} ({m.memberNumber})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contribution Type
        </label>
        <select
          name="contributionTypeId"
          value={form.contributionTypeId}
          onChange={handleSelectChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="">Select type</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
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
          Payment Method
        </label>
        <select
          name="paymentMethod"
          value={form.paymentMethod}
          onChange={handleSelectChange}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="cash">Cash</option>
          <option value="momo">MoMo</option>
        </select>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleSubmit}
          disabled={loading || types.length === 0}
          className="flex-1 bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 transition disabled:opacity-50"
        >
          {loading ? "Recording..." : "Record Contribution"}
        </button>
        <button
          onClick={() => router.push("/dashboard/contributions")}
          className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}