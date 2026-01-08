export function resetPasswordTemplate({ resetLink, appName }) {
  return `
  <!DOCTYPE html>
  <html>
    <body style="
      margin:0;
      padding:0;
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background:#f4f6f8;
    ">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:40px 0;">
            <table width="100%" max-width="480px" style="
              background:#ffffff;
              border-radius:12px;
              padding:32px;
              box-shadow:0 10px 30px rgba(0,0,0,0.08);
            ">
              <tr>
                <td style="text-align:center;">
                  <h1 style="margin:0;color:#111;">${appName}</h1>
                  <p style="color:#666;font-size:15px;">
                    Password Reset Request
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding:24px 0;color:#333;font-size:15px;">
                  We received a request to reset your password.
                  Click the button below to create a new one.
                </td>
              </tr>

              <tr>
                <td align="center">
                  <a href="${resetLink}" style="
                    display:inline-block;
                    padding:14px 28px;
                    background:#4f46e5;
                    color:#ffffff;
                    text-decoration:none;
                    border-radius:8px;
                    font-weight:600;
                  ">
                    Reset Password
                  </a>
                </td>
              </tr>

              <tr>
                <td style="padding-top:24px;font-size:13px;color:#777;">
                  This link expires in <strong>15 minutes</strong>.<br />
                  If you didn’t request this, you can safely ignore this email.
                </td>
              </tr>

              <tr>
                <td style="padding-top:32px;font-size:12px;color:#aaa;text-align:center;">
                  © ${new Date().getFullYear()} ${appName}
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