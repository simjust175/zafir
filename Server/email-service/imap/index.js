import Imap from "imap";
import emailAccounts from "./accounts.js";
import { openInbox, handleNewEmails } from "../imap.js";

import GeneralService from "../../Services/generalService.js";
import AmountService from "../../Services/amountService.js";


export default async function startListeningForAll(postToDb) {
  const list = await GeneralService.getService({ params: { db: "emails" }});

  for (const accountConfig of list) {
    const { email, password } = accountConfig;

    const imap = new Imap(emailAccounts(email, password));
    //handleNewEmails(imap)
    const startAccountListener = () => {
      imap.once("ready", () => {
        openInbox(imap, async (err) => {
          if (err) {
            console.error(`❌ Error opening inbox for ${email}:`, err);
            return;
          }

          console.log(`📡 IMAP Ready — Scanning ${email}`);

          imap.on("mail", async () => {
            console.log(`📨 New mail detected for ${email}`);
            try {
              const result = await handleNewEmails(imap);
              console.log("result:", result);
              
              if (result) postToDb({ ...result, project: await AmountService.getProjectIdService(email) });
            } catch (error) {
              console.error(`⚠️ Failed to process mail for ${email}:`, error);
            }
          });

          try {
            const result = await handleNewEmails(imap);
            if (result) postToDb({ ...result, project: await AmountService.getProjectIdService(email) });
          } catch (error) {
            console.error(`⚠️ Initial check failed for ${email}:`, error);
          }
        });
      });

      imap.once("error", (err) => {
        console.error(`❌ IMAP error on ${email}:`, err);
        setTimeout(startAccountListener, 5000); // Auto-reconnect
      });

      imap.once("end", () => {
        console.warn(`⚠️ Connection ended on ${email}, restarting...`);
        setTimeout(startAccountListener, 5000); // Auto-reconnect
      });

      imap.connect();
    };

    startAccountListener();
  }
}
