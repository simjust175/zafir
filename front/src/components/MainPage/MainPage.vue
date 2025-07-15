<template>
  <main>
    <!-- <navigation-bar lang="en" /> -->
    <main-display
      :currency-in-use="currencyInUse"
      :invoices="amountArray"
      @new-amount-posted="getAmounts()"
    />
  </main>
  <!-- <overlay-component v-else /> -->
</template>

<script setup>
import { ref, onMounted } from "vue";
// import store from "../../storage/index.js";
import { invoices } from "@/stores/invoiceState";
const invoiceArray = invoices();


//const loading = ref(false);
const currencyInUse = ref("EUR");
const amountArray = ref([]);

///////////////////////////////////////////////////////////////////////////////////////////////
//const sumCalc = (array, methodToSum) => array.filter(amount => amount.method === methodToSum && isSameMonthYear(date(), date(array.created_at))).map(charity => charity.amount)

const sumArray = (array) =>
  Math.round(array.reduce((total, value) => total + value, 0));

const getAmounts = async () => {
  console.log("Starting to fetch...");
  const tokenFromLocalStorage = localStorage.getItem("token");
  if (!tokenFromLocalStorage) return console.log("NO token??");
  const res = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/get`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token: tokenFromLocalStorage }),
  });
  const data = await res.json();
  console.log("daya dya yd data", data.amounts[54]);
  amountArray.value = [...data.amounts];
  invoiceArray.dbResponse = data.amounts;
};


// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> }(o){ <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<  \\

onMounted(() => {
  getAmounts();
});
</script>
