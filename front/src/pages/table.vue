<template>
  <main class="pa-2">
    <!-- <table-parent :amountArray="amountArray" :actionStat="true" @tableUpdate="fetchFromSessionStorage" class="overflow-y-auto"/> -->
    <table-tabs  :amountArray="amountArray" :actionStat="true" @tableUpdate="fetchFromSessionStorage" class="overflow-y-auto"/>
  </main>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import store from "../storage/index.js"


let amountArray = ref([])
const fetchFromSessionStorage = () =>{
    amountArray.value = store.state.dbContent
}

watch(store.state.dbContent, (updatedValue)=> amountArray.value = updatedValue)
onMounted(()=> fetchFromSessionStorage())

</script>

<style>

</style>