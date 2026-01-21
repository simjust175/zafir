<template>
  <div class="entries-section">
    <div class="entries-header">
      <h3 class="entries-title">{{ title }}</h3>
      <span class="entries-count">{{ entries.length }} {{ entries.length === 1 ? 'entry' : 'entries' }}</span>
    </div>
    
    <div v-if="loading" class="entries-loading">
      <div class="spinner"></div>
      <span>Loading...</span>
    </div>
    
    <div v-else-if="entries.length === 0" class="entries-empty">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <line x1="7" y1="9" x2="17" y2="9" />
        <line x1="7" y1="13" x2="13" y2="13" />
      </svg>
      <p>No {{ type === 'invoicing' ? 'invoices' : 'payments' }} yet</p>
    </div>
    
    <div v-else class="entries-list">
      <div 
        v-for="entry in entries" 
        :key="entry.id" 
        class="entry-item"
      >
        <div class="entry-info">
          <span class="entry-amount">{{ formatCurrency(entry.amount) }}</span>
          <span class="entry-date">{{ formatDate(entry.created_on) }}</span>
        </div>
        <div class="entry-actions">
          <button 
            class="action-btn edit" 
            title="Edit"
            @click="$emit('edit', entry)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button 
            class="action-btn delete" 
            title="Delete"
            @click="confirmDelete(entry)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <v-dialog v-model="showDeleteConfirm" max-width="360" persistent>
      <div class="delete-dialog">
        <div class="delete-dialog-header">
          <h3>Delete {{ type === 'invoicing' ? 'Invoice' : 'Payment' }}</h3>
        </div>
        <div class="delete-dialog-body">
          <p>Are you sure you want to delete this {{ type === 'invoicing' ? 'invoice' : 'payment' }} of <strong>{{ formatCurrency(entryToDelete?.amount || 0) }}</strong>?</p>
          <p class="delete-warning">This action cannot be undone.</p>
        </div>
        <div class="delete-dialog-footer">
          <button class="btn-cancel" @click="showDeleteConfirm = false">Cancel</button>
          <button class="btn-delete" :disabled="deleting" @click="handleDelete">
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: { type: String, default: 'Entries' },
  type: { type: String, required: true },
  entries: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['edit', 'delete'])

const showDeleteConfirm = ref(false)
const entryToDelete = ref(null)
const deleting = ref(false)

const formatCurrency = (val) =>
  new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val || 0)

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

const confirmDelete = (entry) => {
  entryToDelete.value = entry
  showDeleteConfirm.value = true
}

const handleDelete = async () => {
  if (!entryToDelete.value) return
  deleting.value = true
  
  try {
    await emit('delete', entryToDelete.value)
    showDeleteConfirm.value = false
    entryToDelete.value = null
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.entries-section {
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  overflow: hidden;
}

.entries-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid #eaeaea;
  background: #fafafa;
}

.entries-title {
  font-size: 14px;
  font-weight: 600;
  color: #171717;
  margin: 0;
}

.entries-count {
  font-size: 12px;
  color: #666;
  background: #eaeaea;
  padding: 4px 10px;
  border-radius: 12px;
}

.entries-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px 20px;
  color: #666;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #eaeaea;
  border-top-color: #171717;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.entries-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #999;
  gap: 12px;
}

.entries-empty p {
  margin: 0;
  font-size: 13px;
}

.entries-list {
  max-height: 280px;
  overflow-y: auto;
}

.entry-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.15s ease;
}

.entry-item:last-child {
  border-bottom: none;
}

.entry-item:hover {
  background: #fafafa;
}

.entry-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.entry-amount {
  font-size: 15px;
  font-weight: 600;
  color: #171717;
}

.entry-date {
  font-size: 12px;
  color: #888;
}

.entry-actions {
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.entry-item:hover .entry-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 6px;
  cursor: pointer;
  color: #666;
  transition: all 0.15s ease;
}

.action-btn.edit:hover {
  background: #171717;
  border-color: #171717;
  color: #fff;
}

.action-btn.delete:hover {
  background: #dc2626;
  border-color: #dc2626;
  color: #fff;
}

.delete-dialog {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.delete-dialog-header {
  padding: 20px 24px;
  border-bottom: 1px solid #eaeaea;
}

.delete-dialog-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #171717;
}

.delete-dialog-body {
  padding: 24px;
}

.delete-dialog-body p {
  margin: 0 0 8px;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

.delete-warning {
  font-size: 13px !important;
  color: #dc2626 !important;
}

.delete-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background: #fafafa;
  border-top: 1px solid #eaeaea;
}

.btn-cancel,
.btn-delete {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  padding: 0 18px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
}

.btn-cancel {
  background: #fff;
  color: #171717;
  border: 1px solid #eaeaea;
}

.btn-cancel:hover {
  background: #f5f5f5;
}

.btn-delete {
  background: #dc2626;
  color: #fff;
}

.btn-delete:hover {
  background: #b91c1c;
}

.btn-delete:disabled {
  background: #f87171;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .entry-actions {
    opacity: 1;
  }
  
  .entries-header {
    padding: 12px 14px;
  }
  
  .entry-item {
    padding: 10px 14px;
  }
}
</style>
