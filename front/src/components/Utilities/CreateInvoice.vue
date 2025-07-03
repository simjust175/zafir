<template>
    <v-dialog v-model="dialog" max-width="800px" persistent scrollable>
      <v-card class="pa-4">
        <v-card-title class="text-h6 font-weight-bold">
          🧾 Create Invoice
          <v-spacer />
          <v-btn icon @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
  
        <v-divider class="mb-4" />
  
        <v-form ref="form" @submit.prevent="submit">
          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field v-model="invoice.issuer" label="Issuer" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="invoice.recipient" label="Recipient" required />
            </v-col>
  
            <v-col cols="12" md="6">
              <v-text-field v-model="invoice.email" label="Recipient Email" type="email" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="invoice.date" label="Invoice Date" type="date" required />
            </v-col>
          </v-row>
  
          <v-divider class="my-4" />
  
          <div class="text-subtitle-1 font-weight-medium mb-2">Invoice Items</div>
          <v-row v-for="(item, i) in invoice.items" :key="i" align="center" dense>
            <v-col cols="5">
              <v-text-field v-model="item.description" label="Description" />
            </v-col>
            <v-col cols="3">
              <v-text-field v-model.number="item.quantity" label="Qty" type="number" />
            </v-col>
            <v-col cols="3">
              <v-text-field v-model.number="item.price" label="Unit Price (€)" type="number" />
            </v-col>
            <v-col cols="1">
              <v-btn icon color="red" @click="removeItem(i)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-btn variant="text" @click="addItem" class="mt-2">+ Add Item</v-btn>
  
          <v-divider class="my-4" />
  
          <v-row justify="end">
            <v-col cols="12" class="text-right text-h6 font-weight-bold">
              Total: €{{ total.toFixed(2) }}
            </v-col>
          </v-row>
  
          <v-card-actions class="justify-end">
            <v-btn text @click="close">Cancel</v-btn>
            <v-btn color="primary" @click="submit" :disabled="!canSubmit">Send Invoice</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </template>
  
  <script setup>
  import { ref, reactive, computed, defineExpose } from 'vue';
  
  const dialog = ref(false);
  const form = ref(null);
  
  const invoice = reactive({
    issuer: '',
    recipient: '',
    email: '',
    date: new Date().toISOString().substr(0, 10),
    items: [{ description: '', quantity: 1, price: 0 }]
  });
  
  const total = computed(() =>
    invoice.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
  );
  
  const canSubmit = computed(() => {
    return (
      invoice.issuer &&
      invoice.recipient &&
      invoice.email &&
      invoice.items.length > 0 &&
      total.value > 0
    );
  });
  
  const addItem = () => {
    invoice.items.push({ description: '', quantity: 1, price: 0 });
  };
  
  const removeItem = (index) => {
    invoice.items.splice(index, 1);
  };
  
  const close = () => {
    dialog.value = false;
  };
  
  const open = () => {
    dialog.value = true;
  };
  
  const submit = () => {
    if (!canSubmit.value) return;
  
    // Placeholder for actual email/send logic
    console.log('Invoice to send as PDF attachment:', { ...invoice, total: total.value });
    close();
  };
  
  defineExpose({ open });
  </script>