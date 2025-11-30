<!-- eslint-disable no-empty -->
<!-- eslint-disable vue/no-template-shadow -->
<template>
  <div>
    <!-- Invisible canvas but still renderable -->
    <canvas
      id="invoice-chart"
      ref="invoiceCanvas"
      width="600"
      height="300"
      style="
        visibility:hidden;
        position:absolute;
        left:-9999px;
        top:-9999px;
        pointer-events:none;
      "
    />

    <v-tooltip
      location="top"
      open-delay="300"
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          :icon="print ? 'mdi-printer-outline' : 'mdi-download-outline'"
          :loading="isGenerating"
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

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Chart from "chart.js/auto";

/* ------------------------------------------
   Props with safe defaults
-------------------------------------------*/
const props = defineProps({
  groupedInvoices: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  projectName: { type: String, default: "" },
  payments: { type: Array, default: () => [] },
  print: { type: Boolean, default: false },
  doubleChecked: { type: Boolean, default: true },
});

/* ------------------------------------------
   State
-------------------------------------------*/
const warningDialog = ref(false);
const isGenerating = ref(false);
let pendingAction = null;
let chartInstance = null;
const invoiceCanvas = ref(null);

/* ------------------------------------------
   Helpers
-------------------------------------------*/
const formatCurrency = (amount) => {
  const n = typeof amount === "number" ? amount : parseFloat(amount);
  return isNaN(n)
    ? "€0.00"
    : `€${n.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
};

/* ------------------------------------------
   Chart Rendering (Hidden Canvas)
-------------------------------------------*/
const renderChart = () => {
  const canvas = invoiceCanvas.value;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const grouped = Array.isArray(props.groupedInvoices) ? props.groupedInvoices : [];

  const labels = grouped.map((g) => g?.issuer ?? "Unknown");
  const data = grouped.map((g) =>
    typeof g?.totalWithMargin === "number" ? g.totalWithMargin : 0
  );

  // destroy old chart
  if (chartInstance) {
    try { chartInstance.destroy(); } catch {}
    chartInstance = null;
  }

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Total (€)",
          data,
          backgroundColor: "rgba(63,81,181,0.7)",
        },
      ],
    },
    options: {
      responsive: false,
      animation: false, // faster for invisible chart
      plugins: {
        legend: { display: false },
      },
    },
  });
};

onMounted(async () => {
  await nextTick();
  renderChart();
});

watch(
  () => props.groupedInvoices,
  () => nextTick().then(renderChart),
  { deep: true }
);

onUnmounted(() => {
  try { chartInstance?.destroy(); } catch {}
  chartInstance = null;
});

/* ------------------------------------------
   PDF Utilities
-------------------------------------------*/
const drawFooter = (doc, pageHeight) => {
  const y = pageHeight - 12;
  doc.setFillColor(63, 81, 181);
  doc.rect(0, y, doc.internal.pageSize.getWidth(), 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text("Thank you for choosing Zafir Total Projects", 14, y + 8);

  doc.setTextColor(180, 180, 180);
  doc.setFontSize(6);
  doc.text("Powered by Dreamware", doc.internal.pageSize.getWidth() - 50, y + 10);
};

const drawCompanyInfo = (doc, y) => {
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  [
    "ZAFIR TOTAAL PROJECTEN BVBA",
    "Lamorinierestraat 220",
    "2018 Antwerpen",
    "Tel. +324 84 50 45 65",
    "E-mail info@zafir.be",
  ].forEach((line, i) => doc.text(line, 14, y + i * 5));
};

/* ------------------------------------------
   Build PDF
-------------------------------------------*/
const buildPdf = async () => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(`Invoice Summary for ${props.projectName}`, 14, 20);

  const invoiceData = props.groupedInvoices.map((g) => [
    g?.issuer ?? "Unknown",
    formatCurrency(g?.totalAmount),
    `${g?.totalMargin?.toFixed?.(1) ?? "0.0"}%`,
    formatCurrency(g?.totalWithMargin),
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
    head: [["Supplier", "Total", "Margin %", "Total + Margin"]],
    body: [...invoiceData, totalRow],
    startY: 30,
    didDrawPage: () => drawFooter(doc, doc.internal.pageSize.getHeight()),
  });

  let bottomY = (doc.lastAutoTable?.finalY || 30) + 15;

  // payments
  if (props.payments.length) {
    doc.setFontSize(14);
    doc.text("Payments", 14, bottomY);

    const paymentsData = props.payments.map((p) => {
      const d = new Date(p?.created_on ?? "");
      const date = !isNaN(d) ? d.toLocaleDateString() : "";
      return [date, formatCurrency(p?.amount)];
    });

    const totalPayments = props.payments.reduce(
      (sum, p) => sum + (parseFloat(p?.amount) || 0),
      0
    );

    autoTable(doc, {
      head: [["Date", "Amount"]],
      body: [
        ...paymentsData,
        [{ content: "TOTAL Payments", styles: { halign: "right", fontStyle: "bold" } }, formatCurrency(totalPayments)],
      ],
      startY: bottomY + 5,
    });

    bottomY = (doc.lastAutoTable?.finalY || bottomY + 5) + 15;
  }

  drawCompanyInfo(doc, bottomY);

  // Give Chart.js time to finish render
  await new Promise((res) => setTimeout(res, 100));

  if (chartInstance) {
    const chartImage = chartInstance.toBase64Image();

    doc.addPage();
    doc.setFontSize(16);
    doc.text("Visual Summary of Totals", 14, 20);

    doc.addImage(chartImage, "PNG", 10, 30, 190, 80);

    drawCompanyInfo(doc, 120);
    drawFooter(doc, doc.internal.pageSize.getHeight());
  }

  return doc;
};

/* ------------------------------------------
   Download + Print
-------------------------------------------*/
const handleDownload = async () => {
  isGenerating.value = true;
  const doc = await buildPdf();
  doc.save(`invoice-summary-${props.projectName || "project"}.pdf`);
  isGenerating.value = false;
};

const handlePrint = async () => {
  isGenerating.value = true;
  const doc = await buildPdf();
  const blobUrl = URL.createObjectURL(doc.output("blob"));
  const win = window.open(blobUrl);
  if (win) {
    win.onload = () => {
      win.print();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    };
  }
  isGenerating.value = false;
};

/* ------------------------------------------
   Confirmation / flow control
-------------------------------------------*/
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
  pendingAction === "print" ? handlePrint() : handleDownload();
  pendingAction = null;
};
</script>


<style scoped>
#invoice-chart {
  display: none;
}
</style>