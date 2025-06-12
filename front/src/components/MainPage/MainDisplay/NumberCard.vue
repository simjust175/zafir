<template>
  <v-container>
    <div class="col-sm-12 col-md-12 col-lg-4 col-xl-4">
      <div class="card mb-3 widget-content bg-midnight-bloom">
        <div class="widget-content-wrapper text-white">
          <div :class="widgetContent">
            <div class="widget-heading">
              Something Something
            </div>
            <div class="widget-subheading">
              Something else
            </div>
          </div>
          <div :class="widgetContentReverse">
            <div class="widget-numbers text-white">
              {{ props.currency }}<span id="income">{{ stillToGive }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="col-md-12 col-xl-4">
      <div class="card mb-3 widget-content bg-arielle-smile">
        <div class="widget-content-wrapper text-white">
          <div :class="widgetContent">
            <div class="widget-heading">
              Total give
            </div>
            <div class="widget-subheading">
              Total Clients Profit
            </div>
          </div>
          <div :class="widgetContentReverse">
            <div class="widget-numbers text-white">
              {{ props.currency }}<span id="masser">{{ props.monthly.sums.masser }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-12 col-xl-4">
      <div class="card mb-3 widget-content bg-grow-early">
        <div class="widget-content-wrapper text-white">
          <div :class="widgetContent">
            <div class="widget-heading">
              Something Totally else
            </div>
            <div class="widget-subheading">
              some text
            </div>
          </div>
          <div :class="widgetContentReverse">
            <div
              v-if="!props.daysLeft"
              id="averageDaily"
              class="progressCircle"
            >
              <v-progress-circular indeterminate />
            </div>
            <div
              v-else
              class="widget-numbers text-white"
            >
              {{ props.currency }}<span id="averageDaily"> {{ averageDailyCalculator }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-container>
</template>

<!-- eslint-disable vue/require-default-prop -->
<script setup>
import { computed, defineProps, onMounted } from "vue";
// import { useLocale } from 'vuetify';

const props = defineProps({
  monthly: Object,
  chodesh: String,
  currency: String,
  daysLeft: Number,
  monthlyPercent: Number,
  language: String
});

//Style rtl
const widgetContent = computed(() => `widget-content-${props.language === 'en' ? 'left' : 'right'}`);
const widgetContentReverse = computed(() => `widget-content-${props.language === 'en' ? 'right' : 'left'}`);

const stillToGive = computed(() => {
  if (props.monthly && props.monthly.sums.income && props.monthly.sums.masser) {
    return (props.monthly.sums.income / 10) - props.monthly.sums.masser;
  }
  return 0;
});

const averageDailyCalculator = computed(() => {
  if (props.daysLeft > 0 && stillToGive.value) {
    return Math.round(stillToGive.value / props.daysLeft);
  }
  return 0;
});

function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.innerHTML = Math.floor(progress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.innerHTML = end;
    }
  };
  window.requestAnimationFrame(step);
}

onMounted(() => {
  
  const incomeElement = document.getElementById("income");
  const masserElement = document.getElementById("masser");
  const averageDailyElement = document.getElementById("averageDaily");

  animateValue(incomeElement, 0, stillToGive.value, 1900);
  animateValue(masserElement, 0, props.monthly.sums.masser, 1900);
  animateValue(averageDailyElement, 0, averageDailyCalculator.value, 1900);
});
</script>

<style></style>