<template>
  <main>
    <main-display
      :currency-in-use="currencyInUse"
      :invoices="amountArray"
      :emails="emails"
      @new-amount-posted="invoiceStore.getAmounts()"
    />
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { invoices } from "@/stores/invoiceState.js";
const invoiceStore = invoices();

const currencyInUse = ref("EUR");
//const amountArray = invoiceStore.dbResponse;
const amountArray = computed(() => invoiceStore.dbResponse)
const emails = invoiceStore.freeEmails
//amountArray.warnings = invoiceStore.warnings; // Will store objects like: { title: 'duplicate', item: {...} }

// Helper to process data: find unknown issuers and duplicate

// watch(()=> invoiceStore.dbResponse, (newVal)=> {
//   console.log("watch in main page triggered🔫");
//   amountArray.value = [...newVal]
//   // if(Object.values(newVal.length < 1)) {
//   //   getAmounts();
//   //   getActiveEmails()
//   // }
// })
onMounted(() => {
  invoiceStore.getAmounts();
  invoiceStore.getActiveEmails()
});
</script>