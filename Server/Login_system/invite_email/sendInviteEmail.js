import transporter from "../reset_email/mailer.js";
import { inviteEmailTemplate } from "./inviteEmailTemplate.js";

export async function sendInviteEmail({ email, name, token, expiresAt }) {
  const inviteLink = `${process.env.FRONTEND_URL}/accept-invite?token=${token}`;
  
  const html = inviteEmailTemplate({
    inviteLink,
    name: name || email.split("@")[0],
    appName: process.env.APP_NAME || "Billio",
    expiresAt
  });

  await transporter.sendMail({
    from: `"${process.env.APP_NAME || "Billio"}" <${process.env.RESET_EMAIL_USER}>`,
    to: email,
    subject: `You're invited to join ${process.env.APP_NAME || "Billio"}`,
    html
  });
}
