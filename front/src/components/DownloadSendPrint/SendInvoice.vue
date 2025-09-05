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

    <!-- Main Send Dialog -->
    <v-dialog
      v-model="dialog"
      max-width="500"
    >
      <v-card
        width="500"
        rounded="xl"
        class="pa-4"
      >
        <v-card-title class="text-h6 font-weight-medium d-flex align-start justify-space-between">
          Send Invoice
          <set-sender-email />
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
              :rules="[
                v => !!v || 'Required',
                v => /.+@.+\..+/.test(v) || 'Invalid email'
              ]"
              required
              prepend-icon="mdi-email-outline"
            />

            <!-- Recipient Input -->
            <v-text-field
              v-model="recipient"
              label="Recipient Name"
              type="text"
              :rules="[v => !!v || 'Required']"
              required
              prepend-icon="mdi-account-outline"
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
            @click="checkBeforeSend"
          >
            Send
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ⚠️ Warning Confirmation Dialog -->
    <v-dialog
      v-model="warningDialog"
      max-width="450"
    >
      <v-card
        rounded="xl"
        class="pa-4"
      >
        <v-card-title class="text-h6 font-weight-bold text-warning-darken-2">
          ⚠️ Not all invoices are double-checked
        </v-card-title>
        <v-card-text class="text-body-2 text-grey-darken-2">
          Some invoices have not been double-checked yet.  
          Are you sure you want to continue sending this summary?
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            text
            @click="warningDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="warning"
            @click="forceSend"
          >
            Yes, Continue
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ✅ Success Dialog -->
    <v-dialog
      v-model="successDialog"
      max-width="400"
    >
      <v-card
        rounded="xl"
        class="pa-6 text-center"
      >
        <!-- Animated Green Check -->
        <svg
          class="checkmark"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 52 52"
        >
          <circle
            class="checkmark-circle"
            cx="26"
            cy="26"
            r="25"
            fill="none"
          />
          <path
            class="checkmark-check"
            fill="none"
            d="M14 27l7 7 16-16"
          />
        </svg>

        <v-card-title class="text-h6 font-weight-bold">
          Email Sent Successfully!
        </v-card-title>
        <v-card-actions class="justify-center mt-2">
          <v-btn
            color="success"
            @click="successDialog = false"
          >
            OK
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["email-sent"]);
const props = defineProps({
  includesBtw: Boolean,
  groupedInvoices: Array,
  total: Number,
  projectName: String,
  payments: Array,
  currentProjectId: Number,
  doubleChecked: Boolean
});

const dialog = ref(false);
const setSender = ref(false)
const warningDialog = ref(false);
const successDialog = ref(false);
const loading = ref(false);
const email = ref("");
const recipient = ref("");
const language = ref("en");
const formValid = ref(false);
const form = ref(null);

const checkBeforeSend = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;

  if (!props.doubleChecked) {
    warningDialog.value = true;
  } else {
    handleSend();
  }
};

const forceSend = () => {
  warningDialog.value = false;
  handleSend();
};

const handleSend = async () => {
  loading.value = true;
  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/email/send-invoice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: email.value,
        language: language.value,
        recipient: recipient.value || "To whom it may concern",
        projectName: props.projectName,
        total: props.total,
        groupedInvoices: props.groupedInvoices,
        groupedPayments: props.payments
      })
    });

    if (!res.ok) throw new Error("Failed to send invoice");

    console.log("✅ Invoice email sent");
    dialog.value = false;
    successDialog.value = true;
    emit("email-sent");
  } catch (err) {
    console.error("❌ Failed to send invoice email", err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.checkmark {
  width: 80px;
  height: 80px;
  stroke-width: 2;
  stroke: #4caf50;
  stroke-miterlimit: 10;
  margin: 10px auto 20px;
  display: block;
}

.checkmark-circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 2;
  stroke: #4caf50;
  fill: none;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark-check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  stroke-width: 2;
  stroke: #4caf50;
  animation: stroke 0.4s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards;
}

@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}
</style>