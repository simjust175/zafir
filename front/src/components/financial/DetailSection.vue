<template>
  <div>
    <!-- OUTSTANDING BALANCE PIE -->
    <div class="d-flex my-2 justify-center">
      <v-card
        class="pa-6"
        elevation="6"
        rounded="xl"
        width="98%"
      >
        <v-card-title class="d-flex align-center justify-space-between">
          <div class="text-truncate mr-6">
            Outstanding Balance
          </div>
        </v-card-title>

        <v-pie
          :items="pieItems"
          :legend="{ position: $vuetify.display.mdAndUp ? 'right' : 'bottom' }"
          :tooltip="{ subtitleFormat: '€[value]' }"
          class="pa-3 mt-3 justify-center"
          gap="2"
          inner-cut="70"
          item-key="key"
          rounded="2"
          size="300"
          animation
          hide-slice
          reveal
        >
          <template #center>
            <div class="text-center pa-2">
              <div class="text-h4 text-grey-darken-1">
                €{{ totalOwed }}
              </div>
              <div class="opacity-70 mt-1 mb-n1">
                Total Owed
              </div>
            </div>
          </template>

          <template #legend="{ items, toggle, isActive }">
            <v-list
              class="py-0 mb-n5 mb-md-0 bg-transparent"
              density="compact"
              width="300"
            >
              <v-list-item
                v-for="item in items"
                :key="item.key"
                :class="['my-1', { 'opacity-40': !isActive(item) }]"
                :title="item.title"
                rounded="lg"
                link
                @click="toggle(item)"
              >
                <template #prepend>
                  <v-avatar
                    :color="item.color"
                    :size="16"
                  />
                </template>
                <template #append>
                  <div class="font-weight-bold">
                    €{{ item.value }}
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </template>
        </v-pie>
      </v-card>
    </div>

    <!-- SVG pattern for slice textures -->
    <div class="h-0">
      <svg
        height="0"
        width="0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="pattern-0"
            height="20"
            width="20"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(145) scale(.2)"
          >
            <path
              d="M0 10h20zm0 20h20zm0 20h20zm0 20h20z"
              fill="none"
              stroke="rgb(var(--v-theme-surface))"
              stroke-width="3"
            />
          </pattern>
        </defs>
      </svg>
    </div>
    <!-- CASHFLOW CHART -->
    <div class="d-flex my-6 justify-center">
      <v-card
        class="pa-6"
        elevation="6"
        rounded="xl"
        width="98%"
      >
        <v-card-title class="d-flex align-center justify-space-between">
          <div class="text-truncate mr-6">
            Cashflow Chart
          </div>
        </v-card-title>
        <canvas ref="chart1" />
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from "vue"
import { Chart } from "chart.js/auto"

const props = defineProps({
  invoices: { type: Array, required: true },   // [{ amount, created_on }]
  payments: { type: Array, default: () => [] },// [{ amount }]
  totalOwed: { type: Number, required: true }  // backend total owed
})

const chart1 = ref(null)
let chartInstance = null

// Create Chart.js Line Chart
onMounted(() => {
  if (chart1.value) {
    const ctx1 = chart1.value.getContext("2d")
    chartInstance = new Chart(ctx1, {
      type: "line",
      data: {
        labels: props.invoices.map(i =>
          new Date(i.created_on).toLocaleDateString()
        ),
        datasets: [
          {
            label: "Invoice Amounts",
            data: props.invoices.map(i => i.amount),
            borderColor: "#1976D2",
            backgroundColor: "rgba(25, 118, 210, 0.1)",
            fill: true,
            tension: 0.3
          }
        ]
      }
    })
  }
})

// Watch invoices for changes and update chart
watch(
  () => props.invoices,
  (newInvoices) => {
    if (chartInstance) {
      chartInstance.data.labels = newInvoices.map(i =>
        new Date(i.created_on).toLocaleDateString()
      )
      chartInstance.data.datasets[0].data = newInvoices.map(i => i.amount)
      chartInstance.update()
    }
  },
  { deep: true }
)

// Totals
const totalPaid = computed(() =>
  props.payments.reduce((sum, p) => sum + p.amount, 0)
)
const totalInvoiced = computed(() =>
  props.invoices.reduce((sum, i) => sum + i.amount, 0)
)
const remaining = computed(() =>
  Math.max(props.totalOwed - totalPaid.value, 0)
)

// v-pie items
const pieItems = computed(() => [
  { key: 1, title: "Paid", value: totalPaid.value, color: "#4CAF50" },
  { key: 2, title: "Invoiced", value: totalInvoiced.value, color: "#2196F3" },
  { key: 3, title: "Remaining", value: remaining.value, color: "#FFC107" }
])
</script>