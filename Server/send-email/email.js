import nodemailer from "nodemailer";
import { config } from "dotenv";
import path from "path";
import { createInvoicePdf } from "./createInvoice.js";
import fs from "fs";

config();

async function sendInvoiceByEmail({
  to,
  recipient,
  projectName,
  groupedInvoices,
  groupedPayments,
  total,
  language = "nl"
}) {
  const isDutch = language === "nl";
  const formattedDate = new Date().toLocaleDateString("nl-BE");
  const formattedTotal = `€${parseFloat(total).toFixed(2)}`;

  const outputPath = path.resolve(`invoices/invoice-${Date.now()}.pdf`);
  
  await createInvoicePdf({ projectName, groupedInvoices, groupedPayments, total }, outputPath);

  const transporter = nodemailer.createTransport({
    host: "smtp.bookmyname.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

const htmlContent = `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="background-color: #18578c; color: #ffffff; padding: 20px;">
      <h2 style="margin: 0; font-size: 22px;">Zafir Totaal Projecten</h2>
      <p style="margin: 4px 0 0; font-size: 13px;">Lamorinierestraat 220, 2018 Antwerpen</p>
    </div>
    
    <!-- Accent line -->
    <div style="height: 4px; background-color: #3788bf;"></div>

    <!-- Body -->
    <div style="padding: 24px; font-size: 15px;">
      <p style="margin-top: 0;">${isDutch ? "Beste " : "Dear "}${recipient},</p>
      <p>${isDutch ? "Gelieve de bijgevoegde factuuroverzicht te verwerken." : "Please find the attached invoice summary."}</p>

      <ul style="list-style: none; padding-left: 0; line-height: 1.6;">
        <li><strong>${isDutch ? "Project" : "Project"}:</strong> ${projectName}</li>
        <li><strong>${isDutch ? "Datum" : "Date"}:</strong> ${formattedDate}</li>
        <li><strong>${isDutch ? "Totaal" : "Total"}:</strong> ${formattedTotal}</li>
      </ul>

      <p>${isDutch
        ? "Voor vragen kan u ons steeds contacteren."
        : "If you have any questions, feel free to contact us."}</p>

      <p style="margin-top: 40px;">
        ${isDutch ? "Met vriendelijke groeten" : "Kind regards"},<br>
        <strong>Reuven Zafir</strong><br>
        <strong>Manager</strong><br>
        ${isDutch ? "Voor Zafir Totaal Projecten BVBA" : "For Zafir Total Projects BVBA"}
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 15px; font-size: 12px; text-align: center; color: #888;">
      © ${new Date().getFullYear()} ZAFIR TOTAAL PROJECTEN BVBA — All rights reserved.
    </div>
  </div>
`;

  const mailOptions = {
    from: '"Zafir Totaal Projecten" <test2@zafir-test.co.uk>', //info@zafir.be
    to,
    subject: isDutch ? "Factuuroverzicht" : "Invoice Summary",
    html: htmlContent,
    attachments: [
      {
        filename: `invoice-${projectName}.pdf`,
        path: outputPath
      }
    ]
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    //console.log("are we mailing??"); 
    // await transporter.sendMail({
    //   from: "test2@zafir-test.co.uk",
    //   to: "bunim175@gmail.com",
    //   subject: "Test",
    //   text: "Hello world"
    // });
    // console.log("HURRA");
    
    console.log("✅ Email sent:", info.response);

    // Optional cleanup
    fs.unlink(outputPath, () => {});
    return true;
  } catch (err) {
    console.error("❌ Email failed:", err.message, err.stack);
    throw err;
  }
}

export default sendInvoiceByEmail;