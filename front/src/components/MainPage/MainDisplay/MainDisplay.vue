<template>
  <v-container fluid>
    <overlay-component
      v-if="Object.values(props.monthly.sums).length < 1"
      :overlay-trigger="triggerOverlay"
    />
    <main-dialog
      :activate-dialog="activateDialog"
      title="Confirm Log-out"
      :text="$t('confirm_dialog')"
    />
    <v-container
      class="fill-height fill-width bg-grey-lighten-2 pa-6"
      fluid
    >
      <v-responsive
        class="fill-height fill-width"
        width="100%"
      >
        <!-- Top Row: Number Cards -->
        <!-- <v-row class="mb-4 pt-3">
          <number-card
            :currency="currency"
            :monthly="monthly"
            :days-left="daysLeft"
            :monthly-percnt="monthlyPercent"
            :chodesh="dateConverter"
            language="en"
          />
        </v-row> -->

        <!-- Main Content: Left (Form) and Right (Progress Bars + Pie Chart) -->
        <v-row class="d-flex">
          <!-- Left: Main Form -->
          <v-col
            cols="12"
            md="8"
            fill-height
          >
            <!-- <main-form
              v-bind="$attrs"
              :language="props.language"
              @method-update="updateChartOptions"
            />
            <v-spacer class="mt-5" /> -->
            <table-parent
              :invoices="invoiceArray"
              :action-stat="false"
              height="100%"
              class="overflow-y-auto scrollbar-style"
            />
            <!-- height="606" -->
          </v-col>

          <!-- Right: Progress Bars and Pie Chart -->
          <v-col
            cols="12"
            md="4"
            sm="12"
          >
            <div>
              <progress-bar
                :label="$t('Monthly goal')"
                :percentage="monthlyPercent"
                :days-left="daysLeft"
                :masser-given="monthly.sums.masser"
                :masser-to-give="monthly.sums.income"
                :currency="currency"
                period="monthly"
              />
            </div>
            <div class="mt-3">
              <progress-bar
                color="blue"
                :label="$t('Left from past months')"
                :percentage="monthlyPercent"
                :days-left="daysLeft"
                :masser-given="monthly.sums.masser"
                :masser-to-give="monthly.sums.income"
                :currency="currency"
                period="yearly"
              />
            </div>
            <div class="mt-5">
              <pie-chart
                v-if="barMethodSelected"
                :option-methods="chartOptions"
                :amount-array="amountArray"
              />
              <sparklines-dashboard
                v-else
                @click="barMethodSelected = !barMethodSelected"
              />
            </div>
            <div class="mt-5">
              <bar-chart
                :option-methods="chartOptions"
                :amount-array="amountArray"
                :monthly="monthly"
              />
              <!-- <sparklines-dashboard  /> -->
            </div>
          </v-col>
        </v-row>

        <v-row class="mt-7">
          <progress-cards />
        </v-row>
      </v-responsive>
    </v-container>
  </v-container>
</template>

<!-- eslint-disable vue/require-default-prop -->
<script setup>
import { ref, watch, onMounted } from "vue";
//import MainForm from "../MainDisplay/AmountForm/MainForm.vue";
//import NumberCard from "../MainDisplay/NumberCard.vue";
import ProgressCards from "./ProgressCards.vue";
import BarChart from "@/components/Utilities/Charts/BarChart.vue";
import SparklinesDashboard from "@/components/Utilities/Charts/SparklinesDashboard.vue";

const props = defineProps({
  currencyInUse: String,
  monthly: Object,
  daysLeft: Number,
  amountArray: Array,
  language: String,
});

const triggerOverlay = ref(false);
const activateDialog = ref(false);
const barMethodSelected = ref(true);
const chartOptions = ref([]);
const monthlyPercent = ref(0);
const currency = ref("$");
//const dateConverter = ref();

const updateValues = () => {
  monthlyPercent.value = Math.round(
    (props.monthly.sums.masser / (props.monthly.sums.income / 10)) * 100
  );
  currency.value = getCurrencySymbol(props.currencyInUse);
};

//const updateChartOptions = (options) => (chartOptions.value = options);

const getCurrencySymbol = (currencyInUse) => {
  switch (currencyInUse) {
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    case "ILS":
      return "₪";
    case "FRANC":
      return "₣";
    default:
      return "$";
  }
};

const triggerOverlayFunction = () => {
  triggerOverlay.value = true;

  setTimeout(() => {
    triggerOverlay.value = false;
  }, 1500);
};

onMounted(() => {
  triggerOverlayFunction();
  updateValues();
}),
  watch(() => props.monthly, updateValues, { immediate: true });
</script>

<style>
/* .scrollbar-style
{
	margin-left: 30px;
	float: left;
	height: 300px;
	width: 65px;
	background: #F5F5F5;
	overflow-y: scroll;
	margin-bottom: 25px;
} */

.scrollbar-style::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  background-color: #f5f5f5;
}

.scrollbar-style::-webkit-scrollbar {
  width: 3px;
  background-color: #f5f5f5;
}

.scrollbar-style::-webkit-scrollbar-thumb {
  border-radius: 10px;
  /* -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3); */
  background-color: #e5e5e5ff;
}
</style>
