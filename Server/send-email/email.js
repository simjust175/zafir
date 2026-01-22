// sendInvoice.js
import { Resend } from "resend";
import { config } from "dotenv";
import path from "path";
import fs from "fs";
import { createInvoicePdf } from "./createInvoice.js";
import InvoiceCalculations from "./calculations/invoiceCalculations.js";

config();

// ✅ Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

/* ---------------- EMAIL TEMPLATE ---------------- */
function generateEmailTemplate({
  recipient,
  projectName,
  total,
  balanceDue,
  isPaid,
  language = "nl",
  invoiceNumber
}) {
  const isDutch = language === "nl";
  const calc = new InvoiceCalculations();

  const formattedDate = new Date().toLocaleDateString(
    isDutch ? "nl-BE" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  const formattedTotal = calc.formatCurrency(total);
  const formattedBalance = calc.formatCurrency(balanceDue);
  const invNumber = invoiceNumber || `INV-${Date.now().toString().slice(-8)}`;

  const statusColor = isPaid
    ? "#38a169"
    : parseFloat(balanceDue) > 0
      ? "#d69e2e"
      : "#3182ce";

  const statusText = isPaid
    ? isDutch ? "BETAALD" : "PAID"
    : isDutch ? "OPENSTAAND" : "PENDING";

  return `<!DOCTYPE html>
<html lang="${isDutch ? 'nl' : 'en'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isDutch ? 'Factuuroverzicht' : 'Invoice Summary'}</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background-color:#f7fafc;">

  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${isDutch
      ? `Uw factuuroverzicht voor ${projectName} - Totaal: ${formattedTotal}`
      : `Your invoice summary for ${projectName} - Total: ${formattedTotal}`}
  </div>

  <!-- Main Email -->
  <table role="presentation" width="100%" style="background-color:#f7fafc;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" style="max-width:600px;background-color:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a365d 0%,#2b6cb0 100%);padding:40px;">
              <h1 style="margin:0;color:#fff;font-size:28px;">${isDutch ? 'Factuuroverzicht' : 'Invoice Summary'}</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                ${invNumber} • ${formattedDate}
              </p>
              <div style="background-color:${statusColor};color:#fff;padding:6px 16px;border-radius:20px;font-size:11px;font-weight:600;display:inline-block;margin-top:8px;">
                ${statusText}
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p>${isDutch ? 'Beste' : 'Dear'} <strong>${recipient}</strong>,</p>
              <p>${isDutch
      ? 'Hierbij ontvangt u het factuuroverzicht voor uw project. Alle details vindt u in de bijlage.'
      : 'Please find attached the invoice summary for your project. All details are included in the attachment.'}
              </p>

              <!-- Project Info -->
              <table width="100%" style="background-color:#f7fafc;border-radius:8px;margin:24px 0;padding:24px;">
                <tr>
                  <td>
                    <p style="font-weight:600;">${projectName}</p>
                    <p>${isDutch ? 'Totaalbedrag' : 'Total Amount'}: ${formattedTotal}</p>
                    <p>${isDutch ? 'Openstaand' : 'Balance Due'}: ${formattedBalance}</p>
                  </td>
                </tr>
              </table>

              <!-- Contact -->
              <p>${isDutch
      ? 'Heeft u vragen over deze factuur? Neem gerust contact met ons op.'
      : 'Have questions about this invoice? Feel free to reach out to us.'}</p>
              <p>${isDutch ? 'Met vriendelijke groeten' : 'Kind regards'},<br>
                ${process.env.SENDER_NAME || 'Your Name'}<br>
                ${process.env.SENDER_TITLE || 'Manager'}<br>
                ${process.env.COMPANY_NAME || 'Your Company'}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ---------------- SEND FUNCTION ---------------- */
async function sendInvoiceByEmail({
  to,
  recipient,
  projectName,
  groupedInvoices,
  groupedPayments,
  total,
  language = "nl"
}) {
  const calc = new InvoiceCalculations();
  const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;

  const paymentSummary = calc.calculatePaymentSummary(total, groupedPayments);
  const balanceDue = paymentSummary.summary.balanceDue;
  const isPaid = paymentSummary.summary.isPaid;

  const fileNameSafe = projectName.replace(/[^a-zA-Z0-9]/g, "-");
  const outputPath = path.join("invoices", `invoice-${Date.now()}.pdf`);

  try {
    // Generate PDF
    await createInvoicePdf(
      { projectName, groupedInvoices, groupedPayments, total, invoiceNumber },
      outputPath
    );

    // Generate email HTML
    const htmlContent = generateEmailTemplate({
      recipient,
      projectName,
      total,
      balanceDue: balanceDue.toString(),
      isPaid,
      language,
      invoiceNumber
    });

    // Send email via Resend
    const response = await resend.emails.send({
      from: `ZAFIR TOTAAL PROJECTEN <billing@zafir.uk>`,
      to: [to],
      subject: language === "nl"
        ? `Factuuroverzicht - ${projectName} [${invoiceNumber}]`
        : `Invoice Summary - ${projectName} [${invoiceNumber}]`,
      html: htmlContent,
      attachments: [
        {
          filename: `Invoice-${fileNameSafe}-${invoiceNumber}.pdf`,
          content: fs.readFileSync(outputPath).toString("base64"),
          type: "application/pdf",
          disposition: "attachment"
        }
      ]
    });

    console.log("Email sent via Resend:", response.id);
    return { success: true, messageId: response.id, invoiceNumber };

  } catch (err) {
    console.error("Email sending failed:", err.message);
    throw err;

  } finally {
    // Always clean up PDF
    fs.unlink(outputPath, () => { });
  }
}

export default sendInvoiceByEmail;
export { generateEmailTemplate };