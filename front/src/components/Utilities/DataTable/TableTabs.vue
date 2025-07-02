<template>
  <v-card>
    <!-- <v-toolbar color="primary" :title="'User Profile">
        </v-toolbar> -->

    <div class="d-flex flex-row">
      <v-tabs
        v-model="tab"
        color="primary"
        direction="vertical"
      >
        <v-tab
          prepend-icon="mdi-account"
          text="Transactions"
          value="option-1"
        />
        <v-tab
          prepend-icon="mdi-lock"
          text="Users"
          value="option-2"
        />
      </v-tabs>

      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="option-1">
          <table-parent
            :invoices="props.amountArray"
            :action-stat="true"
            class="overflow-y-auto"
            fill-width
         
            @table-update="fetchFromSessionStorage"
          />
        </v-tabs-window-item>

        <v-tabs-window-item value="option-2">
          <manage-users />
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
  </v-card>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { invoices } from "@/stores/invoiceState"
const invoiceArray = invoices()
const props = defineProps({amountArray: Array})

const tab = ref('option-1')
let amountArray = ref([])
const fetchFromSessionStorage = () =>{
    amountArray.value = invoiceArray.dbResponse
}

watch(invoiceArray.dbResponse, (updatedValue)=> amountArray.value = updatedValue)
onMounted(()=> fetchFromSessionStorage())
</script>

<style scoped>
.v-tabs-window {
  flex-grow: 1;
  min-width: 0; /* helps with overflow issues */
}

</style>