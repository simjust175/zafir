import nodemailer from "nodemailer";
import { config } from "dotenv";
import path from "path";
import { createInvoicePdf } from "./createInvoice.js";
import InvoiceCalculations from "./calculations/invoiceCalculations.js";
import fs from "fs";

config();

function generateEmailTemplate({ recipient, projectName, total, balanceDue, isPaid, language = "nl", invoiceNumber }) {
  const isDutch = language === "nl";
  const calc = new InvoiceCalculations();
  
  const formattedDate = new Date().toLocaleDateString(isDutch ? "nl-BE" : "en-US", {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedTotal = calc.formatCurrency(total);
  const formattedBalance = calc.formatCurrency(balanceDue);
  const invNumber = invoiceNumber || `INV-${Date.now().toString().slice(-8)}`;
  
  const statusColor = isPaid ? "#38a169" : parseFloat(balanceDue) > 0 ? "#d69e2e" : "#3182ce";
  const statusText = isPaid 
    ? (isDutch ? "BETAALD" : "PAID")
    : (isDutch ? "OPENSTAAND" : "PENDING");

  return `
<!DOCTYPE html>
<html lang="${isDutch ? 'nl' : 'en'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${isDutch ? 'Factuuroverzicht' : 'Invoice Summary'}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f7fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  
  <!-- Preheader Text -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${isDutch 
      ? `Uw factuuroverzicht voor ${projectName} - Totaal: ${formattedTotal}`
      : `Your invoice summary for ${projectName} - Total: ${formattedTotal}`
    }
  </div>
  
  <!-- Email Container -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f7fafc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <!-- Main Content Card -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%); padding: 40px 40px 35px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                      ${isDutch ? 'Factuuroverzicht' : 'Invoice Summary'}
                    </h1>
                    <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.85); font-size: 14px;">
                      ${invNumber} &bull; ${formattedDate}
                    </p>
                  </td>
                  <td align="right" valign="top">
                    <div style="background-color: ${statusColor}; color: #ffffff; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 1px; display: inline-block;">
                      ${statusText}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Accent Line -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #3182ce 0%, #38b2ac 100%);"></td>
          </tr>
          
          <!-- Body Content -->
          <tr>
            <td style="padding: 40px;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 24px; color: #1a202c; font-size: 16px; line-height: 1.6;">
                ${isDutch ? 'Beste' : 'Dear'} <strong>${recipient}</strong>,
              </p>
              
              <p style="margin: 0 0 32px; color: #4a5568; font-size: 15px; line-height: 1.7;">
                ${isDutch 
                  ? 'Hierbij ontvangt u het factuuroverzicht voor uw project. Alle details vindt u in de bijlage.'
                  : 'Please find attached the invoice summary for your project. All details are included in the attachment.'
                }
              </p>
              
              <!-- Project Info Card -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f7fafc; border-radius: 8px; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
                          <p style="margin: 0; color: #718096; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                            ${isDutch ? 'Project' : 'Project'}
                          </p>
                          <p style="margin: 4px 0 0; color: #1a202c; font-size: 18px; font-weight: 600;">
                            ${projectName}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 16px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td width="50%">
                                <p style="margin: 0; color: #718096; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                                  ${isDutch ? 'Totaalbedrag' : 'Total Amount'}
                                </p>
                                <p style="margin: 4px 0 0; color: #1a365d; font-size: 24px; font-weight: 700;">
                                  ${formattedTotal}
                                </p>
                              </td>
                              <td width="50%" align="right">
                                <p style="margin: 0; color: #718096; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                                  ${isDutch ? 'Openstaand' : 'Balance Due'}
                                </p>
                                <p style="margin: 4px 0 0; color: ${parseFloat(balanceDue) > 0 ? '#e53e3e' : '#38a169'}; font-size: 24px; font-weight: 700;">
                                  ${formattedBalance}
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 32px;">
                <tr>
                  <td align="center">
                    <a href="#" style="display: inline-block; background: linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">
                      ${isDutch ? 'BEKIJK DETAILS IN BIJLAGE' : 'VIEW DETAILS IN ATTACHMENT'}
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 32px;">
                <tr>
                  <td style="border-top: 1px solid #e2e8f0;"></td>
                </tr>
              </table>
              
              <!-- Contact Info -->
              <p style="margin: 0 0 8px; color: #4a5568; font-size: 14px; line-height: 1.6;">
                ${isDutch 
                  ? 'Heeft u vragen over deze factuur? Neem gerust contact met ons op.'
                  : 'Have questions about this invoice? Feel free to reach out to us.'
                }
              </p>
              
              <!-- Signature -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 32px;">
                <tr>
                  <td>
                    <p style="margin: 0; color: #4a5568; font-size: 14px;">
                      ${isDutch ? 'Met vriendelijke groeten' : 'Kind regards'},
                    </p>
                    <p style="margin: 12px 0 0; color: #1a202c; font-size: 15px; font-weight: 600;">
                      ${process.env.SENDER_NAME || 'Your Name'}
                    </p>
                    <p style="margin: 2px 0 0; color: #718096; font-size: 13px;">
                      ${process.env.SENDER_TITLE || 'Manager'}
                    </p>
                    <p style="margin: 2px 0 0; color: #718096; font-size: 13px;">
                      ${process.env.COMPANY_NAME || 'Your Company'}
                    </p>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1a365d; padding: 32px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px; color: #ffffff; font-size: 14px; font-weight: 600;">
                      ${process.env.COMPANY_NAME || 'Your Company'}
                    </p>
                    <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 12px; line-height: 1.6;">
                      ${process.env.COMPANY_ADDRESS || 'Your Address'}<br>
                      ${process.env.COMPANY_PHONE || ''} &bull; ${process.env.COMPANY_EMAIL || ''}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Copyright -->
          <tr>
            <td style="background-color: #0f2744; padding: 16px 40px; text-align: center;">
              <p style="margin: 0; color: rgba(255, 255, 255, 0.5); font-size: 11px;">
                &copy; ${new Date().getFullYear()} ${process.env.COMPANY_NAME || 'Your Company'} &mdash; ${isDutch ? 'Alle rechten voorbehouden' : 'All rights reserved'}
              </p>
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

  const outputPath = path.resolve(`invoices/invoice-${Date.now()}.pdf`);
  
  await createInvoicePdf({ 
    projectName, 
    groupedInvoices, 
    groupedPayments, 
    total,
    invoiceNumber 
  }, outputPath);

  const transporter = nodemailer.createTransport({
    host: "smtp.bookmyname.com",
    port:  587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const htmlContent = generateEmailTemplate({
    recipient,
    projectName,
    total,
    balanceDue: balanceDue.toString(),
    isPaid,
    language,
    invoiceNumber
  });

  const isDutch = language === "nl";
  
  const mailOptions = {
    from: `"ZAFIR TOTAAL PROJECTEN" <${process.env.EMAIL_USER || "<test2@zafir-test.co.uk>"}>`,
    to,
    subject: isDutch 
      ? `Factuuroverzicht - ${projectName} [${invoiceNumber}]` 
      : `Invoice Summary - ${projectName} [${invoiceNumber}]`,
    html: htmlContent,
    attachments: [
      {
        filename: `Invoice-${projectName.replace(/[^a-zA-Z0-9]/g, '-')}-${invoiceNumber}.pdf`,
        path: outputPath,
        contentType: 'application/pdf'
      }
    ],
    headers: {
      'X-Priority': '3',
      'X-Mailer': 'BILLIO Invoice System'
    }
  };

  try {
    console.log("TES TES TEST", {user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS});
    
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);

    fs.unlink(outputPath, (err) => {
      if (err) console.warn("Could not delete temp PDF:", err.message);
    });
    
    return { 
      success: true, 
      messageId: info.messageId,
      invoiceNumber 
    };
  } catch (err) {
    console.error("Email sending failed:", err.message);
    
    fs.unlink(outputPath, () => {});
    
    throw err;
  }
}

export default sendInvoiceByEmail;
export { generateEmailTemplate };
