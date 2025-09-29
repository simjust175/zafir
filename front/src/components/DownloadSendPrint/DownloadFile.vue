
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

// ===== CHECK BEFORE ACTION =====
const checkBeforeAction = () => {
  if (!props.doubleChecked) {
    warningDialog.value = true;
    pendingAction = props.print ? "print" : "download";
  } else {
    props.print ? handlePrint() : handleDownload();
  }
};

// ===== Force continue after warning =====
const forceContinue = () => {
  warningDialog.value = false;
  if (pendingAction === "print") {
    handlePrint();
  } else {
    handleDownload();
  }
  pendingAction = null;
};

// ===== CHART =====
const renderChart = () => {
  const ctx = document.getElementById("invoice-chart");
  if (!ctx) return;
  const chartData = {
    labels: props.groupedInvoices.map((group) => group.issuer),
    datasets: [
      {
        label: "Total (€)",
        data: props.groupedInvoices.map((group) =>
          group.totalWithMargin.toFixed(2)
        ),
        backgroundColor: "rgba(63, 81, 181, 0.7)", // Indigo
      },
    ],
  };
  if (Chart.getChart(ctx)) Chart.getChart(ctx).destroy();
  new Chart(ctx, {
    type: "bar",
    data: chartData,
    options: {
      responsive: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: `Totals with Margin by Supplier`,
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
onMounted(()=> renderChart());
watch(() => props.groupedInvoices, renderChart, { deep: true });

// ===== FOOTER =====
const drawFooter = (doc, pageHeight) => {
  const footerHeight = 12;
  const y = pageHeight - footerHeight;

  // Indigo footer bar
  doc.setFillColor(63, 81, 181);
  doc.rect(0, y, doc.internal.pageSize.getWidth(), footerHeight, "F");

  // White footer text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont(undefined, "normal");
  doc.text("Thank you for choosing Zafir Total Projects", 14, y + 8);

  // Very small Powered by Dreamware bottom-right
  doc.setTextColor(180, 180, 180);
  doc.setFontSize(6);
  doc.setFont(undefined, "italic");
  doc.text(
    "Powered by Dreamware",
    doc.internal.pageSize.getWidth() - 50,
    pageHeight - 2
  );
};

// ===== COMPANY INFO =====
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

// ===== HELPERS =====
const formatCurrency = (amount) =>
  `€${parseFloat(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const tableStyles = {
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
};

// ===== PDF GENERATOR =====
const buildPdf = async () => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(16);
  doc.setTextColor(33, 33, 33);
  doc.text(`Invoice Summary for ${props.projectName}`, 14, 20);

  // Invoice Table
  const invoiceData = props.groupedInvoices.map((group) => [
    group.issuer,
    formatCurrency(group.totalAmount),
    `${typeof group.totalMargin === 'number' ? group.totalMargin.toFixed(1) : group.totalMargin}%`,
    formatCurrency(group.totalWithMargin),
  ]);
  const totalRow = [
    {
      content: "TOTAL (All Suppliers)",
      colSpan: 3,
      styles: { halign: "right", fontStyle: "bold" },
    },
    formatCurrency(props.total),
  ];
  autoTable(doc, {
    ...tableStyles,
    head: [["Supplier", "Total", "Margin %", "Total + Margin"]],
    body: [...invoiceData, totalRow],
    startY: 30,
    didDrawPage: () => drawFooter(doc, doc.internal.pageSize.getHeight()),
  });

  let bottomY = doc.lastAutoTable.finalY + 15;

  // Payments Table
  if (props.payments.length) {
    doc.setFontSize(14);
    doc.setTextColor(33, 33, 33);
    doc.text("Payments", 14, bottomY);

    const paymentsData = props.payments.map((p) => [
      new Date(p.created_on).toLocaleDateString(),
      formatCurrency(p.amount),
    ]);
    const totalPayments = props.payments.reduce(
      (sum, p) => sum + parseFloat(p.amount || 0),
      0
    );
    const totalPaymentsRow = [
      {
        content: "TOTAL Payments",
        styles: { halign: "right", fontStyle: "bold" },
      },
      formatCurrency(totalPayments),
    ];

    autoTable(doc, {
      ...tableStyles,
      head: [["Date", "Amount"]],
      body: [...paymentsData, totalPaymentsRow],
      startY: bottomY + 5,
    });

    bottomY = doc.lastAutoTable.finalY + 15;
  }

  // Company Info
  drawCompanyInfo(doc, bottomY);

  // Chart Page
  await new Promise((res) => setTimeout(res, 300));
  const canvas = document.getElementById("invoice-chart");
  if (canvas) {
    const chartImage = canvas.toDataURL("image/png", 1.0);
    doc.addPage();
    doc.setFontSize(16);
    doc.text("Visual Summary of Totals", 14, 20);
    doc.addImage(chartImage, "PNG", 10, 30, 190, 80);
    drawCompanyInfo(doc, 120);
    drawFooter(doc, doc.internal.pageSize.getHeight());
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