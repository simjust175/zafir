
<!-- eslint-disable vue/no-template-shadow -->
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
          @click="checkBeforeAction"
        />
      </template>
      <span>{{ print ? 'Print' : 'Download' }} summary</span>
    </v-tooltip>

    <!-- ⚠️ Warning Confirmation Dialog -->
    <v-dialog
      v-model="warningDialog"
      max-width="450"
    >
      <v-card
        rounded="xl"
        class="pa-4"
      >
        <v-card-title class="text-h6 font-weight-bold text-warning-darken-2">
          ⚠️ Not all invoices are double-checked
        </v-card-title>
        <v-card-text class="text-body-2 text-grey-darken-2">
          Some invoices have not been double-checked yet.
          Are you sure you want to continue {{ print ? 'printing' : 'downloading' }} this summary?
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            text
            @click="warningDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="warning"
            @click="forceContinue"
          >
            Yes, Continue
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<!-- eslint-disable vue/require-default-prop -->
<script setup>
import { onMounted, watch, ref } from "vue";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Chart from "chart.js/auto";

const props = defineProps({
  groupedInvoices: Array,
  total: Number,
  projectName: String,
  payments: { type: Array, default: () => [] },
  print: Boolean,
  doubleChecked: Boolean,
});

const warningDialog = ref(false);
let pendingAction = null;
let chartInstance = null;

// ===== CHECK BEFORE ACTION =====
const checkBeforeAction = () => {
  if (!props.doubleChecked) {
    warningDialog.value = true;
    pendingAction = props.print ? "print" : "download";
  } else {
    props.print ? handlePrint() : handleDownload();
  }
};

const forceContinue = () => {
  warningDialog.value = false;
  if (pendingAction === "print") handlePrint();
  else handleDownload();
  pendingAction = null;
};

// ===== CHART =====
const renderChart = () => {
  const ctx = document.getElementById("invoice-chart");
  if (!ctx || !Array.isArray(props.groupedInvoices)) return;

  const labels = props.groupedInvoices.map((group) => group.issuer || "Unknown");
  const data = props.groupedInvoices.map((group) =>
    typeof group.totalWithMargin === "number"
      ? parseFloat(group.totalWithMargin.toFixed(2))
      : 0
  );

  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Total (€)",
          data,
          backgroundColor: "rgba(63, 81, 181, 0.7)",
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Totals with Margin by Supplier",
          font: { size: 16 },
          color: "#3f51b5",
        },
      },
      scales: {
        y: { beginAtZero: true, ticks: { callback: (v) => `€${v}` } },
        x: { ticks: { color: "#3f51b5" } },
      },
    },
  });
};

onMounted(() => renderChart());
watch(() => props.groupedInvoices, renderChart, { deep: true });

// ===== HELPERS =====
const formatCurrency = (amount) => {
  const num = typeof amount === "number" ? amount : parseFloat(amount);
  return isNaN(num)
    ? "€0.00"
    : `€${num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
};

// ===== PDF GENERATOR =====
const buildPdf = async () => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.setTextColor(33, 33, 33);
  doc.text(`Invoice Summary for ${props.projectName || "Unnamed Project"}`, 14, 20);

  const invoiceData = Array.isArray(props.groupedInvoices)
    ? props.groupedInvoices.map((group) => [
        group.issuer || "Unknown",
        formatCurrency(group.totalAmount),
        `${typeof group.totalMargin === "number" ? group.totalMargin.toFixed(1) : "0.0"}%`,
        formatCurrency(group.totalWithMargin),
      ])
    : [];

  const totalRow = [
    {
      content: "TOTAL (All Suppliers)",
      colSpan: 3,
      styles: { halign: "right", fontStyle: "bold" },
    },
    formatCurrency(props.total),
  ];

  autoTable(doc, {
    theme: "grid",
    headStyles: {
      fillColor: [63, 81, 181],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      fontSize: 10,
      textColor: [33, 33, 33],
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    styles: {
      cellPadding: 4,
    },
    head: [["Supplier", "Total", "Margin %", "Total + Margin"]],
    body: [...invoiceData, totalRow],
    startY: 30,
    didDrawPage: () => drawFooter(doc, doc.internal.pageSize.getHeight()),
  });

  let bottomY = doc.lastAutoTable.finalY + 15;

  if (Array.isArray(props.payments) && props.payments.length) {
    doc.setFontSize(14);
    doc.setTextColor(33, 33, 33);
    doc.text("Payments", 14, bottomY);

    const paymentsData = props.payments.map((p) => [
      new Date(p.created_on).toLocaleDateString(),
      formatCurrency(p.amount),
    ]);

    const totalPayments = props.payments.reduce(
      (sum, p) => sum + (typeof p.amount === "number" ? p.amount : parseFloat(p.amount || 0)),
      0
    );

    const totalPaymentsRow = [
      { content: "TOTAL Payments", styles: { halign: "right", fontStyle: "bold" } },
      formatCurrency(totalPayments),
    ];

    autoTable(doc, {
      head: [["Date", "Amount"]],
      body: [...paymentsData, totalPaymentsRow],
      startY: bottomY + 5,
    });

    bottomY = doc.lastAutoTable.finalY + 15;
  }

  drawCompanyInfo(doc, bottomY);

  await new Promise((res) => setTimeout(res, 300));
  const canvas = document.getElementById("invoice-chart");
  if (canvas) {
    canvas.style.display = "block"; // temporarily show canvas
    const chartImage = canvas.toDataURL("image/png", 1.0);
    canvas.style.display = "none"; // hide again

    doc.addPage();
    doc.setFontSize(16);
    doc.text("Visual Summary of Totals", 14, 20);
    doc.addImage(chartImage, "PNG", 10, 30, 190, 80);
    drawCompanyInfo(doc, 120);
    drawFooter(doc, doc.internal.pageSize.getHeight());
  }

  return doc;
};

// ===== FOOTER & INFO =====
const drawFooter = (doc, pageHeight) => {
  const y = pageHeight - 12;
  doc.setFillColor(63, 81, 181);
  doc.rect(0, y, doc.internal.pageSize.getWidth(), 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.text("Thank you for choosing Zafir Total Projects", 14, y + 8);
  doc.setTextColor(180, 180, 180);
  doc.setFontSize(6);
  doc.setFont(undefined, "italic");
  doc.text("Powered by Dreamware", doc.internal.pageSize.getWidth() - 50, pageHeight - 2);
};

const drawCompanyInfo = (doc, yStart) => {
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  [
    "ZAFIR TOTAAL PROJECTEN BVBA",
    "Lamorinierestraat 220",
    "2018 Antwerpen",
    "Tel. +324 84 50 45 65",
    "E-mail info@zafir.be",
  ].forEach((line, i) => doc.text(line, 14, yStart + i * 5));
};

// ===== ACTIONS =====
const handleDownload = async () => {
  const doc = await buildPdf();
  doc.save(`invoice-summary-${props.projectName || "project"}.pdf`);
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
  } else {
    console.warn("Popup blocked. Please allow popups to print.");
  }
};
</script>


<style scoped>
#invoice-chart {
  display: none;
}
</style>