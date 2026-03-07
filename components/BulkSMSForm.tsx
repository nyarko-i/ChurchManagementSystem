"use client"

import { useState } from "react"
import { sendBulkSmsAction } from "@/actions/sms"

type Member = {
  id: string
  firstName: string
  lastName: string
  phone: string | null
}

type Props = {
  members: Member[]
}

export default function BulkSMSForm({ members }: Props) {
  const [message, setMessage] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [sendToAll, setSendToAll] = useState(true)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const maxChars = 160
  const charsLeft = maxChars - message.length

  function toggleMember(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  async function handleSend() {
    if (!message.trim()) return
    if (!sendToAll && selectedIds.length === 0) {
      setResult({ success: false, message: "Please select at least one member" })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await sendBulkSmsAction(
        message,
        sendToAll ? undefined : selectedIds
      )
      setResult(res)
      if (res.success) setMessage("")
    } catch {
      setResult({ success: false, message: "Something went wrong" })
    }

    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
      <h3 className="text-lg font-semibold text-gray-800">📢 Send Bulk SMS</h3>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          maxLength={maxChars}
          placeholder="Type your message here..."
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <p className={`text-xs mt-1 text-right ${charsLeft < 20 ? "text-red-500" : "text-gray-400"}`}>
          {charsLeft} characters remaining
        </p>
      </div>

      {/* Recipients */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Recipients
        </label>
        <div className="flex gap-4 mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={sendToAll}
              onChange={() => setSendToAll(true)}
              className="accent-blue-700"
            />
            <span className="text-sm text-gray-700">
              All active members ({members.length})
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={!sendToAll}
              onChange={() => setSendToAll(false)}
              className="accent-blue-700"
            />
            <span className="text-sm text-gray-700">Select specific members</span>
          </label>
        </div>

        {!sendToAll && (
          <div className="border border-gray-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
            {members.map((m) => (
              <label
                key={m.id}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-0"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(m.id)}
                  onChange={() => toggleMember(m.id)}
                  className="accent-blue-700"
                />
                <span className="text-sm text-gray-700">
                  {m.firstName} {m.lastName}
                </span>
                <span className="text-xs text-gray-400 ml-auto">{m.phone}</span>
              </label>
            ))}
            {members.length === 0 && (
              <p className="px-4 py-3 text-sm text-gray-400">
                No members with phone numbers
              </p>
            )}
          </div>
        )}

        {!sendToAll && selectedIds.length > 0 && (
          <p className="text-xs text-blue-600 mt-1">
            {selectedIds.length} member{selectedIds.length > 1 ? "s" : ""} selected
          </p>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className={`rounded-lg px-4 py-3 text-sm font-medium ${
          result.success
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-600 border border-red-200"
        }`}>
          {result.success ? "✓ " : "✗ "}{result.message}
        </div>
      )}

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={loading || !message.trim()}
        className="w-full bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition disabled:opacity-50"
      >
        {loading ? "⏳ Sending..." : "📤 Send SMS"}
      </button>
    </div>
  )
}