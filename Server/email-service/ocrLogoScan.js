import fs from "fs";
import path from "path";
import sharp from "sharp";
import { createWorker } from "tesseract.js";
import pdfPoppler from "pdf-poppler"; // optional if you want precise render

// Extract top slice (logo region) of the first page
export async function extractLogoIssuer(pdfBuffer) {
  const tempDir = "./ocr-temp";
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const imagePath = path.join(tempDir, "page.png");

  // Convert first page to image using sharp (simplified)
  const image = await sharp(pdfBuffer)
    .resize({ width: 1200 }) // adjust resolution
    .extract({ left: 0, top: 0, width: 1200, height: 200 }) // top 200px
    .toFile(imagePath);

  const worker = await createWorker("eng");

  await worker.load();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");

  const {
    data: { text },
  } = await worker.recognize(imagePath);

  await worker.terminate();
  return text.trim();
}
