<template>
  <main class="pa-6" :class="themeBg">
    <main-display-tabs
      :invoice-array="amountArray"
      :expanded="true"
      class="overflow-y-auto"
      @table-update="fetchFromSessionStorage"
    />
  </main>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { invoices } from "@/stores/invoiceState"
import { useRouter } from "vue-router";
import { useTheme } from "vuetify";

const theme = useTheme();
const themeBg = computed(() =>
  theme.global.name.value === "dark" ? "bg-grey-darken-4" : "bg-monday"
);
const route = useRouter()
const invoiceArray = invoices()


let amountArray = ref([])
const fetchFromSessionStorage = () =>{
  if(invoiceArray.dbResponse.length < 1) invoiceArray.getAmounts()
    amountArray.value = invoiceArray.dbResponse
}

watch(invoiceArray.dbResponse, (updatedValue)=> amountArray.value = updatedValue)
onMounted(()=> fetchFromSessionStorage())

</script>

<style>

</style>