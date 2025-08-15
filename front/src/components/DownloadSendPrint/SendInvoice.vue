<template>
  <div>
    <!-- Trigger Button -->
    <v-tooltip
      location="top"
      open-delay="300"
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          icon="mdi-send-variant-outline"
          :loading="loading"
          :disabled="loading"
          @click="dialog = true"
        />
      </template>
      <span>Send summary</span>
    </v-tooltip>
  
    <!-- Modal Dialog -->
    <v-dialog
      v-model="dialog"
      max-width="500"
    >
      <v-card
        width="500"
        rounded="xl"
        class="pa-4"
      >
        <v-card-title class="text-h6 font-weight-medium">
          Send Invoice
        </v-card-title>
  
        <v-card-text>
          <v-form
            ref="form"
            v-model="formValid"
          >
            <!-- Email Input -->
            <v-text-field
              v-model="email"
              label="Recipient Email"
              type="email"
              :rules="[v => !!v || 'Required', v => /.+@.+\..+/.test(v) || 'Invalid email']"
              required
              prepend-icon="mdi-email-outline"
            />

            <!-- Email Input -->
            <v-text-field
              v-model="recipient"
              label="Recipient Name"
              type="text"
              :rules="[v => !!v || 'Required']"
              required
              prepend-icon="mdi-email-outline"
            />
  
            <!-- Language Toggle -->
            <v-switch
              v-model="language"
              :label="language === 'nl' ? 'Taal: Nederlands' : 'Language: English'"
              true-value="en"
              false-value="nl"
              inset
            />
          </v-form>
        </v-card-text>
  
        <v-card-actions class="justify-end">
          <v-btn
            text
            @click="dialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="loading"
            :disabled="!formValid"
            @click="handleSend"
          >
            Send
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
  
<!-- eslint-disable vue/require-default-prop -->
  <script setup>
  import { ref } from "vue";
  
  const emit =defineEmits(['email-sent'])
  const props = defineProps({
    includesBtw: Boolean,
    groupedInvoices: Array,
    total: Number,
    projectName: String,
    payments: Array, 
    currentProjectId: Number
  });
  
  const dialog = ref(false);
  const loading = ref(false);
  const email = ref('');
  const recipient = ref('');
  const language = ref('en');
  const formValid = ref(false);
  const form = ref(null);
  
  const handleSend = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;

  loading.value = true;
  
  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/email/send-invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email.value,
        language: language.value,
        recipient: recipient.value || 'To whom it my concern',
        projectName: props.projectName,
        total: props.total,
        groupedInvoices: props.groupedInvoices,
        groupedPayments: props.payments
      })
    });

    if (!res.ok) throw new Error('Failed to send invoice');

    console.log("✅ Invoice email sent");
    dialog.value = false;
    emit('email-sent')
  } catch (err) {
    console.error("❌ Failed to send invoice email", err);
  } finally {
    loading.value = false;
  }
};
  </script>