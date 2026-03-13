export function welcomeEmailHtml({
  churchName,
  adminName,
  email,
  password,
  loginUrl,
}: {
  churchName: string
  adminName: string
  email: string
  password: string
  loginUrl: string
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to ChurchCore</title>
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
                Church Management System
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;color:#111827;font-size:1.3rem;font-weight:700;">
                Welcome to ChurchCore, ${adminName}! 🎉
              </h2>
              <p style="margin:0 0 24px;color:#6b7280;font-size:0.95rem;line-height:1.6;">
                Your church <strong style="color:#111827;">${churchName}</strong> has been successfully set up on ChurchCore. 
                You can now manage your members, finances, tithe, welfare, and more — all in one place.
              </p>

              <!-- Credentials Box -->
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:24px;margin-bottom:28px;">
                <p style="margin:0 0 16px;color:#374151;font-size:0.85rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
                  Your Login Credentials
                </p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
                      <span style="color:#6b7280;font-size:0.85rem;">Email</span>
                      <br/>
                      <strong style="color:#111827;font-size:0.95rem;">${email}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;">
                      <span style="color:#6b7280;font-size:0.85rem;">Temporary Password</span>
                      <br/>
                      <strong style="color:#111827;font-size:0.95rem;font-family:monospace;background:#e5e7eb;padding:2px 8px;border-radius:4px;">${password}</strong>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Warning -->
              <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:14px 18px;margin-bottom:28px;">
                <p style="margin:0;color:#92400e;font-size:0.85rem;">
                  ⚠️ <strong>Important:</strong> Please change your password immediately after your first login.
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center;margin-bottom:28px;">
                <a href="${loginUrl}" 
                   style="display:inline-block;background:#0B1B35;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:0.95rem;font-weight:700;letter-spacing:0.3px;">
                  Log In to ChurchCore →
                </a>
              </div>

              <p style="margin:0;color:#9ca3af;font-size:0.82rem;line-height:1.6;text-align:center;">
                If you have any issues logging in, reply to this email and we'll help you out.
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
                This email was sent to ${email} because your church was registered on ChurchCore.
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