import { Resend } from "resend";
import { config } from "dotenv";

config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendResetPasswordEmail = async (email, resetToken) => {
  try {
    const { data, error } = await resend.emails.send({
      from: RESET_EMAIL_USER ||"ZAFIR TOTAAL PROJECTEN <info@zafir.be>", // Use your verified Resend domain
      to: [email],
      subject: "Wachtwoord herstellen",
      html: `
        <h1>Wachtwoord herstellen</h1>
        <p>Klik op de onderstaande link om uw wachtwoord te resetten:</p>
        <a href="https://yourdashboard.com/reset-password?token=${resetToken}">Wachtwoord resetten</a>
      `,
    });

    if (error) {
      console.error("❌ Resend Error:", error);
      return { success: false };
    }

    console.log("✅ Reset email sent via Resend:", data.id);
    return { success: true };
  } catch (err) {
    console.error("❌ Critical Email Failure:", err);
    return { success: false };
  }
};