<template>
  <div>
    <canvas
      id="invoice-chart"
      width="600"
      height="300"
      style="display: none;"
    />
    <v-tooltip
      location="top"
      open-delay="300"
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          :icon="print ? 'mdi-printer-outline' : 'mdi-download-outline'"
          @click="print ? handlePrint() : handleDownload()"
        />
      </template>
      <span>{{ print ? 'Print' : 'Download' }} summary </span>
    </v-tooltip>
  </div>
</template>

<script setup>
import { onMounted, watch } from "vue";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Chart from "chart.js/auto";

const props = defineProps({
  groupedInvoices: Array,
  total: Number,
  projectName: String,
  payments: { type: Array, default: () => [] },
  print: Boolean
});

// ===== TABLE DATA =====
const generateInvoiceSummary = () => {
  const tableData = props.groupedInvoices.map(group => [
    group.issuer,
    `€${group.totalAmount.toFixed(2)}`,
    `${group.totalMargin.toFixed(1)}%`,
    `€${group.totalWithMargin.toFixed(2)}`
  ]);
  const totalRow = ["TOTAL", "", "", `€${parseFloat(props.total).toFixed(2)}`];
  return { head: [["Supplier", "Total", "Margin %", "Total + Margin"]], body: [...tableData, totalRow] };
};

const generatePaymentsTable = () => {
  if (!props.payments.length) return null;
  const tableData = props.payments.map(p => [
    new Date(p.created_on).toLocaleDateString(),
    `€${parseFloat(p.amount).toFixed(2)}`,
  ]);

  // Calculate total payments
  const totalPayments = props.payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const totalRow = ["TOTAL", `€${totalPayments.toFixed(2)}`];
  return {
    head: [["Date", "Amount"]],
    body: [...tableData, totalRow]
  };
};

// ===== CHART =====
const renderChart = () => {
  const ctx = document.getElementById("invoice-chart");
  if (!ctx) return;
  const chartData = {
    labels: props.groupedInvoices.map(group => group.issuer),
    datasets: [{
      label: "Total(€)",
      data: props.groupedInvoices.map(group => group.totalWithMargin.toFixed(2)),
      backgroundColor: "rgba(63, 81, 181, 0.7)"
    }]
  };
  if (Chart.getChart(ctx)) Chart.getChart(ctx).destroy();
  new Chart(ctx, {
    type: "bar",
    data: chartData,
    options: {
      responsive: false,
      plugins: {
        legend: { display: false },
        title: { display: true, text: `Totals with Margin by Supplier`, font: { size: 16 } }
      },
      scales: {
        y: { beginAtZero: true, ticks: { callback: v => `€${v}` } }
      }
    }
  });
};

onMounted(renderChart);
watch(() => props.groupedInvoices, renderChart, { deep: true });

// ===== HEADER & FOOTER =====
const drawFooter = (doc, pageHeight) => {
  const footerHeight = 12;
  const y = pageHeight - footerHeight;
  doc.setFillColor(63, 81, 181);
  doc.rect(0, y, doc.internal.pageSize.getWidth(), footerHeight, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text("Thank you for choosing Zafir total projects", 14, y + 8);
};

const drawHeader = async (doc) => {
  try {
    const logo = await loadImage("/logo.png");
    doc.addImage(logo, "PNG", 14, 10, 30, 20);
  } catch {
    console.warn("Logo not found or failed to load");
  }
  doc.setFontSize(16);
  doc.setTextColor(33, 33, 33);
  doc.text(`Invoice Summary for ${props.projectName}`, 50, 20);
};

const drawCompanyInfo = (doc, yStart) => {
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  [
    "ZAFIR TOTAAL PROJECTEN BVBA",
    "Lamorinierestraat 220",
    "2018 Antwerpen",
    "Tel. +324 84 50 45 65",
    "E-mail info@zafir.be"
  ].forEach((line, i) => doc.text(line, 14, yStart + i * 5));
};

const loadImage = (url) => new Promise((resolve, reject) => {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext("2d").drawImage(img, 0, 0);
    resolve(canvas.toDataURL("image/png"));
  };
  img.onerror = reject;
});

// ===== PDF GENERATOR =====
const buildPdf = async () => {
  const doc = new jsPDF();
  await drawHeader(doc);

  // Invoice summary table
  const invoiceData = generateInvoiceSummary();
  autoTable(doc, { head: invoiceData.head, body: invoiceData.body, startY: 35, theme: "grid", didDrawPage: () => drawFooter(doc, doc.internal.pageSize.getHeight()) });

  let bottomY = doc.lastAutoTable.finalY + 10;

  // Payments table (if exists)
  const paymentsData = generatePaymentsTable();
  if (paymentsData) {
    doc.setFontSize(14);
    doc.text("Payments", 14, bottomY + 5);
    autoTable(doc, { head: paymentsData.head, body: paymentsData.body, startY: bottomY + 10, theme: "striped" });
    bottomY = doc.lastAutoTable.finalY + 10;
  }

  drawCompanyInfo(doc, bottomY);

  // Chart page
  await new Promise(res => setTimeout(res, 300));
  const canvas = document.getElementById("invoice-chart");
  if (canvas) {
    const chartImage = canvas.toDataURL("image/png", 1.0);
    doc.addPage();
    await drawHeader(doc);
    //drawFooter(doc, doc.internal.pageSize.getHeight());
    doc.setFontSize(14);
    //doc.text("Visual Breakdown", 14, 20);
    doc.addImage(chartImage, "PNG", 10, 30, 190, 80);
    drawCompanyInfo(doc, 120);
  }

  return doc;
};

// ===== ACTIONS =====
const handleDownload = async () => {
  const doc = await buildPdf();
  doc.save(`invoice-summary-${props.projectName}.pdf`);
};

const handlePrint = async () => {
  const doc = await buildPdf();
  const blob = doc.output("blob");
  const blobUrl = URL.createObjectURL(blob);
  const win = window.open(blobUrl);
  if (win) {
    win.onload = () => {
      win.focus();
      win.print();
    };
  }
};
</script>

<style scoped>
#invoice-chart {
  display: none;
}
</style>