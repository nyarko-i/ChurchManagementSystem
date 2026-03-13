"use server"

import { sendEmail } from "@/lib/email"

const ADMIN_EMAIL = process.env.SUPER_ADMIN_NOTIFY_EMAIL ?? "kxerxes87@gmail.com"
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

export async function registerChurch(data: {
  churchName: string
  churchEmail: string
  churchPhone: string
  adminName: string
  adminEmail: string
  password: string
}) {
  // Basic validation
  if (!data.churchName || !data.adminName || !data.adminEmail || !data.churchEmail) {
    return { error: "Please fill in all required fields" }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.adminEmail)) {
    return { error: "Please enter a valid email address" }
  }

  // Notify super admin by email
  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `New Church Registration Request — ${data.churchName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8" /></head>
      <body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:#0B1B35;padding:32px 40px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:1.6rem;font-weight:800;">
                      Church<span style="color:#C9A84C;">Core</span>
                    </h1>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.5);font-size:0.85rem;">
                      New Registration Request
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:36px 40px;">
                    <h2 style="margin:0 0 20px;color:#111827;font-size:1.2rem;">
                      A new church wants to join ChurchCore
                    </h2>

                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin-bottom:24px;">
                      <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
                        <span style="color:#6b7280;font-size:0.8rem;">Church Name</span><br/>
                        <strong style="color:#111827;">${data.churchName}</strong>
                      </td></tr>
                      <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
                        <span style="color:#6b7280;font-size:0.8rem;">Church Email</span><br/>
                        <strong style="color:#111827;">${data.churchEmail}</strong>
                      </td></tr>
                      <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
                        <span style="color:#6b7280;font-size:0.8rem;">Church Phone</span><br/>
                        <strong style="color:#111827;">${data.churchPhone || "Not provided"}</strong>
                      </td></tr>
                      <tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
                        <span style="color:#6b7280;font-size:0.8rem;">Admin Name</span><br/>
                        <strong style="color:#111827;">${data.adminName}</strong>
                      </td></tr>
                      <tr><td style="padding:8px 0;">
                        <span style="color:#6b7280;font-size:0.8rem;">Admin Email</span><br/>
                        <strong style="color:#111827;">${data.adminEmail}</strong>
                      </td></tr>
                    </table>

                    <div style="text-align:center;">
                      <a href="${BASE_URL}/admin"
                         style="display:inline-block;background:#C9A84C;color:#0B1B35;text-decoration:none;padding:13px 32px;border-radius:8px;font-size:0.95rem;font-weight:700;">
                        Review in Admin Panel →
                      </a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
                    <p style="margin:0;color:#9ca3af;font-size:0.78rem;">
                      © ${new Date().getFullYear()} ChurchCore Admin Notifications
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  })

  return { success: true }
}