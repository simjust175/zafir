import fs from "fs";
import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DARK_BLUE = "#18578c";
const LIGHT_BLUE = "#3788bf";
const ROW_ALT_BG = "#eef6fc";

export async function createInvoicePdf({ projectName, groupedInvoices, groupedPayments, total }, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const doc = new PDFDocument({ margin: 40, bufferPages: true, size: 'a4' });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      const rowHeight = 25;
      const pageBottom = doc.page.height - 100;
      let currentY = 0;

      const addHeader = () => {
        doc.rect(0, 0, doc.page.width, 90).fill(DARK_BLUE);
        doc.fillColor("#fff")
          .font("Helvetica-Bold").fontSize(20).text("Zafir Totaal Projecten", 40, 35)
          .fontSize(12).text("Factuuroverzicht / Invoice Summary", 40, 60);

        const logoPath = path.resolve("public/logo.png");
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, doc.page.width - 100, 30, { width: 60 });
        }

        doc.fillColor("#000")
          .font("Helvetica").fontSize(12).text(`Project: ${projectName}`, 40, 110);

        currentY = 140;
      };

      const ensureSpace = (lines = 1) => {
        if (currentY + lines * rowHeight > pageBottom) {
          console.log("page added", pageBottom);
          doc.addPage();
          addHeader();
        }
      };

      const drawTableRow = (y, row, isHeader = false, isOdd = false, colWidths = []) => {
        const textY = y + 6;
        let x = 40;

        if (isHeader) {
          doc.rect(x, y - 2, 440, 22).fill(LIGHT_BLUE).fillColor("#fff");
        } else if (isOdd) {
          doc.rect(x, y - 2, 440, 22).fill(ROW_ALT_BG).fillColor("#000");
        }

        doc.font(isHeader ? "Helvetica-Bold" : "Helvetica").fontSize(10);
        for (let i = 0; i < row.length; i++) {
          const width = colWidths[i] || 100;
          doc.text(row[i], x + 10, textY, { width: width - 20, align: i === 0 ? "left" : "right" });
          x += width;
        }
      };

      // === Begin First Page ===
      addHeader();

      // === Invoices Section ===
      doc.font("Helvetica-Bold").fontSize(14).fillColor("#000").text("Invoices Overview", 40, currentY);
      currentY += 25;

      const invoiceColWidths = [160, 100, 80, 100];
      drawTableRow(currentY, ["Supplier", "Total", "Margin", "GrandTotal"], true, false, invoiceColWidths);
      currentY += rowHeight;

      groupedInvoices.forEach((inv, idx) => {
        ensureSpace(1);
        drawTableRow(currentY, [
          inv.issuer,
          `€${parseFloat(inv.totalAmount).toFixed(2)}`,
          `${parseFloat(inv.totalMargin).toFixed(1)}%`,
          `€${parseFloat(inv.totalWithMargin).toFixed(2)}`
        ], false, idx % 2 === 1, invoiceColWidths);
        currentY += rowHeight;
      });

      currentY += 10;
      ensureSpace(1);
      doc.font("Helvetica-Bold").fontSize(12)
        .text("Total Amount Invoiced:", 40, currentY)
        .text(`€${parseFloat(total).toFixed(2)}`, 400, currentY, { width: 80, align: "right" });
      currentY += 40;

      // === Payments Section ===
      ensureSpace(3);
      doc.font("Helvetica-Bold").fontSize(14).fillColor("#000").text("Payments Received", 40, currentY);
      currentY += 25;

      const paymentColWidths = [250, 190];
      drawTableRow(currentY, ["Date of payment", "Amount"], true, false, paymentColWidths);
      currentY += rowHeight;

      let totalPayments = 0;
      let showHeader = false;

      groupedPayments.forEach((payment, idx) => {
        ensureSpace(1);

        if (currentY === 140 && showHeader === false) {
          drawTableRow(currentY, ["Date of payment", "Amount"], true, false, paymentColWidths);
          currentY += rowHeight;
          showHeader = true;
        }

        const amount = parseFloat(payment.amount) || 0;
        totalPayments += amount;

        drawTableRow(currentY, [
          new Date(payment.created_on).toLocaleDateString(),
          `€${amount.toFixed(2)}`
        ], false, idx % 2 === 1, paymentColWidths);
        currentY += rowHeight;

        showHeader = false;
      });

      currentY += 10;
      doc.font("Helvetica-Bold").fontSize(12)
        .text("Total Payments Received:", 40, currentY)
        .text(`€${totalPayments.toFixed(2)}`, 400, currentY, { width: 80, align: "right" });

      // === Contact Info (only if enough space) ===
      currentY += 50;
      if (currentY + 100 < pageBottom) {
        doc.moveTo(40, currentY).lineTo(500, currentY).strokeColor("#aaaaaa").stroke();
        doc.font("Helvetica").fontSize(10).fillColor("#000")
          .text("ZAFIR TOTAAL PROJECTEN BVBA", 40, currentY + 10)
          .text("Lamorinierestraat 220", 40)
          .text("2018 Antwerpen", 40)
          .text("Tel. +32 484 50 45 65", 40)
          .text("E-mail: info@zafir.be", 40);
      }

      // === Footer + Pagination ===
      const pageRange = doc.bufferedPageRange();
      for (let i = 1; i < pageRange.count; i++) {
        console.log("📃📄added page", i);
        
        doc.switchToPage(i);
        const h = doc.page.height;

        doc.fontSize(9).fillColor("#ffffff")
          .rect(0, h - 30, doc.page.width, 30)
          .fill(DARK_BLUE)
          .fillColor("#ffffff")
          .text("Thank you for choosing Zafir Total Projects", 40, h - 20);
        // doc.font("Helvetica").fontSize(9).fillColor("gray")
        //   .text(`Page ${i + 1} of ${pageRange.count}`, doc.page.width - 100, h - 40, { align: "right" });
      }

      doc.end();

      stream.on("finish", () => {
        console.log("✅ PDF generation finished");
        resolve(outputPath);
      });

      stream.on("error", (err) => {
        console.error("❌ Stream error during PDF generation:", err);
        reject(err);
      });
    } catch (err) {
      console.error("❌ General error in PDF generation:", err);
      reject(err);
    }
  });
}
