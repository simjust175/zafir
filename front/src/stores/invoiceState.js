import { reactive } from "vue";
import { defineStore } from "pinia";

export const invoices = defineStore(
  "invoiceState",
  () => {
    // state
    const dbResponse = reactive({});

    //Returns
    return {
     dbResponse,
    };
  },
  {
    persist: true,
  }
);