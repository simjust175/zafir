<template>
  <v-card class="mx-auto text-center pa-8" color="grey-lighten-3" dark>
    <div id="chart" class="pa-2" width="70%">

      <div class="d-flex justify-space-between">
        <h4 class="text-start">{{ period }} integrity distribution</h4>
        <!-- {{ integrityArray }} -->
        <v-btn append-icon="mdi mdi-arrow-right-bold-outline" variant="tonal" color="primary"
          rounded="md">Integrity</v-btn>
      </div>

      <apexchart type="donut" :options="chartOptionsWithDelay" :series="series"></apexchart>
      <period-buttons @periodUpdate="period = $event" />
    </div>
  </v-card>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from "vue";

const props = defineProps({
  optionMethods: Array,
  amountArray: Array
});

const methods = computed(() => props.optionMethods);
const period = ref("monthly");
const byPeriod = reactive({
  monthly: [12, 55, 71, 3],
  yearly: [100, 87, 66, 92]
});

const integrityArray = computed(() => {
  return props.amountArray.map(amount => amount.integrity);
});

const series = computed(() => byPeriod[period.value]);
const chartOptionsWithDelay = ref(null);

const chartOptions = reactive({
  labels: [...props.optionMethods],
  chart: {
    width: 200
  },
  responsive: [{
    breakpoint: 480,
    options: {
      chart: {
        width: 200
      },
      legend: {
        position: 'bottom'
      }
    }
  }]
});

watch(
  () => props.optionMethods,
  (newVal) => {
    chartOptions.labels = [...newVal];
  },
  { immediate: true }
);

onMounted(() => {
  setTimeout(() => {
    chartOptionsWithDelay.value = chartOptions;
  }, 1500);
});

</script>

<style></style>

