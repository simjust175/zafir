<template>
  <main>
    <main-display
      :currency-in-use="currencyInUse"
      :invoices="amountArray"
      @new-amount-posted="invoiceStore.getAmounts()"
    />
  </main>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { invoices } from "@/stores/invoiceState";
const invoiceStore = invoices();

const currencyInUse = ref("EUR");
const amountArray = invoiceStore.dbResponse;
//amountArray.warnings = invoiceStore.warnings; // Will store objects like: { title: 'duplicate', item: {...} }

// Helper to process data: find unknown issuers and duplicate

// watch(()=> invoiceStore.dbResponse, (newVal)=> {
//   console.log("watch in main page triggered🔫");
  
//   if(Object.values(newVal.length < 1)) {
//     getAmounts();
//     getActiveEmails()
//   }
// })
onMounted(() => {
  //test >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  console.log("Main page mounted.");
  //end-test >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  invoiceStore.getAmounts();
  invoiceStore.getActiveEmails()
});
</script>