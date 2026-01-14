<template>
  <div class="right-panel-content">
    <div class="panel-header">
      <h3 class="panel-title">Widgets</h3>
      <v-btn
        icon
        variant="text"
        size="small"
        @click="$emit('close')"
      >
        <v-icon size="20">mdi-close</v-icon>
      </v-btn>
    </div>

    <div class="panel-body">
      <div class="widget-card mb-4">
        <div class="widget-header">
          <v-icon icon="mdi-bullhorn-outline" size="20" class="mr-2" color="primary" />
          <span class="widget-title">Announcements</span>
        </div>
        <div class="widget-content">
          <div class="announcement-item">
            <div class="announcement-badge">New</div>
            <div class="announcement-text">
              <strong>Version 2.0 Released</strong>
              <p>Enhanced invoice processing with AI-powered data extraction.</p>
            </div>
          </div>
          <div class="announcement-item">
            <div class="announcement-text">
              <strong>System Maintenance</strong>
              <p>Scheduled maintenance on Sunday, 2 AM - 4 AM UTC.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="widget-card mb-4">
        <div class="widget-header">
          <v-icon icon="mdi-chart-box-outline" size="20" class="mr-2" color="secondary" />
          <span class="widget-title">Quick Stats</span>
        </div>
        <div class="widget-content">
          <div class="stat-row">
            <span class="stat-label">Invoices This Month</span>
            <span class="stat-value">{{ monthlyInvoices }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Pending Review</span>
            <span class="stat-value text-warning">{{ pendingReview }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Total Processed</span>
            <span class="stat-value text-success">{{ totalProcessed }}</span>
          </div>
        </div>
      </div>

      <div class="widget-card mb-4">
        <div class="widget-header">
          <v-icon icon="mdi-lightbulb-outline" size="20" class="mr-2" color="warning" />
          <span class="widget-title">Tips & Tricks</span>
        </div>
        <div class="widget-content">
          <div class="tip-item">
            <v-icon icon="mdi-keyboard" size="16" class="mr-2 text-grey-500" />
            <span class="tip-text">Press <kbd>Ctrl</kbd> + <kbd>U</kbd> to quick upload</span>
          </div>
          <div class="tip-item">
            <v-icon icon="mdi-drag" size="16" class="mr-2 text-grey-500" />
            <span class="tip-text">Drag & drop files directly to upload</span>
          </div>
          <div class="tip-item">
            <v-icon icon="mdi-filter" size="16" class="mr-2 text-grey-500" />
            <span class="tip-text">Use filters to find invoices faster</span>
          </div>
        </div>
      </div>

      <div class="widget-card promo-card">
        <div class="promo-content">
          <div class="promo-icon">
            <v-icon icon="mdi-rocket-launch" size="32" color="primary" />
          </div>
          <h4 class="promo-title">Upgrade to Pro</h4>
          <p class="promo-text">Unlock advanced features, unlimited storage, and priority support.</p>
          <v-btn color="primary" variant="flat" block class="mt-3">
            Learn More
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { invoices } from '@/stores/invoiceState.js'

defineEmits(['close'])

const invoiceStore = invoices()

const monthlyInvoices = computed(() => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  return invoiceStore.dbResponse?.filter(inv => {
    const date = new Date(inv.created_on || inv.created_at)
    return date >= startOfMonth
  }).length || 0
})

const pendingReview = computed(() => invoiceStore.warnings?.length || 0)
const totalProcessed = computed(() => invoiceStore.dbResponse?.length || 0)
</script>

<style scoped>
.right-panel-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgb(var(--v-theme-grey-200));
}

.panel-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
}

.panel-body {
  padding: 16px;
  overflow-y: auto;
  flex: 1;
}

.widget-card {
  background: rgb(var(--v-theme-surface-variant));
  border-radius: 12px;
  overflow: hidden;
}

.widget-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgb(var(--v-theme-grey-200));
}

.widget-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.widget-content {
  padding: 12px 16px;
}

.announcement-item {
  padding: 8px 0;
  border-bottom: 1px solid rgb(var(--v-theme-grey-200));
}

.announcement-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.announcement-badge {
  display: inline-block;
  padding: 2px 8px;
  background: rgb(var(--v-theme-primary));
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 4px;
  margin-bottom: 6px;
}

.announcement-text strong {
  display: block;
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface));
  margin-bottom: 2px;
}

.announcement-text p {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-grey-600));
  margin: 0;
  line-height: 1.4;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgb(var(--v-theme-grey-200));
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-grey-600));
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.tip-item {
  display: flex;
  align-items: center;
  padding: 6px 0;
}

.tip-text {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-grey-700));
}

.tip-text kbd {
  display: inline-block;
  padding: 2px 6px;
  background: rgb(var(--v-theme-grey-200));
  border-radius: 4px;
  font-size: 0.625rem;
  font-family: var(--billio-font-mono);
}

.promo-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.1) 0%, rgba(var(--v-theme-accent), 0.1) 100%);
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
}

.promo-content {
  padding: 20px;
  text-align: center;
}

.promo-icon {
  width: 56px;
  height: 56px;
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

.promo-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 8px;
}

.promo-text {
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-grey-600));
  margin: 0;
  line-height: 1.5;
}
</style>
