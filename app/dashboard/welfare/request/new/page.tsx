"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { fileWelfareRequest } from "@/actions/welfare"

const WELFARE_TYPES = [
  { value: "bereavement_parent", label: "🪦 Bereavement (Parent)" },
  { value: "bereavement_child", label: "🪦 Bereavement (Child)" },
  { value: "childbirth", label: "👶 Childbirth" },
  { value: "marriage", label: "💍 Marriage" },
]

type Member = {
  id: string
  firstName: string
  lastName: string
  memberNumber: string
}

export default function NewWelfareRequestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [error, setError] = useState("")
  const [warning, setWarning] = useState("")

  const [form, setForm] = useState({
    memberId: "",
    type: "",
    description: "",
  })

  useEffect(() => {
    fetch("/api/members")
      .then((res) => res.json())
      .then((data) => setMembers(data))
  }, [])



  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit() {
    if (!form.memberId || !form.type || !form.description) {
      setError("All fields are required")
      return
    }

    setLoading(true)
    setError("")
    setWarning("")

    const result = await fileWelfareRequest(form)
    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      if (result.unpaidMonths && result.unpaidMonths > 0) {
        setWarning(
          `⚠️ Note: This member has ${result.unpaidMonths} unsigned welfare month(s). Please review before approving.`
        )
        setTimeout(
          () => router.push("/dashboard/welfare?tab=requests"),
          3000
        )
      } else {
        router.push("/dashboard/welfare?tab=requests")
      }
    }
  }

  return (
    <div>
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-sm text-blue-600 hover:underline mb-2 inline-block"
        >
          ← Back to Welfare
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          File Welfare Request
        </h2>
        <p className="text-gray-500 mt-1">
          Fill in the details to file a welfare request for a member
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 max-w-lg border border-gray-100">

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {warning && (
          <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg mb-4 text-sm">
            {warning}
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
            Request Type
          </label>
          <select
            name="type"
            value={form.type}
            onChange={handleSelectChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="">Select type</option>
            {WELFARE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleTextareaChange}
            placeholder="Brief description of the request..."
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 transition disabled:opacity-50"
          >
            {loading ? "Filing..." : "File Request"}
          </button>
          <button
            onClick={() => router.back()}
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  )
}