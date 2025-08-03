<template>
  <main>
    <main-display
      :currency-in-use="currencyInUse"
      :invoices="amountArray"
      @new-amount-posted="getAmounts()"
    />
  </main>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { invoices } from "@/stores/invoiceState";
const invoiceArray = invoices();
import { setLogin } from "@/stores/loginState";

// Pinia store
const loginState = setLogin();

const currencyInUse = ref("EUR");
const amountArray = ref([]);
const warnings = ref([]); // Will store objects like: { title: 'duplicate', item: {...} }

// Helper to process data: find unknown issuers and duplicates
const processIncomingData = (rawArray) => {
  const seen = new Set();
  const unique = [];

  rawArray.forEach((item) => {
    const uniqueKey = item.invoiceNumber || item.id || JSON.stringify(item); // Adjust key logic as needed

    // Check for UNKNOWN ISSUER
    if (item.issuer === "UNKNOWN ISSUER") {
      warnings.value.push({
        title: `unknown supplier`,
        item,
      });
      unique.push(item); // allow UNKNOWN ISSUER in data
      return;
    }

    // Check for duplicates
    if (seen.has(uniqueKey)) {
      warnings.value.push({
        title: `duplicate`,
        item,
      });
    } else {
      seen.add(uniqueKey);
      unique.push(item);
    }
  });
   invoiceArray.warnings = warnings.value
  return unique;
};

const getAmounts = async () => {
  console.log("Starting to fetch...");
  const token = localStorage.getItem("token") || setLogin.token;
  if (!token) return console.log("No token found");

  const res = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/get`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });

  const data = await res.json();
  console.log("Raw data example:", data.amounts?.[0]);

  if (Array.isArray(data.amounts)) {
    const filtered = processIncomingData(data.amounts);
    amountArray.value = filtered;
    invoiceArray.dbResponse = filtered;
  }
  console.log("⚠️",warnings.value);
  
};

onMounted(() => {
  getAmounts();
});
</script>