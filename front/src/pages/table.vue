<template>
  <div class="invoices-surface">
    <main class="invoices-content">
      <main-display-tabs
        :invoice-array="amountArray"
        :expanded="true"
        :search-value="searchQuery"
        @table-update="fetchFromSessionStorage"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue"
import { invoices } from "@/stores/invoiceState.js"

const invoiceStore = invoices()
const amountArray = ref([])
const searchQuery = ref('')

const fetchFromSessionStorage = () => {
  amountArray.value = invoiceStore.dbResponse || []
}

watch(() => invoiceStore.dbResponse, (updatedValue) => {
  amountArray.value = updatedValue || []
}, { deep: true })

onMounted(() => {
  fetchFromSessionStorage()
})
</script>

<style scoped>
.invoices-surface {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: rgb(var(--v-theme-background));
}

.invoices-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
