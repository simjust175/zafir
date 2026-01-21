import sendInvoiceByEmail from "../send-email/email.js";

class EmailService {
  static async SendEmailService(req, res) {
    console.log("testing email service");

    const { to, language, recipient, projectName, total, groupedInvoices, groupedPayments } = req.body;
    console.log("to", to, "language", language, "recipient", recipient, "projectName", projectName, "groupedInvoices", groupedInvoices, "groupedPayments", groupedPayments);

    if (!to || !language || !projectName || !total || !groupedInvoices || !groupedPayments) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Respond immediately
    res.status(200).json({ success: true, message: "Email queued" });

    // Send email asynchronously (fire-and-forget)
    sendInvoiceByEmail({ to, recipient, language, projectName, total, groupedInvoices, groupedPayments })
      .then(() => console.log("✅ Email sent successfully"))
      .catch(err => console.error("❌ Failed to send email:", err));
  }
}

export default EmailService;
