<template>
  <main>
    <main-display-tabs
      :invoice-array="amountArray"
      :expanded="true"
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
    amountArray.value = invoiceArray.dbResponse
}

watch(invoiceArray.dbResponse, (updatedValue)=> amountArray.value = updatedValue)
onMounted(()=> fetchFromSessionStorage())

</script>

<style>

</style>