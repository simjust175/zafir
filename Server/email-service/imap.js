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
import { savePdfAndGetInfo } from "./savePdf.js";

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

function openInbox(imap, cb) {
  imap.openBox("INBOX", false, cb);
}

function handleNewEmails(imap) {
  return new Promise((resolve, reject) => {
    imap.search(["UNSEEN"], (err, uids) => {
      if (err || !uids.length) return resolve(null);

      const f = imap.fetch(uids, { bodies: "", struct: true });
      const results = [];
      const messagePromises = [];

      f.on("message", (msg, seqno) => {
        const p = new Promise((res) => {
          let uid;

          msg.on("attributes", (attrs) => {
            uid = attrs.uid;
          });

          msg.on("body", (stream) => {
            simpleParser(stream)
              .then(async (parsed) => {
                for (const att of parsed.attachments || []) {
                  if (att.contentType === "application/pdf") {
                    try {
                      const saved = savePdfAndGetInfo(att.filename, att.content);

                      // Parse the PDF text
                      const pdfData = await pdf(att.content);
                      const senderEmail = parsed.from?.value?.[0]?.address;
                      const extracted = await analyze(pdfData.text, senderEmail);

                      if (extracted && saved) {
                        results.push({
                          ...extracted,
                          pdf_file: saved.stored_filename,
                          pdf_checksum: saved.checksum,
                          pdf_saved: !saved.skipped,
                        });
                      }}
                      catch (err) {
                        console.error("❌ PDF parse error:", err);
                      }
                    }
                }

                  if (uid) {
                    imap.addFlags(uid, "\\Seen", () => { });
                  }

                  res(); // resolve this message's promise
                })
              .catch((err) => {
                console.error("❌ simpleParser error:", err);
                res(); // still resolve to avoid hanging
              });
          });
        });

        messagePromises.push(p);
      });

      f.once("error", (err) => {
        console.error("❌ Fetch error:", err);
        reject(err);
      });

      f.once("end", async () => {
        console.log("✅ Finished processing emails");
        await Promise.all(messagePromises); // wait for all messages
        resolve(results.length === 1 ? results[0] : results.length ? results : null);
      });
    });
  });
}


export { openInbox, handleNewEmails }