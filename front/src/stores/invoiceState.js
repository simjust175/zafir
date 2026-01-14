import { ref } from "vue";
import { defineStore } from "pinia";
import { useRealtimeStore } from './realtimeStore.js';
import { useLoginStore } from "./loginState.js";


export const invoices = defineStore(
  "invoiceState",
  () => {
    // Initialize realtime store
    const realtimeStore = useRealtimeStore()
    const loginState = useLoginStore();

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
      console.log("Starting to fetch...", loginState.token);
      const token = loginState.token;
      if (!token) {
        console.log("No token found");
        return;
      }

      warnings.value = [];

      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/get`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          console.error("getAmounts fetch failed:", res.status, await res.text());
          return;
        }

        const data = await res.json();
        console.log("Raw data example:", data.amounts?.[0]);

        if (!Array.isArray(data.amounts)) return;

        const filtered = processIncomingData(data.amounts);
        dbResponse.value = filtered;

        // --- SYNC to realtime store (safe, single pass) ---
        const rs = useRealtimeStore();

        // Clear old cached invoices once
        if (rs?.entities?.invoices && typeof rs.entities.invoices.clear === "function") {
          rs.entities.invoices.clear();
        }

        // Use the realtime store's bulkInsert if available (it triggers reactivity)
        if (typeof rs.bulkInsert === "function") {
          rs.bulkInsert("invoices", filtered);
        } else {
          // Fallback: populate the map directly (less ideal if updateCounter not exposed)
          filtered.forEach(inv => {
            const key = inv.invoice_id ?? inv.id;
            if (!key) {
              console.warn("Skipping invoice without ID:", inv);
              return;
            }
            rs.entities.invoices.set(key, structuredClone ? structuredClone(inv) : JSON.parse(JSON.stringify(inv)));
          });
          // Note: if your realtime store exposes an update trigger, call it here.
        }
      } catch (err) {
        console.error("getAmounts error:", err);
      }
    };

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

    const removeProjectOptimistic = (projectName) => {
  if (!projectName) return

  dbResponse.value = dbResponse.value.filter(
    inv => inv.project_name !== projectName
  )
}

const addProjectOptimistic = (payload) => {
  if (!payload) return

  // Support single invoice or array
  const invoicesToAdd = Array.isArray(payload) ? payload : [payload]

  invoicesToAdd.forEach(inv => {
    if (!inv?.invoice_id) return

    const exists = dbResponse.value.some(
      existing => existing.invoice_id === inv.invoice_id
    )

    if (!exists) {
      dbResponse.value.push(inv)
    }
  })
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

      // optimistic
      removeProjectOptimistic,
      addProjectOptimistic,

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
