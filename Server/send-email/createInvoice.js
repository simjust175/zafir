import fs from "fs";
import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";
import InvoiceCalculations from "./calculations/invoiceCalculations.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLORS = {
  primary: "#171717",
  secondary: "#404040",
  accent: "#171717",
  success: "#171717",
  warning: "#f59e0b",
  danger: "#ef4444",
  dark: "#0f0f0f",
  gray: "#737373",
  lightGray: "#e5e5e5",
  background: "#fafafa",
  white: "#ffffff"
};

const FONTS = {
  regular: "Helvetica",
  bold: "Helvetica-Bold",
  oblique: "Helvetica-Oblique"
};

const generateInvoiceNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${timestamp}${random}`;
};

function calculateCompanyTotals(invoices, projectMargin = 0) {
  const companyMap = new Map();
  
  invoices.forEach(invoice => {
    const issuer = invoice.issuer || invoice.company || 'Unknown';
    const amount = parseFloat(invoice.amount) || 0;
    const invoiceMargin = invoice.margin !== undefined ? parseFloat(invoice.margin) : projectMargin;
    
    if (!companyMap.has(issuer)) {
      companyMap.set(issuer, { 
        name: issuer, 
        count: 0, 
        subtotal: 0,
        total: 0
      });
    }
    
    const company = companyMap.get(issuer);
    company.count += 1;
    company.subtotal += amount;
    company.total += amount + (amount * invoiceMargin / 100);
  });
  
  return Array.from(companyMap.values());
}

export async function createInvoicePdf(data, outputPath) {
  const { projectName, groupedInvoices = [], groupedPayments = [], invoicingData = [], paymentsData = [], total, invoiceNumber, companyInfo, projectMargin = 0, totalInvoiced = 0, outstanding = 0 } = data;
  
  const calc = new InvoiceCalculations();
  
  return new Promise((resolve, reject) => {
    try {
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const doc = new PDFDocument({
        margin: 50,
        size: 'A4',
        bufferPages: true,
        info: {
          Title: `Invoice - ${projectName}`,
          Author: 'BILLIO Invoice System',
        }
      });

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const contentWidth = pageWidth - 100;
      const margin = 50;
      const headerHeight = 100;
      const footerHeight = 40;
      const contentTop = headerHeight + 30;
      const contentBottom = pageHeight - footerHeight - 20;
      
      let currentY = contentTop;

      const flatInvoices = groupedInvoices.flatMap(g => g.invoices || [g]);
      const processedInvoices = calc.processInvoiceData(flatInvoices);
      
      const processedData = calc.calculateInvoiceTotals(
        processedInvoices,
        { applyMargin: true, taxInclusive: true }
      );
      
      const paymentData = calc.calculatePaymentSummary(
        total || processedData.summary.grandTotal,
        groupedPayments
      );

      const drawHeader = (firstPage = false) => {
        doc.rect(0, 0, pageWidth, headerHeight).fill(COLORS.primary);
        doc.fillColor(COLORS.white).font(FONTS.bold).fontSize(26).text("INVOICE", margin, 35);
        
        if (firstPage) {
          doc.font(FONTS.regular).fontSize(10).text("SUMMARY STATEMENT", margin, 65, { characterSpacing: 1.5 });
          const rightX = pageWidth - margin - 120;
          doc.fillColor(COLORS.white).font(FONTS.regular).fontSize(9);
          const invoiceNum = invoiceNumber || `INV-${Date.now().toString().slice(-8)}`;
          const date = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
          doc.text(`Invoice: ${invoiceNum}`, rightX, 40);
          doc.text(`Date: ${date}`, rightX, 55);
          doc.text(`Project: ${projectName || "N/A"}`, rightX, 70, { width: 120 });
        }
        doc.fillColor(COLORS.dark);
      };

      const drawFooter = (pageNum, totalPages) => {
        const footerY = pageHeight - footerHeight;
        doc.rect(0, footerY, pageWidth, footerHeight).fill(COLORS.background);
        doc.fillColor(COLORS.gray).font(FONTS.regular).fontSize(8);
        const company = companyInfo || { name: "Your Company Name", email: "your@email.com" };
        doc.text(`${company.name} | ${company.email}`, margin, footerY + 15);
        doc.fillColor(COLORS.dark).font(FONTS.bold).text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin - 60, footerY + 15, { width: 60, align: 'right' });
      };

      const ensureSpace = (requiredHeight) => {
        if (currentY + requiredHeight > contentBottom) {
          doc.addPage();
          drawHeader(false);
          currentY = contentTop;
        }
      };

      const drawSectionTitle = (title, color = COLORS.primary) => {
        ensureSpace(40);
        doc.rect(margin, currentY, contentWidth, 28).fill(color);
        doc.fillColor(COLORS.white).font(FONTS.bold).fontSize(11).text(title.toUpperCase(), margin + 15, currentY + 8, { characterSpacing: 0.8 });
        currentY += 32;
      };

      const drawTableHeader = (columns, bgColor = COLORS.background) => {
        ensureSpace(28);
        doc.rect(margin, currentY, contentWidth, 24).fill(bgColor);
        let x = margin;
        doc.fillColor(COLORS.gray).font(FONTS.bold).fontSize(8);
        columns.forEach(col => {
          doc.text(col.label.toUpperCase(), x + 10, currentY + 8, { width: col.width - 20, align: col.align || 'left' });
          x += col.width;
        });
        currentY += 26;
      };

      const drawTableRow = (columns, values, isAlternate = false, isTotal = false, totalColor = COLORS.primary) => {
        ensureSpace(26);
        const rowHeight = 24;
        if (isTotal) doc.rect(margin, currentY, contentWidth, rowHeight).fill(totalColor);
        else if (isAlternate) doc.rect(margin, currentY, contentWidth, rowHeight).fill(COLORS.background);
        
        let x = margin;
        doc.fillColor(isTotal ? COLORS.white : COLORS.dark).font(isTotal ? FONTS.bold : FONTS.regular).fontSize(isTotal ? 10 : 9);
        columns.forEach((col, idx) => {
          doc.text(values[idx] || '', x + 10, currentY + 7, { width: col.width - 20, align: col.align || 'left' });
          x += col.width;
        });
        currentY += rowHeight;
      };

      const drawSummaryCard = (items, title = null) => {
        const cardHeight = items.length * 24 + (title ? 36 : 16);
        ensureSpace(cardHeight + 20);
        const boxWidth = 200;
        const boxX = margin + contentWidth - boxWidth;
        
        doc.rect(boxX, currentY, boxWidth, cardHeight).lineWidth(1).strokeColor(COLORS.lightGray).fillAndStroke(COLORS.white, COLORS.lightGray);
        let y = currentY + 12;
        if (title) {
          doc.fillColor(COLORS.dark).font(FONTS.bold).fontSize(10).text(title, boxX + 15, y);
          y += 24;
        }
        items.forEach((item, idx) => {
          const isLast = idx === items.length - 1;
          if (isLast) doc.rect(boxX + 8, y - 4, boxWidth - 16, 22).fill(COLORS.primary);
          doc.fillColor(isLast ? COLORS.white : COLORS.gray).font(isLast ? FONTS.bold : FONTS.regular).fontSize(isLast ? 10 : 9).text(item.label, boxX + 15, y);
          doc.fillColor(isLast ? COLORS.white : COLORS.dark).font(isLast ? FONTS.bold : FONTS.regular).fontSize(isLast ? 10 : 9).text(item.value, boxX + 15, y, { width: boxWidth - 30, align: 'right' });
          y += 22;
        });
        currentY += cardHeight + 15;
      };

      // Start Drawing Content
      drawHeader(true);

      // 1. Invoices Sent Section
      const allInvoicing = invoicingData.length > 0 ? invoicingData : groupedInvoices;
      if (allInvoicing.length > 0) {
        drawSectionTitle("Invoices Sent (Revenue)", COLORS.primary);
        const invoicingColumns = [
          { label: "Date", width: 140, align: "left" },
          { label: "Invoice #", width: 180, align: "left" },
          { label: "Amount", width: 175, align: "right" }
        ];
        drawTableHeader(invoicingColumns, "#fafafa");
        let invoicingTotal = 0;
        allInvoicing.forEach((inv, idx) => {
          const amount = Number(inv.amount) || 0;
          invoicingTotal += amount;
          drawTableRow(invoicingColumns, [
            inv.created_on ? new Date(inv.created_on).toLocaleDateString('en-GB') : 'N/A',
            inv.invoice_number || generateInvoiceNumber(),
            calc.formatCurrency(amount)
          ], idx % 2 === 1);
        });
        drawTableRow(invoicingColumns, ["TOTAL INVOICED", "", calc.formatCurrency(invoicingTotal)], false, true, COLORS.primary);
        currentY += 20;
      }

      // 2. Payments Received Section
      const allPayments = paymentsData.length > 0 ? paymentsData : groupedPayments;
      drawSectionTitle("Payments Received", COLORS.primary);
      const paymentColumns = [{ label: "Date", width: 250, align: "left" }, { label: "Amount", width: 245, align: "right" }];
      drawTableHeader(paymentColumns, "#fafafa");

      if (allPayments.length === 0) {
        ensureSpace(30);
        doc.fillColor(COLORS.gray).font(FONTS.oblique).fontSize(10).text("No payments recorded yet", margin + 15, currentY + 5);
        currentY += 30;
      } else {
        let paymentsTotal = 0;
        allPayments.forEach((payment, idx) => {
          const amount = Number(payment.amount || payment.payment_amount) || 0;
          paymentsTotal += amount;
          drawTableRow(paymentColumns, [
            payment.created_on ? new Date(payment.created_on).toLocaleDateString('en-GB') : 'N/A',
            calc.formatCurrency(amount)
          ], idx % 2 === 1);
        });
        drawTableRow(paymentColumns, ["TOTAL PAYMENTS", calc.formatCurrency(paymentsTotal)], false, true, COLORS.success);
      }
      currentY += 20;

      // 3. Breakdown Section
      const companyTotals = calculateCompanyTotals(flatInvoices, projectMargin);
      if (companyTotals.length > 0) {
        drawSectionTitle("Breakdown", COLORS.primary);
        const companyColumns = [{ label: "Supplier", width: 195, align: "left" }, { label: "Count", width: 180, align: "center" }, { label: "Total", width: 120, align: "right" }];
        drawTableHeader(companyColumns, "#fafafa");
        companyTotals.forEach((company, idx) => {
          drawTableRow(companyColumns, [company.name, company.count.toString(), calc.formatCurrency(company.subtotal)], idx % 2 === 1);
        });
        drawTableRow(companyColumns, ["TOTALS", "", calc.formatCurrency(paymentData.summary.invoiceTotal)], false, true, COLORS.primary);
        currentY += 20;
      }

      // 4. SUMMARY CARD (Moved to Bottom)
      drawSummaryCard([
        { label: "Total Invoiced", value: calc.formatCurrency(totalInvoiced) },
        { label: "Total Paid", value: calc.formatCurrency(paymentData.summary.totalPaid) },
        { label: "Balance Due", value: calc.formatCurrency(outstanding) }
      ], "Payment Summary");

      // 5. Payment Information Footer Box
      if (currentY + 70 < contentBottom) {
        currentY += 10;
        doc.rect(margin, currentY, contentWidth, 60).lineWidth(1).strokeColor(COLORS.lightGray).fillAndStroke(COLORS.background, COLORS.lightGray);
        doc.fillColor(COLORS.dark).font(FONTS.bold).fontSize(9).text("PAYMENT INFORMATION", margin + 15, currentY + 12);
        doc.font(FONTS.regular).fontSize(8).fillColor(COLORS.gray);
        const bankInfo = ["Bank: KBC Bank  |  IBAN: BE00 0000 0000 0000  |  BIC: KREDBEBB", "Reference: Please include invoice number when making payment"];
        let infoY = currentY + 28;
        bankInfo.forEach(line => { doc.text(line, margin + 15, infoY); infoY += 14; });
      }

      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);
        drawFooter(i + 1, range.count);
      }

      doc.end();
      stream.on("finish", () => resolve(outputPath));
    } catch (err) {
      reject(err);
    }
  });
}

export default createInvoicePdf;