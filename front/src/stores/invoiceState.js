import { ref } from "vue";
import { defineStore } from "pinia";
import { useRealtimeStore } from "./realtimeStore.js";
import { useLoginStore } from "./loginState.js";

const API = import.meta.env.VITE_BASE_URL;

export const invoices = defineStore(
  "invoiceState",
  () => {
    // Stores
    const realtimeStore = useRealtimeStore();
    const loginState = useLoginStore();

    // State
    const dbResponse = ref([]);
    const activeEmails = ref([]);
    const payments = ref([]);
    const invoicing = ref([]);
    const warnings = ref([]);

    /* --------------------------------------------------
     * Helpers
     * -------------------------------------------------- */

    const safeClone = (obj) =>
      typeof structuredClone === "function"
        ? structuredClone(obj)
        : JSON.parse(JSON.stringify(obj));

    const processIncomingData = (rawArray = []) => {
      const unique = [];
      const seen = new Map();
      warnings.value = [];

      rawArray.forEach((item) => {
        const uniqueKey = `${item.amount}-${item.issuer}-${item.email}-${item.project_id}`;

        if (
          item.issuer === "UNKNOWN ISSUER" ||
          (!item.issuer && !item.conflict_resolved && item.amount)
        ) {
          warnings.value.push({
            title: "unknown-supplier",
            body: "No supplier name detected",
            project: item.project_name,
            id: item.invoice_id,
            item,
          });
          unique.push(item);
          return;
        }

        if (seen.has(uniqueKey)) {
          if (!item.conflict_resolved) {
            warnings.value.push({
              title: "duplicate",
              body: "Possible duplicate invoice",
              project: item.project_name,
              id: item.invoice_id,
              item: [item, seen.get(uniqueKey)],
            });
            return;
          }
        }

        seen.set(uniqueKey, item);
        unique.push(item);
      });

      return unique;
    };

    /* --------------------------------------------------
     * Fetching
     * -------------------------------------------------- */

    const getAmounts = async () => {
      const token = loginState.token;
      if (!token) return;

      try {
        const res = await fetch(`${API}/invoice/get`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) throw new Error("Failed to fetch invoices");

        const data = await res.json();
        if (!Array.isArray(data.amounts)) return;

        const filtered = processIncomingData(data.amounts);
        dbResponse.value = filtered;

        // Sync to realtime store (single instance)
        if (realtimeStore?.entities?.invoices) {
          realtimeStore.entities.invoices.clear();
          filtered.forEach((inv) => {
            if (!inv.invoice_id) return;
            realtimeStore.entities.invoices.set(inv.invoice_id, safeClone(inv));
          });
        }
      } catch (err) {
        console.error("getAmounts error:", err);
      }
    };

    const getActiveEmails = async () => {
      const res = await fetch(`${API}/invoice/activeEmails`);
      activeEmails.value = await res.json();
    };

    const setPaymentsData = (pay, inv) => {
      payments.value = Array.isArray(pay) ? pay : [];
      invoicing.value = Array.isArray(inv) ? inv : [];
    };

    /* --------------------------------------------------
     * Invoice CRUD (Realtime)
     * -------------------------------------------------- */

    const createInvoice = (invoiceData) =>
      realtimeStore.createEntity("invoices", invoiceData);

    const updateInvoice = async (invoiceId, updates) => {
      const result = await realtimeStore.updateEntity(
        "invoices",
        invoiceId,
        updates
      );
      await getAmounts();
      return result;
    };

    const deleteInvoice = async (invoiceId) => {
      const result = await realtimeStore.deleteEntity("invoices", invoiceId);
      await getAmounts();
      return result;
    };

    /* --------------------------------------------------
     * Optimistic Project Updates - FIXED
     * -------------------------------------------------- */

    const removeProjectOptimistic = (projectName) => {
      if (!projectName) return;
      dbResponse.value = dbResponse.value.filter(
        (inv) => inv.project_name !== projectName
      );
    };

    const addProjectOptimistic = (payload) => {
      // Handle both single project and array of invoices
      if (!payload) return;

      // If it's a project metadata object (from form submission)
      if (payload.project_name && !payload.invoice_id) {
        // Create a placeholder invoice entry for the project
        const placeholderInvoice = {
          invoice_id: `temp_${Date.now()}`,
          project_name: payload.project_name,
          email: payload.email,
          amount: 0,
          issuer: "",
          created_on: new Date().toISOString(),
          status: "active",
          // Add any other required fields
        };
        
        dbResponse.value.push(placeholderInvoice);
        return;
      }

      // If it's an array of invoice objects
      const items = Array.isArray(payload) ? payload : [payload];

      items.forEach((inv) => {
        if (!inv?.invoice_id && !inv?.project_name) return;
        
        // Don't add if already exists
        const exists = dbResponse.value.some(
          (i) => i.invoice_id === inv.invoice_id || 
                 (i.project_name === inv.project_name && i.invoice_id?.startsWith('temp_'))
        );
        
        if (!exists) {
          dbResponse.value.push(inv);
        }
      });
    };

    /**
     * NEW: Refresh invoices after project creation
     * This ensures the UI has the real data from the backend
     */
    const refreshInvoices = async () => {
      console.log('[invoiceState] Refreshing invoices...');
      await getAmounts();
      console.log('[invoiceState] Invoices refreshed, count:', dbResponse.value.length);
    };

    /* --------------------------------------------------
     * Revenue (Invoicing & Payments)
     * -------------------------------------------------- */

    const normalizeRevenueEntry = (entry, projectId) => ({
      id: entry.invoicing_id ?? entry.payment_id,
      project: projectId,
      amount: Number(entry.amount),
      created_on: entry.created_on,
    });

    const addRevenueEntry = async (table, projectId, amount) => {
      console.log("project_id", projectId);
      
      const res = await fetch(`${API}/invoice/post-general/${table}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: projectId, amount }),
      });

      if (!res.ok) throw new Error("Failed to create revenue entry");

      const data = await res.json();
      const entry = normalizeRevenueEntry(data.newGeneral, projectId);

      if (!entry.id) throw new Error("Invalid revenue entry ID");

      (table === "invoicing" ? invoicing.value : payments.value).push(entry);
      return entry;
    };

    const updateRevenueEntry = async (table, entryId, newAmount) => {
      const res = await fetch(
        `${API}/invoice/patch/${table}?id=${entryId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: newAmount }),
        }
      );

      if (!res.ok) throw new Error("Failed to update revenue entry");

      const list = table === "invoicing" ? invoicing.value : payments.value;
      const item = list.find((e) => e.id === entryId);
      if (item) item.amount = Number(newAmount);
    };

    const deleteRevenueEntry = async (table, entryId) => {
      const res = await fetch(
        `${API}/invoice/delete/${table}/${entryId}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Failed to delete revenue entry");

      if (table === "invoicing") {
        invoicing.value = invoicing.value.filter((e) => e.id !== entryId);
      } else {
        payments.value = payments.value.filter((e) => e.id !== entryId);
      }
    };

    /* --------------------------------------------------
     * Exports
     * -------------------------------------------------- */

    return {
      // State
      dbResponse,
      activeEmails,
      warnings,
      payments,
      invoicing,

      // Fetching
      getAmounts,
      getActiveEmails,
      setPaymentsData,
      refreshInvoices, // NEW: Export the refresh method

      // Invoice CRUD
      createInvoice,
      updateInvoice,
      deleteInvoice,

      // Revenue CRUD (SAFE & GUARANTEED)
      addRevenueEntry,
      updateRevenueEntry,
      deleteRevenueEntry,

      // Optimistic
      removeProjectOptimistic,
      addProjectOptimistic,

      // Realtime status
      isConnected: realtimeStore.isConnected,
      hasPendingOperations: realtimeStore.hasPendingOperations,
    };
  },
  {
    persist: {
      paths: [
        "dbResponse",
        "payments",
        "invoicing",
        "warnings",
        "activeEmails",
      ],
    },
  }
);