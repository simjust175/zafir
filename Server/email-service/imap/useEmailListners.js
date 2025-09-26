import Imap from "imap";
import emailAccounts from "./accounts.js";
import { openInbox, handleNewEmails } from "../imap.js";
import AmountService from "../../Services/amountService.js";

const activeConnections = new Map(); // email_address -> { imap, status }

function createConnectionLogger(email) {
  return {
    ready: () => console.log(`📡 IMAP Ready — ${email}`),
    error: (err) => console.error(`❌ IMAP error [${email}]:`, err.message),
    end: () => console.warn(`⚠️ IMAP ended [${email}]`),
    reconnect: () => console.log(`🔁 Reconnecting to ${email}`),
    mail: () => console.log(`📨 New mail for ${email}`),
  };
}

function processResult(result, project_id, postToDb) {
  console.log("🔎 processResult() called with:", { result, project_id });

  if (!result) {
    console.warn("⚠️ No result returned from handleNewEmails()");
    return;
  }

  // 🟢 If multiple invoices in one email
  if (Array.isArray(result)) {
    console.log(`📦 Processing ${result.length} invoices for project ${project_id}`);
    result.forEach((r, idx) => {
      console.log(`📦 Invoice [${idx}] →`, JSON.stringify(r, null, 2));
      try {
        postToDb({ ...r, project: project_id });
      } catch (err) {
        console.error("❌ Error posting array invoice:", err);
      }
    });
  } else {
    console.log("📦 Processed invoice (single):", JSON.stringify(result, null, 2));
    try {
      postToDb({ ...result, project: project_id });
    } catch (err) {
      console.error("❌ Error posting single invoice:", err);
    }
  }
}

function setupImapConnection(config, postToDb) {
  const { email_address, password, project_id } = config;
  const logger = createConnectionLogger(email_address);
  const imap = new Imap(emailAccounts(email_address, password));

  const startListener = () => {
    imap.once("ready", () => {
      logger.ready();

      openInbox(imap, async (err) => {
        if (err) return console.error(`❌ Failed to open inbox [${email_address}]:`, err);

        // Initial fetch
        try {
          console.log(`🔍 Running initial fetch for ${email_address}`);
          const result = await handleNewEmails(imap);
          console.log(`📥 handleNewEmails() returned for ${email_address}:`, result);
          processResult(result, project_id, postToDb);
        } catch (err) {
          console.error(`⚠️ Initial check failed [${email_address}]:`, err.message);
        }

        // Live mail listener
        imap.on("mail", async () => {
          logger.mail();
          try {
            const result = await handleNewEmails(imap);
            console.log(`📥 handleNewEmails() returned for ${email_address}:`, result);
            processResult(result, project_id, postToDb);
          } catch (err) {
            console.error(`⚠️ Failed to process mail [${email_address}]:`, err.message);
          }
        });
      });
    });

    imap.once("error", (err) => {
      logger.error(err);
      activeConnections.set(email_address, { imap, status: "error" });
      setTimeout(() => {
        logger.reconnect();
        setupImapConnection(config, postToDb); // Reconnect
      }, 5000);
    });

    imap.once("end", () => {
      logger.end();
      activeConnections.set(email_address, { imap, status: "ended" });
      setTimeout(() => {
        logger.reconnect();
        setupImapConnection(config, postToDb); // Reconnect
      }, 5000);
    });

    imap.connect();
    activeConnections.set(email_address, { imap, status: "connected" });
  };

  startListener();
}

/**
 * Starts IMAP listeners for all active emails
 */
export async function startEmailListeners(postToDb) {
  try {
    const list = await AmountService.getActiveEmailsService();
    console.log("📋 Active email accounts from DB:", list);
    if (!list?.length) {
      console.warn("⚠️ No active email accounts found.");
      return;
    }

    for (const config of list) {
      setupImapConnection(config, postToDb);
    }

    console.log(`📬 Started IMAP listeners for ${list.length} accounts.`);
  } catch (err) {
    console.error("❌ Failed to start email listeners:", err.message);
  }
}

/**
 * Returns current health/status of email IMAP listeners
 */
export function getEmailListenerStatus() {
  const status = {};
  for (const [email, { status }] of activeConnections) {
    status[email] = status;
  }
  return status;
}

/**
 * Stops all active IMAP connections (e.g. for shutdown or testing)
 */
export function stopEmailListeners() {
  for (const [email, { imap }] of activeConnections.entries()) {
    try {
      imap.end();
      console.log(`🔌 IMAP connection closed for ${email}`);
    } catch (err) {
      console.error(`❌ Failed to close IMAP for ${email}:`, err.message);
    }
  }
  activeConnections.clear();
}