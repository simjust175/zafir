import dotenv from "dotenv";
import Imap from "imap";
import { simpleParser } from "mailparser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pdf from "pdf-parse/lib/pdf-parse.js";
import analyze from "./gpt.js";
import emailAccounts from "./imap/accounts.js";
import { v4 as uuidv4 } from "uuid"; 

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function extractPrice(text) {
  text = text
    .normalize("NFKC") // Normalize Unicode characters
    .replace(/\u00A0/g, " ") // Replace non-breaking spaces
    .replace(/\s+/g, " ") // Collapse all whitespace
    .trim()
    .toLowerCase();

  const result = {
    source: "label",
    amount: undefined,
    btw: undefined,
    includesBTW: false,
  };

  // 🔍 Look for total amount (incl. or excl. btw)
  const totalMatch =
    text.match(/totaalbedrag\s*€?\s*([\d.,]+)/i) ||
    text.match(/totaal\s*eur\s*([\d.,]+)/i) ||
    text.match(/totaal\s*€\s*(?:incl\.?|excl\.)\s*btw\s*([\d.,]+)/i) || // NEW: "Totaal € incl. btw"
    text.match(/totaal\s*€\s*([\d.,]+)\s*incl\.?\s*btw/i) || // NEW: reversed order
    text.match(/totaal incl\.? btw\s*€?\s*([\d.,]+)/i) ||
    text.match(/(?:eur|€)\s*([\d.,]+)\s*$/im); // Fallback at the end of text

  // 🔎 Look for BTW value explicitly
  const btwMatch =
    text.match(/btw bedrag\s*([\d.,]+)/i) ||
    text.match(/btw\s*€?\s*([\d.,]+)/i) ||
    text.match(/\b\d{1,2}%\s*€\s*([\d.,]+)/i);

  // ✅ Handle amounts
  if (totalMatch) {
    result.amount = parseFloat(
      totalMatch[1].replace(/\./g, "").replace(",", ".")
    );
  }
  if (btwMatch) {
    result.btw = parseFloat(btwMatch[1].replace(/\./g, "").replace(",", "."));
  }

  // 🧠 Determine inclusion of BTW
  if (text.includes("btw verlegd") || text.includes("verlegging van heffing")) {
    result.btw = 0;
    result.includesBTW = true;
  } else if (result.amount !== undefined && result.btw !== undefined) {
    const net = result.amount - result.btw;
    result.includesBTW = net > 0 && result.btw > 0;
  } else {
    if (
      text.includes("incl. btw") ||
      text.includes("inclusief btw") ||
      text.includes("totaal incl. btw") ||
      text.includes("totaalbedrag")
    ) {
      result.includesBTW = true;
    }
  }
  // console.log("res", result);

  return result.amount ? result : null;
}

// --------- IMAP Configuration ---------
// const imapConfig = {
//   user: process.env.EMAIL_USER,
//   password: process.env.EMAIL_PASS,
//   host: process.env.EMAIL_HOST,
//   port: parseInt(process.env.EMAIL_PORT),
//   tls: true,
//   tlsOptions: { rejectUnauthorized: false },
// };

// --------- Core Email Handling ---------
function openInbox(imap, cb) {
  imap.openBox("INBOX", false, cb);
}

function handleNewEmails(imap) {
  return new Promise((resolve, reject) => {
    const searchCriteria = ["UNSEEN"];
    const fetchOptions = { bodies: "", struct: true, markSeen: false };

    imap.search(searchCriteria, (err, uids) => {
      if (err) return reject(err);
      if (!uids.length) return resolve(null);

      const f = imap.fetch(uids, fetchOptions);
      f.on("message", (msg, seqno) => {
        let uid;
        let result = null;

        msg.on("attributes", (attrs) => {
          uid = attrs.uid;
        });

        msg.on("body", (stream) => {
          simpleParser(stream)
            .then(async (parsed) => {
              for (const att of parsed.attachments || []) {
                if (att.contentType === "application/pdf") {
                  const downloadsDir = path.join(__dirname, "downloads");
                  if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);

                  const uniqueName = `${uuidv4()}_${att.filename}`;
                  const filePath = path.join(downloadsDir, uniqueName);
                  fs.writeFileSync(filePath, att.content);

                  try {
                    const pdfData = await pdf(att.content);
                    const senderEmail = parsed.from?.value?.[0]?.address;
                    const extracted = await analyze(pdfData.text, senderEmail);

                    if (extracted) {
                      result = { ...extracted, pdf_file: uniqueName };
                    }
                  } catch (err) {
                    console.error("❌ Error parsing PDF:", err);
                  }
                }
              }

              if (result && uid) {
                imap.addFlags(uid, "\\Seen", (err) => {
                  if (err) console.warn("⚠️ Could not mark email as read:", err);
                });
              }

              resolve(result || null); // ✅ resolve only once, after parsing
            })
            .catch((err) => {
              console.error("❌ Error parsing email:", err);
              reject(err);
            });
        });
      });

      f.once("error", (err) => {
        console.error("❌ Fetch error:", err);
        reject(err);
      });

      f.once("end", () => {
        console.log("✅ Finished processing emails");
      });
    });
  });
}
// // --------- Start Listening Loop ---------
// function startListening(postToDb) {
//   const imap = new Imap(imapConfig);
//   imap.once("ready", async () => {
//     openInbox(imap, async (err) => {
//       if (err) throw err;
//       console.log("👀 IMAP ready, watching for new emails...");

//       imap.on("mail", async () => {
//         console.log("📨 New mail event detected");
//         const handleResults = await handleNewEmails(imap);
//         if (handleResults) postToDb(handleResults);
//       });

//       // Also check unseen emails on startup
//       const handleResults = await handleNewEmails(imap);
//       if (handleResults) postToDb(handleResults);
//     });
//   });

//   imap.once("error", (err) => {
//     console.error("❌ IMAP error:", err);
//     setTimeout(() => startListening(postToDb), 5000);
//   });

//   imap.once("end", () => {
//     console.warn("⚠️ IMAP connection ended, restarting...");
//     setTimeout(() => startListening(postToDb), 5000);
//   });
//   imap.connect();
// }

// //startListening()
// //export default startListening;
export {openInbox, handleNewEmails}