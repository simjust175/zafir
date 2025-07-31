import { ref, reactive } from "vue";
import { defineStore } from "pinia";

export const invoices = defineStore(
  "invoiceState",
  () => {
    // state
    const dbResponse = reactive({});
    const payments = ref([]);
    const invoicing = ref([]);
    const warnings = ref([]);

    const setPaymentsData = (pay, inv) => {
      payments.value = pay;
      invoicing.value = inv;
    };

    // Returns
    return {
      dbResponse,
      warnings,
      payments,
      invoicing,
      setPaymentsData,
    };
  },
  {
    persist: true,
  }
);
