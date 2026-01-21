import Decimal from 'decimal.js';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export class InvoiceCalculations {
  constructor(currency = 'EUR', locale = 'nl-BE') {
    this.currency = currency;
    this.locale = locale;
  }

  toDecimal(value) {
    if (value === null || value === undefined || value === '') return new Decimal(0);
    if (value instanceof Decimal) return value;
    return new Decimal(String(value).replace(',', '.') || 0);
  }

  calculateLineTotal(amount, quantity = 1, discountPercent = 0) {
    const baseAmount = this.toDecimal(amount);
    const qty = this.toDecimal(quantity);
    const discount = this.toDecimal(discountPercent);
    
    const subtotal = baseAmount.times(qty);
    const discountAmount = subtotal.times(discount).dividedBy(100);
    return subtotal.minus(discountAmount);
  }

  calculateTax(amount, taxPercent, inclusive = false) {
    const baseAmount = this.toDecimal(amount);
    const taxRate = this.toDecimal(taxPercent).dividedBy(100);
    
    if (inclusive) {
      const divisor = new Decimal(1).plus(taxRate);
      const netAmount = baseAmount.dividedBy(divisor);
      const taxAmount = baseAmount.minus(netAmount);
      return {
        netAmount: netAmount.toDecimalPlaces(2),
        taxAmount: taxAmount.toDecimalPlaces(2),
        grossAmount: baseAmount.toDecimalPlaces(2)
      };
    } else {
      const taxAmount = baseAmount.times(taxRate);
      const grossAmount = baseAmount.plus(taxAmount);
      return {
        netAmount: baseAmount.toDecimalPlaces(2),
        taxAmount: taxAmount.toDecimalPlaces(2),
        grossAmount: grossAmount.toDecimalPlaces(2)
      };
    }
  }

  calculateMargin(amount, marginPercent) {
    const baseAmount = this.toDecimal(amount);
    const margin = this.toDecimal(marginPercent).dividedBy(100);
    const marginAmount = baseAmount.times(margin);
    const totalWithMargin = baseAmount.plus(marginAmount);
    
    return {
      baseAmount: baseAmount.toDecimalPlaces(2),
      marginPercent: this.toDecimal(marginPercent).toDecimalPlaces(2),
      marginAmount: marginAmount.toDecimalPlaces(2),
      totalWithMargin: totalWithMargin.toDecimalPlaces(2)
    };
  }

  calculateInvoiceTotals(invoices = [], options = {}) {
    const { applyMargin = true, taxInclusive = true, defaultTaxRate = 21 } = options;
    
    let subtotal = new Decimal(0);
    let totalTax = new Decimal(0);
    let totalMargin = new Decimal(0);
    let grandTotal = new Decimal(0);

    const processedInvoices = invoices.map(inv => {
      const amount = this.toDecimal(inv.amount || inv.totalAmount || 0);
      const marginPercent = this.toDecimal(inv.margin || inv.totalMargin || 0);
      const taxPercent = this.toDecimal(inv.btwPercent || defaultTaxRate);
      const includesBtw = inv.includesBtw !== false;
      
      let netAmount, taxAmount, grossBeforeMargin;
      
      if (includesBtw) {
        const taxCalc = this.calculateTax(amount, taxPercent, true);
        netAmount = taxCalc.netAmount;
        taxAmount = taxCalc.taxAmount;
        grossBeforeMargin = amount;
      } else {
        const taxCalc = this.calculateTax(amount, taxPercent, false);
        netAmount = taxCalc.netAmount;
        taxAmount = taxCalc.taxAmount;
        grossBeforeMargin = taxCalc.grossAmount;
      }

      let marginAmount = new Decimal(0);
      let finalTotal = grossBeforeMargin;

      if (applyMargin && marginPercent.greaterThan(0)) {
        const marginCalc = this.calculateMargin(grossBeforeMargin, marginPercent);
        marginAmount = marginCalc.marginAmount;
        finalTotal = marginCalc.totalWithMargin;
      }

      subtotal = subtotal.plus(netAmount);
      totalTax = totalTax.plus(taxAmount);
      totalMargin = totalMargin.plus(marginAmount);
      grandTotal = grandTotal.plus(finalTotal);

      return {
        ...inv,
        calculated: {
          netAmount: netAmount.toDecimalPlaces(2),
          taxAmount: taxAmount.toDecimalPlaces(2),
          marginAmount: marginAmount.toDecimalPlaces(2),
          finalTotal: finalTotal.toDecimalPlaces(2)
        }
      };
    });

    return {
      invoices: processedInvoices,
      summary: {
        subtotal: subtotal.toDecimalPlaces(2),
        totalTax: totalTax.toDecimalPlaces(2),
        totalMargin: totalMargin.toDecimalPlaces(2),
        grandTotal: grandTotal.toDecimalPlaces(2)
      }
    };
  }

  calculatePaymentSummary(invoiceTotal, payments = []) {
    const total = this.toDecimal(invoiceTotal);
    let totalPaid = new Decimal(0);

    const processedPayments = payments.map(payment => {
      const amount = this.toDecimal(payment.amount || payment.payment_amount);
      totalPaid = totalPaid.plus(amount);
      return {
        ...payment,
        formattedAmount: this.formatCurrency(amount)
      };
    });

    const balanceDue = total.minus(totalPaid);
    const isPaid = balanceDue.lessThanOrEqualTo(0);
    const overpayment = balanceDue.lessThan(0) ? balanceDue.abs() : new Decimal(0);

    return {
      payments: processedPayments,
      summary: {
        invoiceTotal: total.toDecimalPlaces(2),
        totalPaid: totalPaid.toDecimalPlaces(2),
        balanceDue: balanceDue.toDecimalPlaces(2),
        isPaid,
        overpayment: overpayment.toDecimalPlaces(2)
      }
    };
  }

  formatCurrency(value, showSymbol = true) {
    const amount = this.toDecimal(value);
    const formatted = amount.toDecimalPlaces(2).toNumber().toLocaleString(this.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return showSymbol ? `€${formatted}` : formatted;
  }

  groupInvoicesByIssuer(invoices = []) {
    const groups = {};
    
    invoices.forEach(inv => {
      const issuer = inv.issuer || 'Unknown';
      if (!groups[issuer]) {
        groups[issuer] = {
          issuer,
          invoices: [],
          totalAmount: new Decimal(0),
          totalWithMargin: new Decimal(0)
        };
      }
      
      const amount = this.toDecimal(inv.amount || inv.totalAmount || 0);
      const margin = this.toDecimal(inv.margin || inv.totalMargin || 0);
      const existingWithMargin = this.toDecimal(inv.totalWithMargin || 0);
      
      let withMargin;
      if (existingWithMargin.greaterThan(0)) {
        withMargin = existingWithMargin;
      } else {
        withMargin = amount.plus(amount.times(margin).dividedBy(100));
      }
      
      groups[issuer].invoices.push(inv);
      groups[issuer].totalAmount = groups[issuer].totalAmount.plus(amount);
      groups[issuer].totalWithMargin = groups[issuer].totalWithMargin.plus(withMargin);
    });

    return Object.values(groups).map(group => ({
      ...group,
      totalAmount: group.totalAmount.toDecimalPlaces(2).toString(),
      totalWithMargin: group.totalWithMargin.toDecimalPlaces(2).toString(),
      formattedTotal: this.formatCurrency(group.totalWithMargin)
    }));
  }

  processInvoiceData(groupedInvoices = []) {
    return groupedInvoices.map(inv => {
      const amount = this.toDecimal(inv.amount || inv.totalAmount || 0);
      const margin = this.toDecimal(inv.margin || inv.totalMargin || 0);
      const existingWithMargin = this.toDecimal(inv.totalWithMargin || 0);
      
      let totalWithMargin;
      if (existingWithMargin.greaterThan(0)) {
        totalWithMargin = existingWithMargin;
      } else {
        totalWithMargin = amount.plus(amount.times(margin).dividedBy(100));
      }
      
      return {
        ...inv,
        amount: amount.toDecimalPlaces(2),
        margin: margin.toDecimalPlaces(2),
        totalWithMargin: totalWithMargin.toDecimalPlaces(2),
        formattedAmount: this.formatCurrency(amount),
        formattedTotal: this.formatCurrency(totalWithMargin)
      };
    });
  }
}

export default InvoiceCalculations;
