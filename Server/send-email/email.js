// email.js (type: module)
import nodemailer from "nodemailer";
import { config } from "dotenv"
config()

export async function sendInvoiceEmail({ to, issuer, amount, includesBtw, invoiceDate }) {
  const transporter = nodemailer.createTransport({
    service: "smtp.bookmyname.com",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS 
    }
  });

  const formattedAmount = `€${parseFloat(amount).toFixed(2)} ${includesBtw ? "(BTW included)" : "(BTW excluded)"}`;
  const formattedDate = new Date(invoiceDate).toLocaleDateString();

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <div style="background-color: #004b6b; padding: 20px; color: white;">
        <h2 style="margin: 0;">Zafir Total Projects</h2>
        <p style="margin: 0;">Lamorinierestraat 220, 2018 Antwerpen</p>
      </div>

      <div style="padding: 20px;">
        <p>Dear Bookkeeper,</p>
        <p>The following invoice has been received:</p>
        <ul style="list-style: none; padding-left: 0;">
          <li><strong>Issuer:</strong> ${issuer}</li>
          <li><strong>Date:</strong> ${formattedDate}</li>
          <li><strong>Total Amount:</strong> ${formattedAmount}</li>
        </ul>

        <p>Please process accordingly. For any questions, feel free to reach out to us.</p>

        <p style="margin-top: 40px;">Met vriendelijke groeten,<br><strong>Simcha Justman</strong><br>For Zafir Total Projects</p>
      </div>

      <footer style="background-color: #f0f0f0; padding: 15px; font-size: 12px; text-align: center; color: #777;">
        © ${new Date().getFullYear()} Zafir Total Projects — All rights reserved.
      </footer>
    </div>
  `;

  const mailOptions = {
    from: '"Zafir Total Projects" <your_email@gmail.com>',
    to,
    subject: "Invoice Notification from Zafir Total Projects",
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return true;
  } catch (error) {
    console.error("❌ Email failed:", error);
    throw error;
  }
}

sendInvoiceEmail({ to: "bunim175@gmail.com", issuer: "Notake",amount: 3347898,includesBtw: 1,invoiceDate: "30/06/2025" })

//export default sendInvoiceEmail({ to, issuer, amount, includesBtw, invoiceDate })