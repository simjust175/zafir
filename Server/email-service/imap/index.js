import Imap from "imap";
import emailAccounts from "./accounts.js";
import { openInbox, handleNewEmails } from "../imap.js";

import GeneralService from "../../Services/generalService.js";
import AmountService from "../../Services/amountService.js";


export default async function startListeningForAll(postToDb) {
  const list = await AmountService.getActiveEmailsService();

  for (const accountConfig of list) {
    const { email_address, password, project_id } = accountConfig;

    const imap = new Imap(emailAccounts(email_address, password));
    //handleNewEmails(imap)
    const startAccountListener = () => {
      imap.once("ready", () => {
        openInbox(imap, async (err) => {
          if (err) {
            console.error(`❌ Error opening inbox for ${email_address}:`, err);
            return;
          }

          console.log(`📡 IMAP Ready — Scanning ${email_address}`);

          imap.on("mail", async () => {
            console.log(`📨 New mail detected for ${email_address}`);
            try {
              const result = await handleNewEmails(imap);
              console.log("result:", result);
              
              if (result) postToDb({ ...result, project: project_id });
            } catch (error) {
              console.error(`⚠️ Failed to process mail for ${email_address}:`, error);
            }
          });

          try {
            const result = await handleNewEmails(imap);
            if (result) postToDb({ ...result, project: project_id });
          } catch (error) {
            console.error(`⚠️ Initial check failed for ${email_address}:`, error);
          }
        });
      });

      imap.once("error", (err) => {
        console.error(`❌ IMAP error on ${email_address}:`, err);
        setTimeout(startAccountListener, 5000); // Auto-reconnect
      });

      imap.once("end", () => {
        console.warn(`⚠️ Connection ended on ${email_address}, restarting...`);
        setTimeout(startAccountListener, 5000); // Auto-reconnect
      });

      imap.connect();
    };

    startAccountListener();
  }
}
