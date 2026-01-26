export function inviteEmailTemplate({ inviteLink, name, appName, expiresAt }) {
  const expiryDate = new Date(expiresAt).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">${appName}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #18181b; font-size: 20px; font-weight: 600;">Hi ${name},</h2>
              <p style="margin: 0 0 24px; color: #52525b; font-size: 15px; line-height: 1.6;">
                You've been invited to join <strong>${appName}</strong>. Click the button below to create your account and get started.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <a href="${inviteLink}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 8px; color: #71717a; font-size: 13px;">
                This invitation expires on <strong>${expiryDate}</strong>.
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #fafafa; padding: 24px 40px; text-align: center; border-top: 1px solid #f4f4f5;">
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
