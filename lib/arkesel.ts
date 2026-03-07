const ARKESEL_API_KEY = process.env.ARKESEL_API_KEY ?? ""
const ARKESEL_SENDER = process.env.ARKESEL_SENDER_ID ?? "ChurchCore"
const ARKESEL_BASE_URL = "https://sms.arkesel.com/api/v2/sms/send"

export type SmsSendResult = {
  success: boolean
  message: string
}

export async function sendSms(
  to: string,
  message: string
): Promise<SmsSendResult> {
  if (!ARKESEL_API_KEY) {
    console.warn("ARKESEL_API_KEY not set — SMS not sent")
    return { success: false, message: "API key not configured" }
  }

  // Normalize phone number to international format for Ghana
  const phone = normalizePhone(to)
  if (!phone) {
    return { success: false, message: "Invalid phone number" }
  }

  try {
    const res = await fetch(ARKESEL_BASE_URL, {
      method: "POST",
      headers: {
        "api-key": ARKESEL_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: ARKESEL_SENDER,
        message,
        recipients: [phone],
      }),
    })

    const data = await res.json()

    if (res.ok && data.status === "success") {
      return { success: true, message: "SMS sent successfully" }
    }

    return {
      success: false,
      message: data.message ?? "Failed to send SMS",
    }
  } catch (error) {
    console.error("Arkesel SMS error:", error)
    return { success: false, message: "Network error sending SMS" }
  }
}

export async function sendBulkSms(
  recipients: { phone: string; name?: string }[],
  message: string
): Promise<{ sent: number; failed: number }> {
  const phones = recipients
    .map((r) => normalizePhone(r.phone))
    .filter(Boolean) as string[]

  if (!ARKESEL_API_KEY || phones.length === 0) {
    return { sent: 0, failed: recipients.length }
  }

  try {
    const res = await fetch(ARKESEL_BASE_URL, {
      method: "POST",
      headers: {
        "api-key": ARKESEL_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: ARKESEL_SENDER,
        message,
        recipients: phones,
      }),
    })

    const data = await res.json()

    if (res.ok && data.status === "success") {
      return { sent: phones.length, failed: 0 }
    }

    return { sent: 0, failed: phones.length }
  } catch (error) {
    console.error("Arkesel bulk SMS error:", error)
    return { sent: 0, failed: phones.length }
  }
}

function normalizePhone(phone: string): string | null {
  if (!phone) return null
  // Remove spaces, dashes, brackets
  let cleaned = phone.replace(/[\s\-()]/g, "")
  // Ghana numbers: starts with 0 → replace with +233
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    cleaned = "+233" + cleaned.slice(1)
  }
  // Already has country code
  if (cleaned.startsWith("+")) return cleaned
  if (cleaned.startsWith("233")) return "+" + cleaned
  return null
}