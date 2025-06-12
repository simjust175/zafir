<template>
    <overlay-component :overlayTrigger="triggerOverlay" v-if="Object.values(props.monthly.sums).length < 1"/>
    <v-container class="fill-height fill-width bg-grey-lighten-2 pa-6" fluid>
      <v-responsive class="fill-height fill-width" width="100%">
        <!-- Top Row: Number Cards -->
  
        <!-- Main Content: Left (Form) and Right (Progress Bars + Pie Chart) -->
        <v-row class="d-flex">
          <!-- Left: Main Form -->
          <v-col cols="12" md="6">
            <main-form v-bind="$attrs" @methodUpdate="updateChartOptions" :language="props.language"/>
          </v-col>
  
          <!-- Right: Progress Bars and Pie Chart -->
          <v-col cols="12" md="6" sm="12">
            <table-parent :amountArray="amountArray" :language="language" :actionStat="false" height="612" employee="2" class="overflow-y-auto scrollbar-style"/>
          </v-col>
        </v-row>

      </v-responsive>
    </v-container>
  
  </template>
  
  
  <script setup>
  import { ref, watch, onMounted } from "vue";
  import MainForm from "./AmountForm/MainForm.vue";
  import ProgressCards from "./ProgressCards.vue";

  
  const props = defineProps({
    currencyInUse: String,
    monthly: Object,
    daysLeft: Number,
    amountArray: Array,
    language: String
  });
  
  const triggerOverlay = ref(false)
  const barMethodSelected = ref(true)
  const chartOptions = ref([])
  const monthlyPercent = ref(0);
  const currency = ref("$");
  const dateConverter = ref();
  
  const updateValues = () => {
    monthlyPercent.value = Math.round(props.monthly.sums.masser / (props.monthly.sums.income / 10) * 100);
    currency.value = getCurrencySymbol(props.currencyInUse);
    dateConverter.value = getDateConverter(props.monthly.date.mm);
  };
  
  const updateChartOptions = (options) => chartOptions.value = options;
  
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
  
  const getDateConverter = (month) => {
    switch (month) {
      case 1:
        return { en: "Nissan", he: "ניסן" };
      case 2:
        return { en: "Iyar", he: "אייר" };
      case 3:
        return { en: "Sivan", he: "סיון" };
      case 4:
        return { en: "Tammuz", he: "תמוז" };
      case 5:
        return { en: "Av", he: "אב" };
      case 6:
        return { en: "Elul", he: "אלול" };
      case 7:
        return { en: "Tishrei", he: "תשרי" };
      case 8:
        return { en: "Cheshvan", he: "חשון" };
      case 9:
        return { en: "Kislev", he: "כסלו" };
      case 10:
        return { en: "Tevet", he: "טבת" };
      case 11:
        return { en: "Shevat", he: "שבט" };
      case 12:
        return { en: "Adar", he: "אדר" };
      case 13:
        return { en: "Adar II", he: "'אדר ב" };
      default:
        return { en: "Unknown", he: "לא ידוע" };
    }
  };
  
  const triggerOverlayFunction = () => {
    triggerOverlay.value = true
  
    setTimeout(() => {
      triggerOverlay.value = false;
    }, 1500)
  
  }
  
  onMounted(() => {
    triggerOverlayFunction()
    updateValues()
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
  
  .scrollbar-style::-webkit-scrollbar-track
  {
      -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
      border-radius: 10px;
      background-color: #F5F5F5;
  }
  
  .scrollbar-style::-webkit-scrollbar
  {
      width: 3px;
      background-color: #F5F5F5;
  }
  
  .scrollbar-style::-webkit-scrollbar-thumb
  {
      border-radius: 10px;
      /* -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3); */
      background-color: #E5E5E5FF;
  }
  
  
  </style>