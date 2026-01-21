<template>
  <div class="metrics-bar">
    <div class="metric-item">
      <div class="metric-content">
        <span class="metric-label">Total Invoiced</span>
        <span class="metric-value">{{ formatCurrency(totalInvoiced || 0) }}</span>
      </div>
      <button
        class="metric-action"
        title="Add Invoice"
        @click="$emit('open-dialog', 'invoiced', false)"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
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

    <div class="metric-divider" />

    <div class="metric-item paid">
      <div class="metric-content">
        <span class="metric-label">Total Paid</span>
        <span class="metric-value success">{{ formatCurrency(totalPaid || 0) }}</span>
      </div>
      <div class="progress-indicator">
        <div class="progress-ring">
          <svg viewBox="0 0 36 36">
            <path
              class="progress-bg"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              class="progress-fill"
              :stroke-dasharray="`${percentPaid}, 100`"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span class="progress-text">{{ percentPaid }}%</span>
        </div>
      </div>
      <button
        class="metric-action"
        title="Record Payment"
        @click="$emit('open-dialog', 'paid', false)"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
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

    <div class="metric-divider" />

    <div class="metric-item">
      <div class="metric-content">
        <span class="metric-label">Outstanding</span>
        <span
          class="metric-value"
          :class="{ warning: outstanding > 0 }"
        >{{ formatCurrency(outstanding) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  totalInvoiced: { type: Number, default: 0 },
  totalPaid: { type: Number, default: 0 },
  percentPaid: { type: Number, default: 0 },
  loadingInvoiced: Boolean,
  loadingPaid: Boolean
})

defineEmits(['open-dialog'])

const outstanding = computed(() => {
  return Math.max(0, (props.totalInvoiced || 0) - (props.totalPaid || 0))
})

const formatCurrency = (val) =>
  new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val);
</script>

<style scoped>
.metrics-bar {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 16px 24px;
  background: #fafafa;
  border-bottom: 1px solid #eaeaea;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
}

.metric-item:first-child {
  padding-left: 0;
}

.metric-item:last-child {
  padding-right: 0;
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.metric-label {
  font-size: 12px;
  font-weight: 500;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.metric-value {
  font-size: 24px;
  font-weight: 600;
  color: #171717;
  letter-spacing: -0.02em;
}

.metric-value.success {
  color: #10b981;
}

.metric-value.warning {
  color: #f59e0b;
}

.metric-divider {
  width: 1px;
  height: 40px;
  background: #eaeaea;
}

.metric-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #fff;
  border: 1px solid #eaeaea;
  border-radius: 6px;
  color: #666;
  cursor: pointer;
  transition: all 0.15s ease;
}

.metric-action:hover {
  background: #171717;
  border-color: #171717;
  color: #fff;
}

.progress-indicator {
  display: flex;
  align-items: center;
}

.progress-ring {
  position: relative;
  width: 44px;
  height: 44px;
}

.progress-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-bg {
  fill: none;
  stroke: #eaeaea;
  stroke-width: 3;
}

.progress-fill {
  fill: none;
  stroke: #10b981;
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 10px;
  font-weight: 600;
  color: #171717;
}

/* Tablet Layout (768px - 1024px) */
@media (max-width: 1024px) and (min-width: 769px) {
  .metrics-bar {
    padding: 14px 16px;
    gap: 0;
  }
  
  .metric-item {
    padding: 0 16px;
    gap: 12px;
  }
  
  .metric-value {
    font-size: 20px;
  }
  
  .metric-label {
    font-size: 11px;
  }
  
  .progress-ring {
    width: 38px;
    height: 38px;
  }
  
  .progress-text {
    font-size: 9px;
  }
  
  .metric-action {
    width: 28px;
    height: 28px;
  }
  
  .metric-action svg {
    width: 12px;
    height: 12px;
  }
}

/* Small Tablet Layout (601px - 768px) */
@media (max-width: 768px) and (min-width: 601px) {
  .metrics-bar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 12px;
    background: #f5f5f5;
  }
  
  .metric-divider {
    display: none;
  }
  
  .metric-item {
    padding: 14px;
    background: #fff;
    border: 1px solid #eaeaea;
    border-radius: 10px;
    gap: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }
  
  .metric-item:first-child {
    padding-left: 14px;
  }
  
  .metric-item:last-child {
    padding-right: 14px;
    grid-column: span 2;
    justify-content: center;
  }
  
  .metric-item.paid {
    flex-wrap: wrap;
    justify-content: space-between;
  }
  
  .metric-content {
    flex: 1;
    min-width: 100px;
  }
  
  .metric-value {
    font-size: 22px;
  }
  
  .metric-label {
    font-size: 11px;
  }
  
  .progress-ring {
    width: 40px;
    height: 40px;
  }
  
  .progress-text {
    font-size: 9px;
  }
  
  .metric-action {
    width: 30px;
    height: 30px;
  }
}

/* Mobile Layout (600px and below) */
@media (max-width: 600px) {
  .metrics-bar {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    background: #f5f5f5;
  }
  
  .metric-divider {
    display: none;
  }
  
  .metric-item {
    width: 100%;
    padding: 14px 16px;
    background: #fff;
    border: 1px solid #eaeaea;
    border-radius: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }
  
  .metric-item:first-child,
  .metric-item:last-child {
    padding: 14px 16px;
  }
  
  .metric-item.paid {
    flex-wrap: wrap;
  }
  
  .metric-item.paid .metric-content {
    order: 1;
    flex: 1;
    min-width: 120px;
  }
  
  .metric-item.paid .progress-indicator {
    order: 2;
  }
  
  .metric-item.paid .metric-action {
    order: 3;
  }
  
  .metric-content {
    gap: 4px;
  }
  
  .metric-value {
    font-size: 20px;
  }
  
  .metric-label {
    font-size: 11px;
  }
  
  .progress-ring {
    width: 36px;
    height: 36px;
  }
  
  .progress-text {
    font-size: 8px;
  }
  
  .metric-action {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }
}

/* Extra Small Mobile (480px and below) */
@media (max-width: 480px) {
  .metrics-bar {
    padding: 10px;
    gap: 8px;
  }
  
  .metric-item {
    padding: 12px 14px;
  }
  
  .metric-value {
    font-size: 18px;
  }
  
  .metric-label {
    font-size: 10px;
  }
  
  .progress-ring {
    width: 32px;
    height: 32px;
  }
  
  .progress-text {
    font-size: 7px;
  }
  
  .metric-action {
    width: 28px;
    height: 28px;
  }
  
  .metric-action svg {
    width: 12px;
    height: 12px;
  }
}
</style>
