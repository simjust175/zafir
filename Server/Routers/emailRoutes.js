import { Router } from "express";
import Imap from "imap";
import emailAccounts from "../email-service/imap/accounts.js";
// import sendInvoiceByEmail from "../send-email/email.js"
import EmailService from "../Services/emailService.js";

const router = Router();

router.post("/verify-email-access", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const imap = new Imap(emailAccounts(email, password));

    const tryConnect = () =>
      new Promise((resolve) => {
        const timeout = setTimeout(() => {
          try { imap.end(); } catch (e) {}
          resolve({ success: false, error: "Connection timeout" });
        }, 30000);

        imap.once("ready", () => {
          clearTimeout(timeout);
          imap.openBox("INBOX", false, (err) => {
            if (err) {
              try { imap.end(); } catch (e) {}
              return resolve({ success: false, error: "Cannot open inbox" });
            }
            try { imap.end(); } catch (e) {}
            resolve({ success: true });
          });
        });

        imap.once("error", (err) => {
          clearTimeout(timeout);
          resolve({ success: false, error: err.message });
        });

        imap.connect();
      });

    const result = await tryConnect();
    return res.json(result);
  } catch (err) {
    console.error("Email verification error:", err.message);
    return res.status(500).json({ success: false, error: "Email verification failed" });
  }
});

router.post('/send-invoice', EmailService.SendEmailService)

export default router;