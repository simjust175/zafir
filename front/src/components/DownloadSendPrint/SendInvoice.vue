<template>
  <div>
    <!-- <h5>{{ props.payments }}</h5> -->
    <button 
      class="action-btn send"
      :class="{ loading: loading }"
      :disabled="loading"
      title="Send summary"
      @click="dialog = true"
    >
      <svg
        v-if="!loading"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <line
          x1="22"
          y1="2"
          x2="11"
          y2="13"
        />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
      <span
        v-if="loading"
        class="spinner"
      />
    </button>

    <v-dialog
      v-model="dialog"
      max-width="440"
    >
      <div class="dialog-container">
        <div class="dialog-header">
          <h2 class="dialog-title">
            Send Invoice Summary
          </h2>
          <button
            class="close-btn"
            @click="dialog = false"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line
                x1="18"
                y1="6"
                x2="6"
                y2="18"
              />
              <line
                x1="6"
                y1="6"
                x2="18"
                y2="18"
              />
            </svg>
          </button>
        </div>

        <div class="dialog-body">
          <p class="dialog-description">
            Send a PDF summary of all invoices for this project to the recipient.
          </p>
          
          <div class="form-field">
            <label class="field-label">Email Address <span class="required">*</span></label>
            <input
              v-model="email"
              type="email"
              class="text-input"
              :class="{ error: emailError }"
              placeholder="recipient@company.com"
            >
            <span
              v-if="emailError"
              class="error-message"
            >{{ emailError }}</span>
          </div>

          <div class="form-field">
            <label class="field-label">Recipient Name <span class="required">*</span></label>
            <input
              v-model="recipient"
              type="text"
              class="text-input"
              :class="{ error: recipientError }"
              placeholder="John Doe"
            >
            <span
              v-if="recipientError"
              class="error-message"
            >{{ recipientError }}</span>
          </div>

          <div class="form-field">
            <label class="field-label">Language</label>
            <div class="toggle-group">
              <button 
                class="toggle-btn" 
                :class="{ active: language === 'en' }"
                @click="language = 'en'"
              >
                English
              </button>
              <button 
                class="toggle-btn" 
                :class="{ active: language === 'nl' }"
                @click="language = 'nl'"
              >
                Nederlands
              </button>
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <button
            class="btn-secondary"
            @click="dialog = false"
          >
            Cancel
          </button>
          <button
            class="btn-primary"
            :disabled="loading"
            @click="checkBeforeSend"
          >
            <svg
              v-if="!loading"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line
                x1="22"
                y1="2"
                x2="11"
                y2="13"
              />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            <span
              v-if="loading"
              class="spinner light"
            />
            <span>{{ loading ? 'Sending...' : 'Send Email' }}</span>
          </button>
        </div>
      </div>
    </v-dialog>

    <v-dialog
      v-model="warningDialog"
      max-width="400"
    >
      <div class="dialog-container">
        <div class="dialog-header warning">
          <div class="dialog-icon">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line
                x1="12"
                y1="9"
                x2="12"
                y2="13"
              />
              <line
                x1="12"
                y1="17"
                x2="12.01"
                y2="17"
              />
            </svg>
          </div>
          <h2 class="dialog-title">
            Pending Verification
          </h2>
          <button
            class="close-btn"
            @click="warningDialog = false"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line
                x1="18"
                y1="6"
                x2="6"
                y2="18"
              />
              <line
                x1="6"
                y1="6"
                x2="18"
                y2="18"
              />
            </svg>
          </button>
        </div>
        <div class="dialog-body">
          <p>Some invoices have not been verified yet. Would you like to proceed with sending this summary?</p>
        </div>
        <div class="dialog-footer">
          <button
            class="btn-secondary"
            @click="warningDialog = false"
          >
            Cancel
          </button>
          <button
            class="btn-warning"
            @click="forceSend"
          >
            Continue Anyway
          </button>
        </div>
      </div>
    </v-dialog>

    <v-dialog
      v-model="successDialog"
      max-width="360"
    >
      <div class="dialog-container success-dialog">
        <div class="success-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#10b981"
            stroke-width="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h2 class="success-title">
          Email Sent Successfully
        </h2>
        <p class="success-message">
          The invoice summary has been sent to {{ email }}
        </p>
        <button
          class="btn-success"
          @click="successDialog = false"
        >
          Done
        </button>
      </div>
    </v-dialog>
  </div>
</template>

<!-- eslint-disable vue/require-default-prop -->
<script setup>
import { ref, watch } from "vue";
import { invoices } from "@/stores/invoiceState";
const invoiceStore = invoices()
const emit = defineEmits(["email-sent", "refresh-data"]);
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
const warningDialog = ref(false);
const successDialog = ref(false);
const loading = ref(false);
const email = ref("");
const recipient = ref("");
const language = ref("en");
const emailError = ref("");
const recipientError = ref("");

const validate = () => {
  emailError.value = "";
  recipientError.value = "";
  
  if (!email.value) {
    emailError.value = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = "Please enter a valid email";
  }
  
  if (!recipient.value) {
    recipientError.value = "Recipient name is required";
  }
  
  return !emailError.value && !recipientError.value;
};

const checkBeforeSend = () => {
  if (!validate()) return;

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
  
  emit("refresh-data");
  
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

    dialog.value = false;
    successDialog.value = true;
    emit("email-sent");
  } catch (err) {
    console.error("Failed to send invoice email", err);
  } finally {
    loading.value = false;
  }
};
watch(
  () => props.payments,
  (v) => console.log('SendInvoice payments changed:', v.map(p => p.project)),
  { deep: true }
);

</script>

<style scoped>
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  color: #666;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: #fafafa;
  border-color: #d4d4d4;
  color: #171717;
}

.action-btn.send:hover {
  background: #6366F1;
  border-color: #171717;
  color: #fff;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #eaeaea;
  border-top-color: #171717;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner.light {
  border-color: rgba(255,255,255,0.3);
  border-top-color: #fff;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.dialog-container {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid #eaeaea;
}

.dialog-header.warning {
  background: #fffbeb;
  border-bottom-color: #fde68a;
}

.dialog-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #fef3c7;
  border-radius: 10px;
  color: #d97706;
}

.dialog-title {
  flex: 1;
  font-size: 17px;
  font-weight: 600;
  color: #171717;
  margin: 0;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #999;
  cursor: pointer;
  transition: all 0.15s ease;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #171717;
}

.dialog-body {
  padding: 24px;
}

.dialog-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 20px;
}

.dialog-body p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.form-field {
  margin-bottom: 16px;
}

.form-field:last-child {
  margin-bottom: 0;
}

.field-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #171717;
  margin-bottom: 6px;
}

.required {
  color: #ef4444;
}

.text-input {
  width: 100%;
  height: 42px;
  padding: 0 14px;
  font-size: 14px;
  color: #171717;
  background: #fafafa;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.text-input:focus {
  outline: none;
  border-color: #171717;
  background: #fff;
}

.text-input.error {
  border-color: #ef4444;
}

.text-input::placeholder {
  color: #999;
}

.error-message {
  display: block;
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}

.toggle-group {
  display: flex;
  gap: 8px;
}

.toggle-btn {
  flex: 1;
  height: 38px;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  background: #fafafa;
  border: 1px solid #eaeaea;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.toggle-btn:hover {
  background: #f5f5f5;
}

.toggle-btn.active {
  background: #171717;
  border-color: #171717;
  color: #fff;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background: #fafafa;
  border-top: 1px solid #eaeaea;
}

.btn-secondary,
.btn-primary,
.btn-warning,
.btn-success {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.btn-secondary {
  background: #fff;
  color: #171717;
  border: 1px solid #eaeaea;
}

.btn-secondary:hover {
  background: #f5f5f5;
}

.btn-primary {
  background: #171717;
  color: #fff;
}

.btn-primary:hover {
  background: #000;
}

.btn-primary:disabled {
  background: #d4d4d4;
  cursor: not-allowed;
}

.btn-warning {
  background: #f59e0b;
  color: #fff;
}

.btn-warning:hover {
  background: #d97706;
}

.btn-success {
  background: #10b981;
  color: #fff;
  width: 100%;
  margin-top: 16px;
}

.btn-success:hover {
  background: #059669;
}

.success-dialog {
  padding: 32px 24px;
  text-align: center;
}

.success-icon {
  margin-bottom: 16px;
}

.success-title {
  font-size: 18px;
  font-weight: 600;
  color: #171717;
  margin: 0 0 8px;
}

.success-message {
  font-size: 14px;
  color: #666;
  margin: 0;
}
</style>
