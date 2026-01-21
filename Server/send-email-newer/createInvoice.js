import fs from "fs";
import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";
import InvoiceCalculations from "./calculations/invoiceCalculations.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLORS = {
  primary: "#1a365d",
  secondary: "#2b6cb0",
  accent: "#3182ce",
  success: "#38a169",
  warning: "#d69e2e",
  danger: "#e53e3e",
  dark: "#1a202c",
  gray: "#718096",
  lightGray: "#e2e8f0",
  background: "#f7fafc",
  white: "#ffffff"
};

const FONTS = {
  regular: "Helvetica",
  bold: "Helvetica-Bold",
  oblique: "Helvetica-Oblique"
};

export async function createInvoicePdf(data, outputPath) {
  const { projectName, groupedInvoices = [], groupedPayments = [], total, invoiceNumber, companyInfo } = data;
  
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
          Subject: `Invoice Summary for ${projectName}`,
          Keywords: 'invoice, billing, payment'
        }
      });

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const contentWidth = pageWidth - 100;
      const margin = 50;
      const headerHeight = 140;
      const footerHeight = 60;
      const contentTop = headerHeight + 20;
      const contentBottom = pageHeight - footerHeight - 30;
      
      let currentY = contentTop;
      let pageNumber = 1;

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

      const drawHeader = (isFirstPage = false) => {
        doc.rect(0, 0, pageWidth, headerHeight).fill(COLORS.primary);
        doc.rect(0, headerHeight - 4, pageWidth, 4).fill(COLORS.accent);
        
        doc.fillColor(COLORS.white)
           .font(FONTS.bold)
           .fontSize(28)
           .text("INVOICE", margin, 35);
        
        doc.font(FONTS.regular)
           .fontSize(10)
           .text("SUMMARY STATEMENT", margin, 68, { characterSpacing: 2 });
        
        if (isFirstPage) {
          const rightX = pageWidth - margin - 150;
          doc.fillColor(COLORS.white)
             .font(FONTS.regular)
             .fontSize(9);
          
          const invoiceNum = invoiceNumber || `INV-${Date.now().toString().slice(-8)}`;
          const date = new Date().toLocaleDateString('nl-BE', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
          
          doc.text("Invoice Number:", rightX, 40)
             .font(FONTS.bold)
             .text(invoiceNum, rightX + 85, 40);
          
          doc.font(FONTS.regular)
             .text("Date:", rightX, 55)
             .font(FONTS.bold)
             .text(date, rightX + 85, 55);
          
          doc.font(FONTS.regular)
             .text("Project:", rightX, 70)
             .font(FONTS.bold)
             .text(projectName || "N/A", rightX + 85, 70, { width: 100 });
        }
        
        doc.fillColor(COLORS.dark);
      };

      const drawFooter = () => {
        const footerY = pageHeight - footerHeight;
        
        doc.rect(0, footerY, pageWidth, footerHeight).fill(COLORS.background);
        doc.moveTo(0, footerY).lineTo(pageWidth, footerY).strokeColor(COLORS.lightGray).lineWidth(1).stroke();
        
        doc.fillColor(COLORS.gray)
           .font(FONTS.regular)
           .fontSize(8);
        
        const company = companyInfo || {
          name: process.env.COMPANY_NAME || "Your Company Name",
          address: process.env.COMPANY_ADDRESS || "Your Address",
          phone: process.env.COMPANY_PHONE || "Your Phone",
          email: process.env.COMPANY_EMAIL || "your@email.com"
        };
        
        doc.text(company.name, margin, footerY + 15)
           .text(`${company.address} | ${company.phone} | ${company.email}`, margin, footerY + 28);
        
        doc.text(`Page ${pageNumber}`, pageWidth - margin - 50, footerY + 22, { 
          width: 50, 
          align: 'right' 
        });
      };

      const ensureSpace = (requiredHeight) => {
        if (currentY + requiredHeight > contentBottom) {
          drawFooter();
          doc.addPage();
          pageNumber++;
          drawHeader(false);
          currentY = contentTop;
        }
      };

      const drawSectionTitle = (title, icon = null) => {
        ensureSpace(40);
        
        doc.rect(margin, currentY, contentWidth, 30)
           .fill(COLORS.secondary);
        
        doc.fillColor(COLORS.white)
           .font(FONTS.bold)
           .fontSize(11)
           .text(title.toUpperCase(), margin + 15, currentY + 9, { characterSpacing: 1 });
        
        currentY += 35;
      };

      const drawTableHeader = (columns) => {
        ensureSpace(30);
        
        doc.rect(margin, currentY, contentWidth, 25).fill(COLORS.background);
        doc.moveTo(margin, currentY + 25)
           .lineTo(margin + contentWidth, currentY + 25)
           .strokeColor(COLORS.lightGray)
           .lineWidth(1)
           .stroke();
        
        let x = margin;
        doc.fillColor(COLORS.gray).font(FONTS.bold).fontSize(9);
        
        columns.forEach(col => {
          doc.text(col.label, x + 8, currentY + 8, { 
            width: col.width - 16, 
            align: col.align || 'left' 
          });
          x += col.width;
        });
        
        currentY += 28;
      };

      const drawTableRow = (columns, values, isAlternate = false, isTotal = false) => {
        ensureSpace(28);
        
        const rowHeight = 25;
        
        if (isTotal) {
          doc.rect(margin, currentY, contentWidth, rowHeight).fill(COLORS.primary);
        } else if (isAlternate) {
          doc.rect(margin, currentY, contentWidth, rowHeight).fill(COLORS.background);
        }
        
        let x = margin;
        doc.fillColor(isTotal ? COLORS.white : COLORS.dark)
           .font(isTotal ? FONTS.bold : FONTS.regular)
           .fontSize(isTotal ? 10 : 9);
        
        columns.forEach((col, idx) => {
          const value = values[idx] || '';
          doc.text(value, x + 8, currentY + 7, { 
            width: col.width - 16, 
            align: col.align || 'left' 
          });
          x += col.width;
        });
        
        if (!isTotal && !isAlternate) {
          doc.moveTo(margin, currentY + rowHeight)
             .lineTo(margin + contentWidth, currentY + rowHeight)
             .strokeColor(COLORS.lightGray)
             .lineWidth(0.5)
             .stroke();
        }
        
        currentY += rowHeight;
      };

      const drawSummaryBox = (items, title = null) => {
        ensureSpace(items.length * 25 + 60);
        
        const boxWidth = 220;
        const boxX = margin + contentWidth - boxWidth;
        const boxHeight = items.length * 25 + (title ? 35 : 10);
        
        doc.rect(boxX, currentY, boxWidth, boxHeight)
           .fillAndStroke(COLORS.background, COLORS.lightGray);
        
        let y = currentY + 10;
        
        if (title) {
          doc.fillColor(COLORS.dark)
             .font(FONTS.bold)
             .fontSize(10)
             .text(title, boxX + 15, y);
          y += 25;
        }
        
        items.forEach((item, idx) => {
          const isLast = idx === items.length - 1;
          
          doc.fillColor(isLast ? COLORS.primary : COLORS.gray)
             .font(isLast ? FONTS.bold : FONTS.regular)
             .fontSize(isLast ? 11 : 9)
             .text(item.label, boxX + 15, y);
          
          doc.fillColor(isLast ? COLORS.primary : COLORS.dark)
             .font(isLast ? FONTS.bold : FONTS.regular)
             .fontSize(isLast ? 11 : 9)
             .text(item.value, boxX + 15, y, { 
               width: boxWidth - 30, 
               align: 'right' 
             });
          
          y += 22;
        });
        
        currentY += boxHeight + 15;
      };

      const drawStatusBadge = (status, x, y) => {
        const colors = {
          paid: COLORS.success,
          partial: COLORS.warning,
          unpaid: COLORS.danger
        };
        
        const color = colors[status] || COLORS.gray;
        const label = status.toUpperCase();
        
        const badgeWidth = 60;
        const badgeHeight = 18;
        
        doc.roundedRect(x, y, badgeWidth, badgeHeight, 3).fill(color);
        doc.fillColor(COLORS.white)
           .font(FONTS.bold)
           .fontSize(7)
           .text(label, x, y + 5, { width: badgeWidth, align: 'center' });
      };

      drawHeader(true);

      drawSectionTitle("Invoices Overview");
      
      const invoiceColumns = [
        { label: "Supplier", width: 200, align: "left" },
        { label: "Amount", width: 100, align: "right" },
        { label: "Margin", width: 80, align: "right" },
        { label: "Total", width: 115, align: "right" }
      ];
      
      drawTableHeader(invoiceColumns);

      const groupedData = calc.groupInvoicesByIssuer(processedInvoices);

      groupedData.forEach((group, idx) => {
        const amount = calc.toDecimal(group.totalAmount);
        const totalWithMargin = calc.toDecimal(group.totalWithMargin);
        const marginPercent = totalWithMargin.greaterThan(0) && amount.greaterThan(0) 
          ? totalWithMargin.minus(amount).dividedBy(amount).times(100).toDecimalPlaces(1)
          : calc.toDecimal(0);
        
        drawTableRow(invoiceColumns, [
          group.issuer,
          calc.formatCurrency(amount),
          `${marginPercent}%`,
          calc.formatCurrency(totalWithMargin)
        ], idx % 2 === 1);
      });

      currentY += 10;
      drawSummaryBox([
        { label: "Subtotal", value: calc.formatCurrency(processedData.summary.subtotal) },
        { label: "Tax (BTW)", value: calc.formatCurrency(processedData.summary.totalTax) },
        { label: "Margin", value: calc.formatCurrency(processedData.summary.totalMargin) },
        { label: "Total Amount", value: calc.formatCurrency(processedData.summary.grandTotal) }
      ], "Invoice Summary");

      currentY += 15;
      drawSectionTitle("Payments Received");
      
      const paymentColumns = [
        { label: "Date", width: 150, align: "left" },
        { label: "Reference", width: 200, align: "left" },
        { label: "Amount", width: 145, align: "right" }
      ];
      
      drawTableHeader(paymentColumns);

      if (groupedPayments.length === 0) {
        ensureSpace(30);
        doc.fillColor(COLORS.gray)
           .font(FONTS.oblique)
           .fontSize(10)
           .text("No payments recorded yet", margin + 15, currentY);
        currentY += 30;
      } else {
        groupedPayments.forEach((payment, idx) => {
          const date = new Date(payment.created_on || payment.date).toLocaleDateString('nl-BE');
          const ref = payment.reference || '-';
          const amount = calc.formatCurrency(payment.amount || payment.payment_amount);
          
          drawTableRow(paymentColumns, [date, ref, amount], idx % 2 === 1);
        });
      }

      currentY += 10;
      
      const status = paymentData.summary.isPaid 
        ? 'paid' 
        : paymentData.summary.totalPaid.greaterThan(0) 
          ? 'partial' 
          : 'unpaid';

      drawSummaryBox([
        { label: "Total Invoiced", value: calc.formatCurrency(paymentData.summary.invoiceTotal) },
        { label: "Total Paid", value: calc.formatCurrency(paymentData.summary.totalPaid) },
        { label: "Balance Due", value: calc.formatCurrency(paymentData.summary.balanceDue) }
      ], "Payment Summary");

      if (currentY + 100 < contentBottom) {
        currentY += 20;
        
        doc.rect(margin, currentY, contentWidth, 80)
           .fillAndStroke(COLORS.background, COLORS.lightGray);
        
        doc.fillColor(COLORS.dark)
           .font(FONTS.bold)
           .fontSize(9)
           .text("PAYMENT INFORMATION", margin + 15, currentY + 12);
        
        doc.font(FONTS.regular)
           .fontSize(8)
           .fillColor(COLORS.gray);
        
        const bankInfo = [
          "Bank: KBC Bank",
          "IBAN: BE00 0000 0000 0000",
          "BIC: KREDBEBB",
          "Reference: Please include invoice number"
        ];
        
        let infoY = currentY + 28;
        bankInfo.forEach(line => {
          doc.text(line, margin + 15, infoY);
          infoY += 12;
        });
        
        currentY += 90;
      }

      if (currentY + 60 < contentBottom) {
        currentY += 15;
        
        doc.fillColor(COLORS.gray)
           .font(FONTS.oblique)
           .fontSize(8)
           .text(
             "Thank you for your business. Payment is due within 30 days of invoice date. " +
             "For questions regarding this invoice, please contact us at info@zafir.be.",
             margin,
             currentY,
             { width: contentWidth, align: 'center' }
           );
      }

      const range = doc.bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);
        pageNumber = i + 1;
        drawFooter();
      }

      doc.end();

      stream.on("finish", () => {
        console.log("PDF generated successfully:", outputPath);
        resolve(outputPath);
      });

      stream.on("error", (err) => {
        console.error("Stream error:", err);
        reject(err);
      });

    } catch (err) {
      console.error("PDF generation error:", err);
      reject(err);
    }
  });
}

export default createInvoicePdf;
