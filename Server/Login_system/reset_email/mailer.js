import { Resend } from "resend";
import { config } from "dotenv";

config();

const resend = new Resend(process.env.RESEND_API_KEY);

// We export a default object with a 'sendMail' method
// This makes it compatible with your existing code
const transporter = {
  sendMail: async ({ from, to, subject, html }) => {
    try {
      const { data, error } = await resend.emails.send({
        // Fallback to info@zafir.be if APP_NAME/RESET_EMAIL_USER is missing
        from: from || "ZAFIR TOTAAL PROJECTEN <info@zafir.be>",
        to: [to],
        subject: subject,
        html: html,
      });

      if (error) {
        console.error("❌ Resend Error:", error);
        throw error;
      }

      console.log("✅ Email sent via Resend:", data.id);
      return data;
    } catch (err) {
      console.error("❌ Resend Critical Failure:", err);
      throw err;
    }
  }
};

export default transporter;
