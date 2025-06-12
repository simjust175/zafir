<template>
  <main-display
    v-if="!loading && admin"
    :monthly="monthly"
    :days-left="daysLeftMonth"
    :currency-in-use="currencyInUse"
    :amount-array="amountArray"
    :language="language"
    @new-amount-posted="getAmounts()"
  />
  <employee-view
    v-else-if="!loading && !admin"
    :monthly="monthly"
    :days-left="daysLeftMonth"
    :currency-in-use="currencyInUse"
    :amount-array="amountArray"
    :language="language"
    @new-amount-posted="getAmounts()"
  />
  <overlay-component v-else />
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import store from "../../storage/index.js";

const monthly = ref({
  date: {},
  sums: {},
  //engMonth: 0
});

const admin = ref(true)
// const props = defineProps({ language: String })
const loading = ref(false);
const currencyInUse = ref("EUR");
const amountArray = ref([]);

// const daysLeft = async () => {
//   console.log("Days left activated....");
//   const res = await fetch(`${import.meta.env.VITE_BASE_URL}/amount/daysLeft/${location.value}`, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json"
//     }
//   });
//   const { daysLeft } = await res.json();
//   //daysLeftMonth.value = daysLeft.daysLeft;
//   monthly.value.date = daysLeft.date
// }

setInterval(() => {
  daysLeft()
}, 12 * 60 * 60 * 1000);


///////////////////////////////////////////////////////////////////////////////////////////////
const sumCalc = (array, methodToSum) => array.filter(amount => amount.method === methodToSum && isSameMonthYear(date(), date(array.created_at))).map(charity => charity.amount)

const date = (day) => (day ? new Date(day) : new Date());
const isSameMonthYear = (date1, date2) => date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear()

const sumArray = (array) => Math.round(array.reduce((total, value) => total + value, 0))

const getAmounts = async () => {
  console.log("Starting to fetch...");
  const tokenFromLocalStorage = localStorage.getItem("token");
  if (!tokenFromLocalStorage) return console.log("NO token??");
  const res = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/test`, {
    // method: "POST",
    headers: {
      "Content-Type": "application/json"
    }, 
    // body: JSON.stringify({ token: tokenFromLocalStorage })
  })
  const data = await res.json();

  console.log("datatatatatatatttt", data);
  
 //mountArray.value = data.extracted
  // monthly.value.sums = { income: sumArray(sumCalc(data.amounts, 'income')), masser: sumArray(sumCalc(data.amounts, 'charity')), expenses: sumArray(sumCalc(data.amounts, 'expense')) }
  // store.commit("updateDbContent", data.amounts);
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> }(o){ <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<  \\

onMounted(() => {
  getAmounts()
  //daysLeft()
  // loading.value = true
  // setTimeout(() => {
  //   loading.value = false
  // }, 1000)
})

</script>
