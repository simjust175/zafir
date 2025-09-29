import { ref } from "vue";
import { defineStore } from "pinia";
import { useRealtimeStore } from './realtimeStore.js';

export const invoices = defineStore(
  "invoiceState",
  () => {
    // Initialize realtime store
    const realtimeStore = useRealtimeStore()
    
    // state
    const dbResponse = ref([]);
    const activeEmails = ref([]);
    const payments = ref([]);
    const invoicing = ref([]);
    const warnings = ref([]);

    const processIncomingData = (rawArray) => {
      const unique = []
      const seen = new Map()

      rawArray.forEach((item) => {
        const uniqueKey = `${item.amount}-${item.issuer}-${item.email}-${item.project_id}`

        if (item.issuer === "UNKNOWN ISSUER" || (!item.issuer && !item.conflict_resolved && item.amount)) {
          warnings.value.push({
            title: `unknown-supplier`,
            body: `No supplier name detected`,
            project: item.project_name,
            id: item.invoice_id,
            item,
          })
          unique.push(item)
          return
        }

        if (seen.has(uniqueKey)) {
          if (!item.conflict_resolved) {
            warnings.value.push({
              title: `duplicate`,
              body: `Possible duplicate invoice`,
              project: item.project_name,
              id: item.invoice_id,
              item: [item, seen.get(uniqueKey)],
            })
          }
          if (item.conflict_resolved) {
            unique.push(item)
          }
        } else {
          seen.set(uniqueKey, item)
          unique.push(item)
        }
      })

      return unique
    }

    const getAmounts = async () => {
      console.log("Starting to fetch...")
      const token = localStorage.getItem("token")
      if (!token) return console.log("No token found")
      warnings.value = [];

      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/get`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()
      console.log("Raw data example:", data.amounts?.[0])

      if (Array.isArray(data.amounts)) {
        const filtered = processIncomingData(data.amounts)
        dbResponse.value = filtered
        console.log("db response", dbResponse.value)
        
        // Sync with realtime store
        filtered.forEach(invoice => {
          realtimeStore.entities.invoices.set(invoice.invoice_id || invoice.id, invoice)
        })
      }
    }

    const getActiveEmails = async () => {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/activeEmails`)
      activeEmails.value = await res.json()
    }


    const setPaymentsData = (pay, inv) => {
      payments.value = pay;
      invoicing.value = inv;
    };

    // Real-time CRUD operations using optimistic updates
    const createInvoice = async (invoiceData) => {
      return await realtimeStore.createEntity('invoices', invoiceData)
    }

    const updateInvoice = async (invoiceId, updates) => {
      const result = await realtimeStore.updateEntity('invoices', invoiceId, updates)
      // Refresh local state
      await getAmounts()
      return result
    }

    const deleteInvoice = async (invoiceId) => {
      const result = await realtimeStore.deleteEntity('invoices', invoiceId)
      // Refresh local state
      await getAmounts()
      return result
    }

    // Returns
    return {
      dbResponse,
      activeEmails,
      warnings,
      payments,
      invoicing,
      setPaymentsData,
      getAmounts,
      getActiveEmails,
      
      // Real-time operations
      createInvoice,
      updateInvoice,
      deleteInvoice,
      
      // Real-time state
      realtimeStore,
      isConnected: realtimeStore.isConnected,
      hasPendingOperations: realtimeStore.hasPendingOperations
    };
  },
  {
    persist: true,
  }
);
