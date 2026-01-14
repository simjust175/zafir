<!-- eslint-disable no-empty -->
<!-- eslint-disable vue/no-template-shadow -->
<template>
  <div>
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

    <button 
      class="action-btn"
      :class="{ loading: isGenerating }"
      :disabled="isGenerating"
      :title="print ? 'Print summary' : 'Download summary'"
      @click="checkBeforeAction"
    >
      <svg v-if="!isGenerating && !print" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      <svg v-else-if="!isGenerating && print" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6 9 6 2 18 2 18 9"></polyline>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
        <rect x="6" y="14" width="12" height="8"></rect>
      </svg>
      <span v-if="isGenerating" class="spinner"></span>
    </button>

    <v-dialog v-model="warningDialog" max-width="400">
      <div class="dialog-container">
        <div class="dialog-header warning">
          <div class="dialog-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <h2 class="dialog-title">Pending Verification</h2>
          <button class="close-btn" @click="warningDialog = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="dialog-body">
          <p>Some invoices have not been verified yet. Would you like to proceed with {{ print ? 'printing' : 'downloading' }} this summary?</p>
        </div>
        <div class="dialog-footer">
          <button class="btn-secondary" @click="warningDialog = false">Cancel</button>
          <button class="btn-warning" @click="forceContinue">Continue Anyway</button>
        </div>
      </div>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Chart from "chart.js/auto";

const props = defineProps({
  groupedInvoices: { type: Array, default: () => [] },
  total: { type: Number, default: 0 },
  projectName: { type: String, default: "" },
  payments: { type: Array, default: () => [] },
  print: { type: Boolean, default: false },
  doubleChecked: { type: Boolean, default: true },
});

const warningDialog = ref(false);
const isGenerating = ref(false);
let pendingAction = null;
let chartInstance = null;
const invoiceCanvas = ref(null);

const formatCurrency = (amount) => {
  const n = typeof amount === "number" ? amount : parseFloat(amount);
  return isNaN(n)
    ? "€0.00"
    : `€${n.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
};

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
          backgroundColor: "rgba(23,23,23,0.8)",
        },
      ],
    },
    options: {
      responsive: false,
      animation: false,
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

const drawFooter = (doc, pageHeight) => {
  const y = pageHeight - 12;
  doc.setFillColor(23, 23, 23);
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
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  color: #666;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: #fafafa;
  border-color: #d4d4d4;
  color: #171717;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #eaeaea;
  border-top-color: #171717;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.dialog-container {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid #eaeaea;
}

.dialog-header.warning {
  background: #fffbeb;
  border-bottom-color: #fde68a;
}

.dialog-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #fef3c7;
  border-radius: 10px;
  color: #d97706;
}

.dialog-title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: #171717;
  margin: 0;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #999;
  cursor: pointer;
  transition: all 0.15s ease;
}

.close-btn:hover {
  background: rgba(0,0,0,0.05);
  color: #171717;
}

.dialog-body {
  padding: 20px 24px;
}

.dialog-body p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background: #fafafa;
  border-top: 1px solid #eaeaea;
}

.btn-secondary,
.btn-warning {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.btn-secondary {
  background: #fff;
  color: #171717;
  border: 1px solid #eaeaea;
}

.btn-secondary:hover {
  background: #f5f5f5;
}

.btn-warning {
  background: #f59e0b;
  color: #fff;
}

.btn-warning:hover {
  background: #d97706;
}
</style>
