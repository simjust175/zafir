// import transporter from "../reset_email/mailer.js";
import { Resend } from "resend"
import { inviteEmailTemplate } from "./inviteEmailTemplate.js";

// ✅ Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInviteEmail({ email, name, token, expiresAt }) {
  const inviteLink = `${process.env.FRONTEND_URL}/accept-invite?token=${token}`;
  
  const html = inviteEmailTemplate({
    inviteLink,
    name: name || email.split("@")[0],
    appName: process.env.APP_NAME || "Billio",
    expiresAt
  });

  //await transporter.sendMail({
  await resend.emails.send({
    from: `"${process.env.APP_NAME || "Billio"}" <${process.env.RESET_EMAIL_USER}>`,
    to: email,
    subject: `You're invited to join ${process.env.APP_NAME || "Billio"}`,
    html
  });
}

