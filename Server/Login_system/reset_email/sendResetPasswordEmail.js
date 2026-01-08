import transporter from "./mailer.js";
import { resetPasswordTemplate } from "./resetPasswordTemplate.js";

export async function sendResetPasswordEmail({ email, resetToken }) {
    
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const html = resetPasswordTemplate({
    resetLink,
    appName: process.env.APP_NAME,
  });

  await transporter.sendMail({
    from: `"${process.env.APP_NAME}" <${process.env.RESET_EMAIL_USER}>`,
    to: email,
    subject: "Reset your password",
    html,
  });
}