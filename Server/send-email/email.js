import { config } from "dotenv";
import path from "path";
import fs from "fs";
import { Resend } from "resend";
import { createInvoicePdf } from "./createInvoice.js";
import InvoiceCalculations from "./calculations/invoiceCalculations.js";

config();

/* -------------------- RESEND INIT -------------------- */
const resend = new Resend(process.env.RESEND_API_KEY);

/* -------------------- EMAIL TEMPLATE -------------------- */
function generateEmailTemplate({
  recipient,
  projectName,
  total,
  balanceDue,
  isPaid,
  language = "nl",
  invoiceNumber,
  companyBreakdown = [],
  totalInvoiced,
  outstanding
}) {
  const isDutch = language === "nl";
  const calc = new InvoiceCalculations();

  const formattedDate = new Date().toLocaleDateString(
    isDutch ? "nl-BE" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  const formattedTotal = calc.formatCurrency(total);
  const formattedBalance = calc.formatCurrency(outstanding);
  const invNumber = invoiceNumber || `INV-${Date.now().toString().slice(-8)}`;

  const statusColor = isPaid
    ? "#38a169"
    : parseFloat(outstanding) > 0
      ? "#d69e2e"
      : "#3182ce";

  const statusText = isPaid
    ? isDutch ? "BETAALD" : "PAID"
    : isDutch ? "OPENSTAAND" : "PENDING";

  return `
<!DOCTYPE html>
<html lang="${isDutch ? "nl" : "en"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isDutch ? "Factuuroverzicht" : "Invoice Summary"}</title>
</head>

<body style="margin:0;padding:0;background:#f7fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
<tr><td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">

<tr>
<td style="background:linear-gradient(135deg,#1a365d,#2b6cb0);padding:40px">
<h1 style="color:#fff;margin:0">${isDutch ? "Factuuroverzicht" : "Invoice Summary"}</h1>
<p style="color:#e2e8f0">${invNumber} • ${formattedDate}</p>
</td>
</tr>

<tr><td style="padding:40px">

<p>${isDutch ? "Beste" : "Dear"} <strong>${recipient}</strong>,</p>

<p>
${isDutch
      ? "Hierbij ontvangt u het factuuroverzicht voor uw project."
      : "Please find attached the invoice summary for your project."}
</p>

<p><strong>${projectName}</strong></p>

<p>
${isDutch ? "Totaal" : "Total"}: <strong>${formattedTotal}</strong><br/>
${isDutch ? "Openstaand" : "Balance Due"}:
<strong style="color:${parseFloat(outstanding) > 0 ? "#e53e3e" : "#38a169"}">
${formattedBalance}
</strong>
</p>

</td></tr>

<tr>
<td style="background:#1a365d;color:#fff;padding:24px;text-align:center">
${process.env.COMPANY_NAME || "Your Company"}
</td>
</tr>

</table>

</td></tr>
</table>

</body>
</html>
`;
}

/* -------------------- COMPANY BREAKDOWN -------------------- */
function calculateCompanyBreakdown(invoices, marginPercent = 0) {
  const companyMap = new Map();

  invoices.forEach(inv => {
    const issuer = inv.issuer || inv.company || "Unknown";
    const amount = parseFloat(inv.amount) || 0;
    const margin = inv.margin ?? marginPercent;

    if (!companyMap.has(issuer)) {
      companyMap.set(issuer, { name: issuer, count: 0, subtotal: 0, total: 0 });
    }

    const company = companyMap.get(issuer);
    company.count += 1;
    company.subtotal += amount;
    company.total += amount + (amount * margin) / 100;
  });

  return [...companyMap.values()];
}

/* -------------------- SEND EMAIL -------------------- */
async function sendInvoiceByEmail({
  to,
  recipient,
  projectName,
  groupedInvoices,
  groupedPayments,
  total,
  language = "nl",
  projectMargin = 0,
  invoicingEntries = [],
  totalInvoiced = 0,
  outstanding = 0
}) {
  const calc = new InvoiceCalculations();
  const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;

  const paymentSummary = calc.calculatePaymentSummary(total, groupedPayments);
  const isPaid = paymentSummary.summary.isPaid;

  const flatInvoices = groupedInvoices.flatMap(g => g.invoices || [g]);
  const companyBreakdown = calculateCompanyBreakdown(flatInvoices, projectMargin);

  const outputPath = path.resolve(`invoices/invoice-${Date.now()}.pdf`);

  await createInvoicePdf(
    {
      projectName,
      groupedInvoices,
      groupedPayments,
      invoicingData: invoicingEntries,
      paymentsData: groupedPayments,
      total,
      totalInvoiced,
      outstanding,
      invoiceNumber,
      projectMargin
    },
    outputPath
  );

  const htmlContent = generateEmailTemplate({
    recipient,
    projectName,
    total,
    balanceDue: outstanding,
    isPaid,
    language,
    invoiceNumber,
    outstanding,
    companyBreakdown
  });

  const isDutch = language === "nl";

  try {
    const email = await resend.emails.send({
      from: process.env.USER_EMAIL || "ZAFIR TOTAAL PROJECTEN <info@zafir.be>",
      to,
      subject: isDutch
        ? `Factuuroverzicht - ${projectName} [${invoiceNumber}]`
        : `Invoice Summary - ${projectName} [${invoiceNumber}]`,
      html: htmlContent,
      attachments: [
        {
          filename: `Invoice-${projectName}-${invoiceNumber}.pdf`,
          content: fs.readFileSync(outputPath),
          contentType: "application/pdf"
        }
      ]
    });

    fs.unlinkSync(outputPath);

    return {
      success: true,
      messageId: email.id,
      invoiceNumber
    };
  } catch (err) {
    fs.existsSync(outputPath) && fs.unlinkSync(outputPath);
    throw err;
  }
}

export default sendInvoiceByEmail;
export { generateEmailTemplate };