import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SAVE_DIR = path.join(__dirname, "downloads");

// Ensure directory exists
if (!fs.existsSync(SAVE_DIR)) {
  fs.mkdirSync(SAVE_DIR, { recursive: true });
}

export function savePdfAndGetInfo(originalFilename, buffer) {
  try {
    // Create a checksum to prevent duplicates
    const checksum = crypto.createHash("sha256").update(buffer).digest("hex");

    // Generate unique stored name
    const ext = path.extname(originalFilename) || ".pdf";
    const uuidName = `${uuidv4()}${ext}`;

    const filePath = path.join(SAVE_DIR, uuidName);

    // ONLY write if not already saved (based on checksum)
    const existing = fs.readdirSync(SAVE_DIR);

    for (const file of existing) {
      const p = path.join(SAVE_DIR, file);
      const data = fs.readFileSync(p);
      const cs = crypto.createHash("sha256").update(data).digest("hex");
      if (cs === checksum) {
        return {
          stored_filename: file,
          checksum,
          skipped: true,
        };
      }
    }

    // Save file
    fs.writeFileSync(filePath, buffer);

    return {
      stored_filename: uuidName,
      checksum,
      skipped: false,
    };
  } catch (err) {
    console.error("❌ Failed to save PDF:", err);
    return null;
  }
}