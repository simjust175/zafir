import sendInvoiceByEmail from "../send-email/email.js";

class EmailService {
  
  
  static async SendEmailService(req, res) {
    console.log("testing email service");
    
    const { to, language, recipient, projectName, total, groupedInvoices, groupedPayments, invoicingEntries, projectMargin, totalInvoiced, outstanding } = req.body;
    console.log("Email request:", { totalInvoiced, outstanding });
    
    if (!to || !language || !projectName || !total || !groupedInvoices || !groupedPayments) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    try {
      await sendInvoiceByEmail({ 
        to, 
        recipient, 
        language, 
        projectName, 
        total, 
        groupedInvoices, 
        groupedPayments,
        invoicingEntries: invoicingEntries || [],
        projectMargin: parseFloat(projectMargin) || 0,
        totalInvoiced: parseFloat(totalInvoiced) || 0,
        outstanding: parseFloat(outstanding) || 0
      });
      res.status(200).json({ success: true });
    } catch (err) {
      console.error("Email service error:", err);
      res.status(500).json({ error: "Failed to send invoice email." });
    }
  }
}

export default EmailService;
