<template>
  <main class="pa-6">
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
import { useRouter } from "vue-router";
const route = useRouter()
const invoiceArray = invoices()


let amountArray = ref([])
const fetchFromSessionStorage = () =>{
  if(invoiceArray.dbResponse.length < 1) route.push('/')
    amountArray.value = invoiceArray.dbResponse
}

watch(invoiceArray.dbResponse, (updatedValue)=> amountArray.value = updatedValue)
onMounted(()=> fetchFromSessionStorage())

</script>

<style>

</style>