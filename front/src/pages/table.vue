<template>
  <main class="pa-2">
    <!-- <table-parent :amountArray="amountArray" :actionStat="true" @tableUpdate="fetchFromSessionStorage" class="overflow-y-auto"/> -->
    <table-tabs
      :amount-array="amountArray"
      :action-stat="true"
      class="overflow-y-auto"
      @table-update="fetchFromSessionStorage"
    />
  </main>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { invoices } from "@/stores/invoiceState"
const invoiceArray = invoices()


let amountArray = ref([])
const fetchFromSessionStorage = () =>{
  console.log("innnnnnnnnnnnnnnnnvoices", invoiceArray);
  
    amountArray.value = invoiceArray.dbResponse
}

watch(invoiceArray.dbResponse, (updatedValue)=> amountArray.value = updatedValue)
onMounted(()=> fetchFromSessionStorage())

</script>

<style>

</style>