<template>
  <v-card class="bg-grey-lighten-2 elevation-0 d-flex flex-column align-start justify-space-evenly fill-height ga-2">
    <h4 class="text-grey-darken-1 d-flex justify-space-between">
      Monthly income: <span class="text-blue ml-3">
        <CountTo
          :end-val="props.monthly.income"
          :duration="1500"
        />
      </span>
    </h4>
    <h4 class="text-grey-darken-1">
      Left over: <span class="text-green">
        <CountTo
          :end-val="stillToGive"
          :duration="1500"
        />
      </span> Average daily: <span class="text-green">
        <CountTo
          :end-val="averageDailyCalculator"
          :duration="1500"
        />
      </span>
    </h4>
  </v-card>
</template>

<script setup>
import { computed, defineProps } from "vue";
import CountTo from 'vue-count-to';

const props = defineProps({
    monthly: Object,
    currency: String,
    daysLeft: Number,
    monthlyPercent: Number
});

const leftOverCalc = computed(() => (props.monthly.income / 10) - props.monthly.masser);
const stillToGive = computed(() => leftOverCalc.value);
const averageDailyCalculator = computed(() => leftOverCalc.value / props.daysLeft);
</script>

<style></style>
