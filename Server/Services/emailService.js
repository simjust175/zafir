import sendInvoiceByEmail from "../send-email/email.js";

class EmailService {
  
  
  static async SendEmailService(req, res) {
    console.log("testing email service");
    
    const { to, language, recipient, projectName, total, groupedInvoices, groupedPayments } = req.body;
    console.log( "to" , to, "language", language, "recipient", recipient, "projectName", projectName, "groupedInvoices",  groupedInvoices, "groupedPayments", groupedPayments);
    
    if (!to || !language || !projectName || !total || !groupedInvoices || !groupedPayments) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    try {
      await sendInvoiceByEmail({ to, recipient, language, projectName, total, groupedInvoices, groupedPayments });
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to send invoice email." });
    }
  }
}

export default EmailService;