import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import pdf from "pdf-parse/lib/pdf-parse.js";
import analyze from "../email-service/gpt.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const route = express.Router();

// Use the same downloads directory as email service for consistency
const DOWNLOADS_DIR = path.join(__dirname, "../email-service/downloads");
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DOWNLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".pdf";
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, JPG, and PNG are allowed."));
    }
  }
});

import AmountControllers from "../Controllers/amountControllers.js";
import GeneralService from "../Services/generalService.js";
import GeneralControllers from "../Controllers/generalControllers.js";
import AmountService from "../Services/amountService.js";
//import auth from "../middleware/auth.js"


//get filtered
route.get("/filtered/:db", GeneralControllers.getFilteredGeneral)

//POST
route.post("/post", AmountControllers.postAmount);

//POST
route.post("/post-general/:db", GeneralControllers.postGeneral);

//POST new email/project
route.post("/newproject", AmountControllers.postNewEmail);

//POST new project without email (email optional)
route.post("/newproject-no-email", AmountControllers.postNewProjectNoEmail);

//POST new email/project
route.post("/add-to-existing-email", AmountControllers.postToExitingEmail);

//Get
route.post("/get", AmountControllers.getAmounts);

// 🔴 Get emails not connected to projects
route.get("/freeEmails", AmountControllers.getFreeEmails);

// 🟢 Get ACTIVE emails 
route.get("/activeEmails", AmountControllers.getActiveEmails)

//Get projects
route.get("/projects/:db", GeneralService.getMultipleFilteredService);

//Get payment
route.get("/payments", AmountControllers.getPayments);

//Patch
route.patch("/patch/:db", GeneralControllers.patch)

//Get entries by project (invoicing or payments)
route.get("/entries/:db", GeneralControllers.getByProject)

//Delete entry (soft delete)
route.delete("/delete/:db/:id", GeneralControllers.deleteEntry)

//Upload file and return pdf_file (for preserving original files)
route.post("/upload-file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    res.json({
      success: true,
      pdf_file: req.file.filename,
      original_name: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (err) {
    console.error("File upload error:", err);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

//Extract invoice data from uploaded file (OCR/GPT)
route.post("/extract", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
    
    let extractedText = "";
    
    if (mimeType === "application/pdf") {
      const fileBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(fileBuffer);
      extractedText = pdfData.text;
    } else if (mimeType.startsWith("image/")) {
      try {
        const Tesseract = await import("tesseract.js");
        const { data: { text } } = await Tesseract.recognize(filePath, "eng+nld", {
          logger: m => console.log(m)
        });
        extractedText = text;
      } catch (ocrErr) {
        console.warn("OCR failed:", ocrErr);
        return res.status(200).json({
          issuer: "",
          amount: null,
          btw: false,
          btwPercent: 21,
          extractionFailed: true,
          message: "OCR extraction failed. Please enter details manually."
        });
      }
    }
    
    if (!extractedText || extractedText.trim().length < 10) {
      return res.status(200).json({
        issuer: "",
        amount: null,
        btw: false,
        btwPercent: 21,
        extractionFailed: true,
        message: "Could not extract text from file. Please enter details manually."
      });
    }
    
    const analyzed = await analyze(extractedText, "upload");
    
    // Keep the file for preservation - return filename for linking
    res.status(200).json({
      issuer: analyzed.issuer || "",
      amount: analyzed.amount || null,
      btw: analyzed.btw || false,
      btwPercent: analyzed.btwPercent || 21,
      extractionFailed: false,
      pdf_file: req.file.filename
    });
    
  } catch (err) {
    console.error("Extract error:", err);
    
    // Keep the file even on error - user may still want to manually fill in details
    res.status(200).json({
      issuer: "",
      amount: null,
      btw: false,
      btwPercent: 21,
      extractionFailed: true,
      message: err.message || "Extraction failed. Please enter details manually.",
      pdf_file: req.file?.filename || null
    });
  }
});

//~ES5~ module.exports = route
export default route;