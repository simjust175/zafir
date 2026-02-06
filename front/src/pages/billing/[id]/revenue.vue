<template>
  <div class="revenue-page">
    <header class="page-header">
      <div class="header-top">
        <a
          href="#"
          class="back-link"
          @click.prevent="goBack"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Back to Costs</span>
        </a>
      </div>
      <div class="header-main">
        <div class="header-content">
          <div class="header-badge">
            <!-- Revenue Tracking -->
            {{ project_name }}
          </div>
          <h1 class="page-title">
            Project Revenue
          </h1>
          <p class="page-subtitle">
            Track invoices sent and payments received for this project
          </p>
        </div>
        <div class="header-actions">
          <button
            class="action-btn-dashboard"
            :disabled="isPrinting"
            @click="handlePrint"
          >
            <svg
              v-if="!isPrinting"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect
                x="6"
                y="14"
                width="12"
                height="8"
              />
            </svg>
            <span
              v-if="isPrinting"
              class="spinner-sm"
            />
            <span>Print</span>
          </button>
          <button
            class="action-btn-dashboard"
            :disabled="isDownloading"
            @click="handleDownload"
          >
            <svg
              v-if="!isDownloading"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line
                x1="12"
                y1="15"
                x2="12"
                y2="3"
              />
            </svg>
            <span
              v-if="isDownloading"
              class="spinner-sm"
            />
            <span>Download</span>
          </button>
          <button
            class="action-btn-dashboard primary"
            :disabled="isSending"
            @click="handleSend"
          >
            <svg
              v-if="!isSending"
              width="18"
              height="18"
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
              v-if="isSending"
              class="spinner-sm"
            />
            <span>Send</span>
          </button>
        </div>
      </div>
    </header>

    <div class="dashboard-grid">
      <div class="metrics-section">
        <div class="metric-card invoiced">
          <div class="metric-header">
            <div class="metric-icon-wrapper">
              <div class="metric-icon-bg" />
              <svg
                class="metric-icon"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line
                  x1="16"
                  y1="13"
                  x2="8"
                  y2="13"
                />
                <line
                  x1="16"
                  y1="17"
                  x2="8"
                  y2="17"
                />
              </svg>
            </div>
            <button
              class="add-btn"
              title="Add invoice"
              @click="openDialog('invoiced')"
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
                  x1="12"
                  y1="5"
                  x2="12"
                  y2="19"
                />
                <line
                  x1="5"
                  y1="12"
                  x2="19"
                  y2="12"
                />
              </svg>
            </button>
          </div>
          <div class="metric-body">
            <span class="metric-label">Total Invoiced</span>
            <span class="metric-value">{{ formatCurrency(totalInvoiced) }}</span>
            <span class="metric-meta">{{ invoicingEntries.length }} invoice{{ invoicingEntries.length !== 1 ? 's' : '' }} sent</span>
          </div>
          <div class="metric-bar">
            <div
              class="metric-bar-fill invoiced"
              :style="{ width: '100%' }"
            />
          </div>
        </div>

        <div class="metric-card paid">
          <div class="metric-header">
            <div class="metric-icon-wrapper paid">
              <div class="metric-icon-bg" />
              <svg
                class="metric-icon"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <button
              class="add-btn"
              title="Add payment"
              @click="openDialog('paid')"
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
                  x1="12"
                  y1="5"
                  x2="12"
                  y2="19"
                />
                <line
                  x1="5"
                  y1="12"
                  x2="19"
                  y2="12"
                />
              </svg>
            </button>
          </div>
          <div class="metric-body">
            <span class="metric-label">Payments Received</span>
            <span class="metric-value success">{{ formatCurrency(totalPaid) }}</span>
            <span class="metric-meta">{{ paymentEntries.length }} payment{{ paymentEntries.length !== 1 ? 's' : '' }} received</span>
          </div>
          <div class="metric-bar">
            <div
              class="metric-bar-fill paid"
              :style="{ width: totalInvoiced > 0 ? `${Math.min(percentPaid, 100)}%` : '0%' }"
            />
          </div>
        </div>

        <div
          class="metric-card outstanding"
          :class="{ positive: outstanding <= 0 }"
        >
          <div class="metric-header">
            <div
              class="metric-icon-wrapper outstanding"
              :class="{ positive: outstanding <= 0 }"
            >
              <div class="metric-icon-bg" />
              <svg
                class="metric-icon"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div class="metric-body">
            <span class="metric-label">Outstanding Balance</span>
            <span
              class="metric-value"
              :class="{ positive: outstanding <= 0 }"
            >{{ formatCurrency(Math.abs(outstanding)) }}</span>
            <span
              class="metric-meta"
              :class="{ positive: outstanding <= 0 }"
            >
              {{ outstanding <= 0 ? 'Fully collected' : `${percentPaid}% collected` }}
            </span>
          </div>
          <div class="metric-bar">
            <div
              class="metric-bar-fill outstanding"
              :class="{ positive: outstanding <= 0 }"
              :style="{ width: `${100 - Math.min(percentPaid, 100)}%` }"
            />
          </div>
        </div>
      </div>

      <!-- v-if="totalInvoiced > 0" -->
      <div
        class="collection-status-card"
      >
        <div class="status-header">
          <h3>Collection Progress</h3>
          <span
            class="status-badge"
            :class="{ complete: percentPaid >= 100 }"
          >
            {{ percentPaid >= 100 ? 'Complete' : 'In Progress' }}
          </span>
        </div>
        <div class="progress-ring-container">
          <svg
            class="progress-ring"
            viewBox="0 0 120 120"
          >
            <circle
              class="progress-ring-bg"
              cx="60"
              cy="60"
              r="52"
            />
            <circle 
              class="progress-ring-fill" 
              cx="60" 
              cy="60" 
              r="52"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="circumference - (percentPaid / 100) * circumference"
              :class="{ complete: percentPaid >= 100 }"
            />
          </svg>
          <div class="progress-ring-content">
            <span class="progress-percent">{{ percentPaid }}%</span>
            <span class="progress-label">Collected</span>
          </div>
        </div>
        <div class="status-details">
          <div class="status-row">
            <span class="status-dot paid" />
            <span class="status-text">Received</span>
            <span class="status-value">{{ formatCurrency(totalPaid) }}</span>
          </div>
          <div class="status-row">
            <span class="status-dot outstanding" />
            <span class="status-text">Outstanding</span>
            <span class="status-value">{{ formatCurrency(Math.max(outstanding, 0)) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="entries-section">
      <div class="entries-column">
        <div class="column-header">
          <div class="column-title-group">
            <div class="column-icon invoiced">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <h2>Invoices Sent</h2>
          </div>
          <span class="entry-count">{{ invoicingEntries.length }}</span>
        </div>
        <div class="entries-list">
          <div
            v-if="invoicingEntries.length === 0"
            class="empty-state"
          >
            <div class="empty-icon-wrapper">
              <div class="empty-icon-glow" />
              <div class="empty-icon-bg">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
            </div>
            <p class="empty-title">
              No invoices sent yet
            </p>
            <p class="empty-desc">
              Record invoices you've sent to your client
            </p>
            <button
              class="empty-cta"
              @click="openDialog('invoiced')"
            >
              Add first invoice
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line
                  x1="5"
                  y1="12"
                  x2="19"
                  y2="12"
                />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
          <TransitionGroup name="list">
            <div
              v-for="entry in invoicingEntries"
              :key="entry.id"
              class="entry-card"
            >
              <div class="entry-left">
                <div class="entry-indicator invoiced" />
                <div class="entry-info">
                  <span class="entry-amount">{{ formatCurrency(entry.amount) }}</span>
                  <span class="entry-date">{{ formatDate(entry.created_on) }}</span>
                </div>
              </div>
              <div>
                <span
                  v-if="entry.invoice_number"
                  class="entry-invoice-number"
                >#{{ entry.invoice_number }}</span>
              </div>
              <div class="entry-actions">
                <button
                  class="action-btn edit"
                  title="Edit"
                  @click="editEntry('invoiced', entry)"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  class="action-btn delete"
                  title="Delete"
                  @click="confirmDelete('invoicing', entry)"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>

      <div class="entries-column">
        <div class="column-header">
          <div class="column-title-group">
            <div class="column-icon paid">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2>Payments Received</h2>
          </div>
          <span class="entry-count success">{{ paymentEntries.length }}</span>
        </div>
        <div class="entries-list">
          <div
            v-if="paymentEntries.length === 0"
            class="empty-state"
          >
            <div class="empty-icon-wrapper">
              <div class="empty-icon-glow success" />
              <div class="empty-icon-bg success">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
            </div>
            <p class="empty-title">
              No payments received yet
            </p>
            <p class="empty-desc">
              Record payments received from your client
            </p>
            <button
              class="empty-cta"
              @click="openDialog('paid')"
            >
              Add first payment
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line
                  x1="5"
                  y1="12"
                  x2="19"
                  y2="12"
                />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
          <TransitionGroup name="list">
            <div
              v-for="entry in paymentEntries"
              :key="entry.id"
              class="entry-card"
            >
              <div class="entry-left">
                <div class="entry-indicator paid" />
                <div class="entry-info">
                  <span class="entry-amount success">{{ formatCurrency(entry.amount) }}</span>
                  <span class="entry-date">{{ formatDate(entry.created_on) }}</span>
                </div>
              </div>
              <div class="entry-actions">
                <button
                  class="action-btn edit"
                  title="Edit"
                  @click="editEntry('paid', entry)"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  class="action-btn delete"
                  title="Delete"
                  @click="confirmDelete('payments', entry)"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>

    <v-dialog
      v-model="showDialog"
      max-width="420"
      persistent
    >
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">
          <div
            class="dialog-icon"
            :class="dialogType"
          >
            <svg
              v-if="dialogType === 'invoiced'"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <svg
              v-else
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          {{ isEditMode ? 'Edit' : 'Add' }} {{ dialogType === 'invoiced' ? 'Invoice' : 'Payment' }}
        </v-card-title>
        <v-card-text class="dialog-content">
          <v-text-field
            v-model="dialogAmount"
            label="Amount"
            prefix="€"
            type="number"
            variant="outlined"
            autofocus
            hide-details="auto"
            class="amount-input"
          />
          <v-text-field
            v-if="dialogType === 'invoiced'"
            v-model="dialogInvoiceNumber"
            label="Invoice Number (optional)"
            variant="outlined"
            hide-details="auto"
            class="invoice-number-input"
            placeholder="e.g. INV-2026-001"
          />
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-btn
            variant="text"
            class="cancel-btn"
            @click="closeDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            class="save-btn"
            :class="dialogType"
            :loading="saving"
            @click="saveEntry"
          >
            {{ isEditMode ? 'Update' : 'Add' }} {{ dialogType === 'invoiced' ? 'Invoice' : 'Payment' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="showDeleteDialog"
      max-width="380"
    >
      <v-card class="dialog-card delete-dialog">
        <v-card-title class="dialog-title">
          <div class="dialog-icon delete">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </div>
          Delete {{ deleteTarget?.table === 'invoicing' ? 'Invoice' : 'Payment' }}
        </v-card-title>
        <v-card-text class="dialog-content">
          <p class="delete-message">
            Are you sure you want to delete this {{ deleteTarget?.table === 'invoicing' ? 'invoice' : 'payment' }}? This action cannot be undone.
          </p>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-btn
            variant="text"
            class="cancel-btn"
            @click="showDeleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            class="delete-btn"
            :loading="deleting"
            @click="deleteEntry"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="sendDialog"
      max-width="440"
    >
      <div class="send-dialog">
        <div class="send-dialog-header">
          <h2>Send Revenue Summary</h2>
          <button
            class="close-btn"
            @click="sendDialog = false"
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
        <div class="send-dialog-body">
          <p class="send-description">
            Send a PDF summary of invoices sent and payments received for this project.
          </p>
          
          <div class="send-form-field">
            <label class="send-field-label">Email Address <span class="required">*</span></label>
            <input
              v-model="sendEmail"
              type="email"
              class="send-text-input"
              :class="{ error: sendEmailError }"
              placeholder="recipient@company.com"
            >
            <span
              v-if="sendEmailError"
              class="send-error-msg"
            >{{ sendEmailError }}</span>
          </div>

          <div class="send-form-field">
            <label class="send-field-label">Recipient Name <span class="required">*</span></label>
            <input
              v-model="sendRecipient"
              type="text"
              class="send-text-input"
              :class="{ error: sendRecipientError }"
              placeholder="John Doe"
            >
            <span
              v-if="sendRecipientError"
              class="send-error-msg"
            >{{ sendRecipientError }}</span>
          </div>

          <div class="send-form-field">
            <label class="send-field-label">Language</label>
            <div class="send-toggle-group">
              <button 
                class="send-toggle-btn" 
                :class="{ active: sendLanguage === 'en' }"
                @click="sendLanguage = 'en'"
              >
                English
              </button>
              <button 
                class="send-toggle-btn" 
                :class="{ active: sendLanguage === 'nl' }"
                @click="sendLanguage = 'nl'"
              >
                Nederlands
              </button>
            </div>
          </div>
        </div>
        <div class="send-dialog-footer">
          <button
            class="send-btn-cancel"
            @click="sendDialog = false"
          >
            Cancel
          </button>
          <button
            class="send-btn-primary"
            :disabled="sendingEmail"
            @click="submitSendEmail"
          >
            <svg
              v-if="!sendingEmail"
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
              v-if="sendingEmail"
              class="spinner-sm-light"
            />
            {{ sendingEmail ? 'Sending...' : 'Send Email' }}
          </button>
        </div>
      </div>
    </v-dialog>

    <v-snackbar
      v-model="snack.show"
      :color="snack.color"
      location="top"
      timeout="3000"
    >
      {{ snack.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { invoices } from '@/stores/invoiceState.js'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const route = useRoute()
const router = useRouter()

const circumference = 2 * Math.PI * 52
const isPrinting = ref(false)
const isDownloading = ref(false)
const isSending = ref(false)
const sendDialog = ref(false)
const sendEmail = ref('')
const sendRecipient = ref('')
const sendLanguage = ref('en')
const sendEmailError = ref('')
const sendRecipientError = ref('')
const sendingEmail = ref(false)

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/table')
  }
}
const invoiceStore = invoices()

const projectId = computed(() => Number(route.params.id))

const project_name = computed(()=> invoiceStore.dbResponse.filter(e => e.project_id === projectId.value)[0].project_name)

const invoicingEntries = computed(() => {
  return (invoiceStore.invoicing || [])
    .filter(e => e.project === projectId.value)
    .sort((a, b) => new Date(b.created_on || 0) - new Date(a.created_on || 0))
})

const paymentEntries = computed(() => {
  return (invoiceStore.payments || [])
    .filter(e => e.project === projectId.value)
    .sort((a, b) => new Date(b.created_on || 0) - new Date(a.created_on || 0))
})

const totalInvoiced = computed(() => {
  return invoicingEntries.value.reduce((sum, e) => sum + Number(e.amount || 0), 0)
})

const totalPaid = computed(() => {
  return paymentEntries.value.reduce((sum, e) => sum + Number(e.amount || 0), 0)
})

const outstanding = computed(() => totalInvoiced.value - totalPaid.value)

const percentPaid = computed(() => {
  if (totalInvoiced.value === 0) return 0
  return Math.round((totalPaid.value / totalInvoiced.value) * 100)
})

const showDialog = ref(false)
const dialogType = ref('invoiced')
const dialogAmount = ref('')
const dialogInvoiceNumber = ref('')
const isEditMode = ref(false)
const editEntryId = ref(null)
const saving = ref(false)

const showDeleteDialog = ref(false)
const deleteTarget = ref(null)
const deleting = ref(false)

const snack = ref({ show: false, color: 'success', message: '' })

const formatCurrency = (val) => {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(Number(val) || 0)
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'Recently'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'Recently'
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const openDialog = (type) => {
  dialogType.value = type
  isEditMode.value = false
  dialogAmount.value = ''
  dialogInvoiceNumber.value = ''
  editEntryId.value = null
  showDialog.value = true
}

const editEntry = (type, entry) => {
  dialogType.value = type
  isEditMode.value = true
  dialogAmount.value = entry.amount
  dialogInvoiceNumber.value = entry.invoice_number || ''
  editEntryId.value = entry.id
  showDialog.value = true
}

const closeDialog = () => {
  showDialog.value = false
  dialogAmount.value = ''
  dialogInvoiceNumber.value = ''
  isEditMode.value = false
  editEntryId.value = null
}

const saveEntry = async () => {
  const table = dialogType.value === 'invoiced' ? 'invoicing' : 'payments'
  const amount = Number(dialogAmount.value)
  const invoiceNumber = dialogInvoiceNumber.value.trim() || null
  
  if (!amount || amount <= 0) {
    snack.value = { show: true, color: 'error', message: 'Please enter a valid amount' }
    return
  }

  saving.value = true

  try {
    if (isEditMode.value && editEntryId.value) {
      if (table === 'invoicing') {
        await invoiceStore.updateInvoicing(editEntryId.value, amount, invoiceNumber)
      } else {
        await invoiceStore.updatePayment(editEntryId.value, amount)
      }
      snack.value = { show: true, color: 'success', message: `${table === 'invoicing' ? 'Invoice' : 'Payment'} updated` }
    } else {
      if (table === 'invoicing') {
        await invoiceStore.createInvoicing(projectId.value, amount, invoiceNumber)
      } else {
        await invoiceStore.createPayment(projectId.value, amount)
      }
      snack.value = { show: true, color: 'success', message: `${table === 'invoicing' ? 'Invoice' : 'Payment'} added` }
    }
    
    closeDialog()
  } catch (err) {
    console.error(err)
    snack.value = { show: true, color: 'error', message: 'Failed to save. Please try again.' }
  } finally {
    saving.value = false
  }
}

const confirmDelete = (table, entry) => {
  deleteTarget.value = { table, entry }
  showDeleteDialog.value = true
}

const deleteEntry = async () => {
  if (!deleteTarget.value) return
  
  const { table, entry } = deleteTarget.value
  deleting.value = true
  
  try {
    await invoiceStore.deleteRevenueEntry(table, entry.id)
    
    snack.value = { show: true, color: 'success', message: `${table === 'invoicing' ? 'Invoice' : 'Payment'} deleted` }
    showDeleteDialog.value = false
    deleteTarget.value = null
  } catch (err) {
    console.error(err)
    snack.value = { show: true, color: 'error', message: 'Failed to delete. Please try again.' }
  } finally {
    deleting.value = false
  }
}

const buildRevenuePdf = () => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let currentY = margin

  doc.setFillColor(23, 23, 23)
  doc.rect(0, 0, pageWidth, 50, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Revenue Statement', margin, 32)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Project ID: ${projectId.value}`, pageWidth - margin, 25, { align: 'right' })
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - margin, 35, { align: 'right' })
  
  currentY = 70

  doc.setFillColor(245, 245, 245)
  doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 50, 4, 4, 'F')
  
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(9)
  doc.text('TOTAL INVOICED', margin + 15, currentY + 15)
  doc.text('TOTAL PAID', margin + 75, currentY + 15)
  doc.text('OUTSTANDING', margin + 130, currentY + 15)
  
  doc.setTextColor(23, 23, 23)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(formatCurrency(totalInvoiced.value), margin + 15, currentY + 32)
  doc.setTextColor(16, 185, 129)
  doc.text(formatCurrency(totalPaid.value), margin + 75, currentY + 32)
  doc.setTextColor(outstanding.value > 0 ? 245 : 16, outstanding.value > 0 ? 158 : 185, outstanding.value > 0 ? 11 : 129)
  doc.text(formatCurrency(Math.abs(outstanding.value)), margin + 130, currentY + 32)

  currentY = 140

  doc.setTextColor(23, 23, 23)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Invoices Sent', margin, currentY)
  currentY += 8

  if (invoicingEntries.value.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Date', 'Amount']],
      body: invoicingEntries.value.map(e => [
        formatDate(e.created_on),
        formatCurrency(e.amount)
      ]),
      foot: [['Total', formatCurrency(totalInvoiced.value)]],
      theme: 'plain',
      headStyles: { fillColor: [250, 250, 250], textColor: [100, 100, 100], fontStyle: 'bold', fontSize: 9 },
      footStyles: { fillColor: [23, 23, 23], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 6 },
      margin: { left: margin, right: margin }
    })
    currentY = doc.lastAutoTable.finalY + 20
  } else {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(150, 150, 150)
    doc.text('No invoices recorded', margin, currentY + 10)
    currentY += 30
  }

  doc.setTextColor(23, 23, 23)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Payments Received', margin, currentY)
  currentY += 8

  if (paymentEntries.value.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Date', 'Amount']],
      body: paymentEntries.value.map(e => [
        formatDate(e.created_on),
        formatCurrency(e.amount)
      ]),
      foot: [['Total', formatCurrency(totalPaid.value)]],
      theme: 'plain',
      headStyles: { fillColor: [236, 253, 245], textColor: [16, 185, 129], fontStyle: 'bold', fontSize: 9 },
      footStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 6 },
      margin: { left: margin, right: margin }
    })
  } else {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(150, 150, 150)
    doc.text('No payments recorded', margin, currentY + 10)
  }

  doc.setFillColor(23, 23, 23)
  doc.rect(0, pageHeight - 15, pageWidth, 15, 'F')
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.text('Generated by BILLIO', margin, pageHeight - 5)
  doc.text('Page 1 of 1', pageWidth - margin, pageHeight - 5, { align: 'right' })

  return doc
}

const handleDownload = async () => {
  isDownloading.value = true
  try {
    const doc = buildRevenuePdf()
    doc.save(`revenue-statement-project-${projectId.value}.pdf`)
    snack.value = { show: true, color: 'success', message: 'Revenue statement downloaded' }
  } catch (err) {
    console.error(err)
    snack.value = { show: true, color: 'error', message: 'Failed to generate PDF' }
  } finally {
    isDownloading.value = false
  }
}

const handlePrint = async () => {
  isPrinting.value = true
  try {
    const doc = buildRevenuePdf()
    doc.autoPrint()
    const blobUrl = URL.createObjectURL(doc.output('blob'))
    const printWindow = window.open(blobUrl, '_blank')
    
    if (printWindow) {
      snack.value = { show: true, color: 'success', message: 'Print dialog opened' }
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl)
      }, 10000)
    } else {
      doc.save(`revenue-statement-project-${projectId.value}-print.pdf`)
      snack.value = { show: true, color: 'info', message: 'Popup blocked - PDF downloaded instead. Open and print manually.' }
    }
  } catch (err) {
    console.error(err)
    snack.value = { show: true, color: 'error', message: 'Failed to print' }
  } finally {
    isPrinting.value = false
  }
}

const handleSend = async () => {
  sendEmailError.value = ''
  sendRecipientError.value = ''
  sendDialog.value = true
}

const projectInvoices = computed(() => {
  return invoiceStore.dbResponse?.filter(inv => inv.project === projectId.value) || []
})

const groupedInvoices = computed(() => {
  const groups = {}
  projectInvoices.value.forEach(inv => {
    const issuer = inv.issuer?.trim() || 'Unknown'
    if (!groups[issuer]) groups[issuer] = { issuer, invoices: [], totalAmount: 0, totalWithMargin: 0 }
    const g = groups[issuer]
    g.invoices.push(inv)
    g.totalAmount += Number(inv.amount) || 0
    g.totalWithMargin += (Number(inv.amount) || 0) * (1 + (Number(inv.margin) || 0) / 100)
  })
  return Object.values(groups)
})

const currentProjectMargin = computed(() => {
  const projectData = invoiceStore.dbResponse?.find(inv => inv.project_id === projectId.value || inv.project === projectId.value)
  return Number(projectData?.margin) || 0
})

const overallTotalWithMargin = computed(() => {
  return groupedInvoices.value.reduce((sum, g) => sum + g.totalWithMargin, 0)
})

const validateSendForm = () => {
  sendEmailError.value = ''
  sendRecipientError.value = ''
  
  if (!sendEmail.value) {
    sendEmailError.value = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sendEmail.value)) {
    sendEmailError.value = 'Please enter a valid email'
  }
  
  if (!sendRecipient.value) {
    sendRecipientError.value = 'Recipient name is required'
  }
  
  return !sendEmailError.value && !sendRecipientError.value
}

const submitSendEmail = async () => {
  if (!validateSendForm()) return
  
  sendingEmail.value = true
  
  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/email/send-invoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: sendEmail.value,
        language: sendLanguage.value,
        recipient: sendRecipient.value || 'To whom it may concern',
        projectName: project_name.value,
        total: overallTotalWithMargin.value,
        groupedInvoices: groupedInvoices.value,
        groupedPayments: paymentEntries.value,
        invoicingEntries: invoicingEntries.value,
        projectMargin: currentProjectMargin.value,
        totalInvoiced: totalInvoiced.value,
        outstanding: outstanding.value
      })
    })
    
    if (!res.ok) throw new Error('Failed to send email')
    
    sendDialog.value = false
    snack.value = { show: true, color: 'success', message: `Email sent to ${sendEmail.value}` }
    
    sendEmail.value = ''
    sendRecipient.value = ''
  } catch (err) {
    console.error('Failed to send email:', err)
    snack.value = { show: true, color: 'error', message: 'Failed to send email. Please try again.' }
  } finally {
    sendingEmail.value = false
  }
}
</script>

<style scoped>
.revenue-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 24px 48px;
  min-height: 100vh;
  background: linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%);
}

.page-header {
  margin-bottom: 40px;
}

.header-top {
  margin-bottom: 20px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #737373;
  text-decoration: none;
  padding: 6px 12px 6px 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.back-link:hover {
  background: #fff;
  color: #171717;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding-top: 8px;
}

.action-btn-dashboard {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #171717;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-btn-dashboard:hover:not(:disabled) {
  background: #fafafa;
  border-color: #d4d4d4;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.action-btn-dashboard:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn-dashboard.primary {
  background: linear-gradient(135deg, #171717 0%, #262626 100%);
  color: #fff;
  border-color: transparent;
}

.action-btn-dashboard.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #262626 0%, #404040 100%);
}

.action-btn-dashboard svg {
  flex-shrink: 0;
}

.spinner-sm {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .header-main {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
    padding-top: 0;
  }
  
  .action-btn-dashboard {
    flex: 1;
    justify-content: center;
    padding: 12px 14px;
  }
  
  .action-btn-dashboard span:not(.spinner-sm) {
    display: none;
  }
  
  .action-btn-dashboard svg {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 480px) {
  .header-actions {
    gap: 6px;
  }
  
  .action-btn-dashboard {
    padding: 10px;
    border-radius: 8px;
  }
}

.header-badge {
  display: inline-block;
  padding: 5px 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6366f1;
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  border-radius: 100px;
  margin-bottom: 12px;
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  color: #0f0f0f;
  margin: 0 0 8px;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.page-subtitle {
  font-size: 15px;
  color: #737373;
  margin: 0;
  line-height: 1.5;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  margin-bottom: 32px;
}

.metrics-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.metric-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.metric-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.metric-icon-wrapper {
  position: relative;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-icon-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  border-radius: 12px;
}

.metric-icon-wrapper.paid .metric-icon-bg {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
}

.metric-icon-wrapper.outstanding .metric-icon-bg {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}

.metric-icon-wrapper.outstanding.positive .metric-icon-bg {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
}

.metric-icon {
  position: relative;
  z-index: 1;
  color: #6366f1;
}

.metric-icon-wrapper.paid .metric-icon {
  color: #10b981;
}

.metric-icon-wrapper.outstanding .metric-icon {
  color: #f59e0b;
}

.metric-icon-wrapper.outstanding.positive .metric-icon {
  color: #10b981;
}

.add-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #737373;
}

.add-btn:hover {
  background: #0f0f0f;
  border-color: #0f0f0f;
  color: #fff;
  transform: scale(1.05);
}

.metric-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
}

.metric-label {
  font-size: 12px;
  font-weight: 500;
  color: #737373;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: #0f0f0f;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.metric-value.success {
  color: #10b981;
}

.metric-value.positive {
  color: #10b981;
}

.metric-meta {
  font-size: 12px;
  color: #a3a3a3;
}

.metric-meta.positive {
  color: #10b981;
}

.metric-bar {
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.metric-bar-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.metric-bar-fill.invoiced {
  background: linear-gradient(90deg, #818cf8 0%, #6366f1 100%);
}

.metric-bar-fill.paid {
  background: linear-gradient(90deg, #34d399 0%, #10b981 100%);
}

.metric-bar-fill.outstanding {
  background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
}

.metric-bar-fill.outstanding.positive {
  background: linear-gradient(90deg, #34d399 0%, #10b981 100%);
}

.collection-status-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.status-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: #0f0f0f;
  margin: 0;
}

.status-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 100px;
  background: #fef3c7;
  color: #d97706;
}

.status-badge.complete {
  background: #d1fae5;
  color: #059669;
}

.progress-ring-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
}

.progress-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-ring-bg {
  fill: none;
  stroke: #f0f0f0;
  stroke-width: 8;
}

.progress-ring-fill {
  fill: none;
  stroke: url(#gradient);
  stroke-width: 8;
  stroke-linecap: round;
  stroke: #f59e0b;
  transition: stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-ring-fill.complete {
  stroke: #10b981;
}

.progress-ring-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.progress-percent {
  font-size: 28px;
  font-weight: 700;
  color: #0f0f0f;
  letter-spacing: -0.02em;
}

.progress-label {
  font-size: 12px;
  color: #737373;
}

.status-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.paid {
  background: #10b981;
}

.status-dot.outstanding {
  background: #f59e0b;
}

.status-text {
  font-size: 13px;
  color: #737373;
  flex: 1;
}

.status-value {
  font-size: 13px;
  font-weight: 600;
  color: #0f0f0f;
}

.entries-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.entries-column {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.column-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.column-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.column-icon.invoiced {
  background: #eef2ff;
  color: #6366f1;
}

.column-icon.paid {
  background: #ecfdf5;
  color: #10b981;
}

.column-header h2 {
  font-size: 15px;
  font-weight: 600;
  color: #0f0f0f;
  margin: 0;
}

.entry-count {
  font-size: 12px;
  font-weight: 600;
  color: #6366f1;
  background: #eef2ff;
  padding: 4px 10px;
  border-radius: 100px;
}

.entry-count.success {
  color: #10b981;
  background: #ecfdf5;
}

.entries-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 360px;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-icon-wrapper {
  position: relative;
  margin-bottom: 16px;
}

.empty-icon-glow {
  position: absolute;
  inset: -12px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%);
  border-radius: 50%;
}

.empty-icon-glow.success {
  background: radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%);
}

.empty-icon-bg {
  width: 64px;
  height: 64px;
  background: #f9fafb;
  border: 1px solid #f0f0f0;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d4d4d4;
}

.empty-icon-bg.success {
  color: #a7f3d0;
}

.empty-title {
  font-size: 15px;
  font-weight: 600;
  color: #525252;
  margin: 0 0 6px;
}

.empty-desc {
  font-size: 13px;
  color: #a3a3a3;
  margin: 0 0 20px;
}

.empty-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: #0f0f0f;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.empty-cta:hover {
  background: #262626;
  transform: translateY(-1px);
}

.empty-cta svg {
  transition: transform 0.2s ease;
}

.empty-cta:hover svg {
  transform: translateX(3px);
}

.entry-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #fafafa;
  border-radius: 10px;
  transition: all 0.15s ease;
}

.entry-card:hover {
  background: #f0f0f0;
}

.entry-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.entry-indicator {
  width: 4px;
  height: 32px;
  border-radius: 2px;
}

.entry-indicator.invoiced {
  background: #6366f1;
}

.entry-indicator.paid {
  background: #10b981;
}

.entry-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.entry-amount {
  font-size: 15px;
  font-weight: 600;
  color: #0f0f0f;
}

.entry-amount.success {
  color: #10b981;
}

.entry-date {
  font-size: 12px;
  color: #a3a3a3;
}

.entry-invoice-number {
  font-size: 11px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.entry-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.entry-card:hover .entry-actions {
  opacity: 1;
}

.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn.edit {
  color: #737373;
}

.action-btn.edit:hover {
  background: #0f0f0f;
  color: #fff;
}

.action-btn.delete {
  color: #ef4444;
}

.action-btn.delete:hover {
  background: #ef4444;
  color: #fff;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.dialog-card {
  border-radius: 16px !important;
  overflow: hidden;
}

.dialog-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 17px !important;
  font-weight: 600 !important;
  padding: 24px 24px 16px !important;
  color: #0f0f0f;
}

.dialog-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-icon.invoiced {
  background: #eef2ff;
  color: #6366f1;
}

.dialog-icon.paid {
  background: #ecfdf5;
  color: #10b981;
}

.dialog-icon.delete {
  background: #fef2f2;
  color: #ef4444;
}

.dialog-content {
  padding: 8px 24px 24px !important;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.invoice-number-input {
  margin-top: 4px;
}

.delete-message {
  font-size: 14px;
  color: #525252;
  margin: 0;
  line-height: 1.6;
}

.dialog-actions {
  padding: 0 24px 24px !important;
  gap: 12px;
}

.cancel-btn {
  color: #737373 !important;
}

.save-btn {
  background: #0f0f0f !important;
  color: #fff !important;
  font-weight: 600 !important;
  padding: 0 20px !important;
}

.save-btn.invoiced {
  background: #6366f1 !important;
}

.save-btn.paid {
  background: #10b981 !important;
}

.delete-btn {
  background: #ef4444 !important;
  color: #fff !important;
  font-weight: 600 !important;
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .metrics-section {
    grid-template-columns: repeat(3, 1fr);
  }

  .collection-status-card {
    max-width: 400px;
  }
}

@media (max-width: 768px) {
  .revenue-page {
    padding: 20px 16px 40px;
  }

  .page-title {
    font-size: 26px;
  }

  .metrics-section {
    grid-template-columns: 1fr;
  }

  .entries-section {
    grid-template-columns: 1fr;
  }

  .metric-value {
    font-size: 24px;
  }

  .entry-actions {
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 22px;
  }

  .metric-card {
    padding: 16px;
  }

  .entries-column {
    padding: 16px;
  }
}

.send-dialog {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.send-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #eaeaea;
}

.send-dialog-header h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #171717;
}

.send-dialog-header .close-btn {
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

.send-dialog-header .close-btn:hover {
  background: #f5f5f5;
  color: #171717;
}

.send-dialog-body {
  padding: 24px;
}

.send-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 20px;
}

.send-form-field {
  margin-bottom: 16px;
}

.send-form-field:last-child {
  margin-bottom: 0;
}

.send-field-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #171717;
  margin-bottom: 6px;
}

.send-field-label .required {
  color: #ef4444;
}

.send-text-input {
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

.send-text-input:focus {
  outline: none;
  border-color: #171717;
  background: #fff;
}

.send-text-input.error {
  border-color: #ef4444;
}

.send-text-input::placeholder {
  color: #999;
}

.send-error-msg {
  display: block;
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}

.send-toggle-group {
  display: flex;
  gap: 8px;
}

.send-toggle-btn {
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

.send-toggle-btn:hover {
  background: #f5f5f5;
}

.send-toggle-btn.active {
  background: #171717;
  border-color: #171717;
  color: #fff;
}

.send-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background: #fafafa;
  border-top: 1px solid #eaeaea;
}

.send-btn-cancel {
  height: 40px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 500;
  color: #171717;
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.send-btn-cancel:hover {
  background: #f5f5f5;
}

.send-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background: #171717;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.send-btn-primary:hover:not(:disabled) {
  background: #000;
}

.send-btn-primary:disabled {
  background: #d4d4d4;
  cursor: not-allowed;
}

.spinner-sm-light {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
</style>
