import { Router } from "express";
import Imap from "imap";
import emailAccounts from "../email-service/imap/accounts.js";
// import sendInvoiceByEmail from "../send-email/email.js"
import EmailService from "../Services/emailService.js";

const router = Router();

router.post("/verify-email-access", async (req, res) => {
  const { email, password } = req.body;
  const imap = new Imap(emailAccounts(email, password));

  const tryConnect = () =>
    new Promise((resolve) => {
      imap.once("ready", () => {
        imap.openBox("INBOX", false, (err) => {
          if (err) {
            imap.end();
            return resolve({ success: false, error: "Cannot open inbox" });
          }
          imap.end();
          resolve({ success: true });
        });
      });

      imap.once("error", (err) => {
        resolve({ success: false, error: err.message });
      });

      imap.connect();
    });

  const result = await tryConnect();
  return res.json(result);
});

router.post('/send-invoice', EmailService.SendEmailService)

export default router;