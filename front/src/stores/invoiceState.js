import { reactive } from "vue";
import { defineStore } from "pinia";

export const invoices = defineStore(
  "invoiceState",
  () => {
    // state
    const dbResponse = reactive({});
    const warnings = reactive([])

    //Returns
    return {
     dbResponse,
     warnings
    };
  },
  {
    persist: true,
  }
);