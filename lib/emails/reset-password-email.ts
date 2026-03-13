export function resetPasswordEmailHtml({
  adminName,
  resetUrl,
  expiresIn = "1 hour",
}: {
  adminName: string
  resetUrl: string
  expiresIn?: string
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:#0B1B35;padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:1.8rem;font-weight:800;letter-spacing:-0.5px;">
                Church<span style="color:#C9A84C;">Core</span>
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.5);font-size:0.85rem;">
                Password Reset Request
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;color:#111827;font-size:1.3rem;font-weight:700;">
                Reset your password
              </h2>
              <p style="margin:0 0 24px;color:#6b7280;font-size:0.95rem;line-height:1.6;">
                Hi ${adminName}, we received a request to reset the password for your ChurchCore account. 
                Click the button below to choose a new password.
              </p>

              <!-- CTA Button -->
              <div style="text-align:center;margin-bottom:28px;">
                <a href="${resetUrl}"
                   style="display:inline-block;background:#0B1B35;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:0.95rem;font-weight:700;letter-spacing:0.3px;">
                  Reset My Password →
                </a>
              </div>

              <!-- Expiry Warning -->
              <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:14px 18px;margin-bottom:28px;">
                <p style="margin:0;color:#92400e;font-size:0.85rem;">
                  ⏰ This link expires in <strong>${expiresIn}</strong>. If it has expired, request a new one from the login page.
                </p>
              </div>

              <!-- Security Notice -->
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px 18px;margin-bottom:28px;">
                <p style="margin:0;color:#6b7280;font-size:0.85rem;line-height:1.6;">
                  🔒 <strong>Didn't request this?</strong> You can safely ignore this email. Your password will not be changed unless you click the link above.
                </p>
              </div>

              <!-- Fallback URL -->
              <p style="margin:0;color:#9ca3af;font-size:0.8rem;line-height:1.6;">
                If the button doesn't work, copy and paste this link into your browser:
                <br/>
                <a href="${resetUrl}" style="color:#0B1B35;word-break:break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:0.78rem;">
                © ${new Date().getFullYear()} ChurchCore. All rights reserved.
              </p>
              <p style="margin:6px 0 0;color:#9ca3af;font-size:0.78rem;">
                If you did not request a password reset, please secure your account immediately.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}