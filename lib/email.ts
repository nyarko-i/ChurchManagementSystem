import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export const FROM_EMAIL = "onboarding@resend.dev"   // chnage to domain in future 

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })

    if (error) {
      console.error("Resend error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (err) {
    console.error("Email send failed:", err)
    return { success: false, error: "Failed to send email" }
  }
}