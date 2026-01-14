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

@media (max-width: 900px) {
  .metrics-bar {
    flex-wrap: wrap;
    gap: 16px;
    padding: 16px;
  }
  
  .metric-divider {
    display: none;
  }
  
  .metric-item {
    padding: 0;
    flex: 1 1 auto;
    min-width: 140px;
  }
  
  .metric-value {
    font-size: 20px;
  }
}

@media (max-width: 600px) {
  .metrics-bar {
    flex-direction: column;
    gap: 12px;
  }
  
  .metric-item {
    width: 100%;
    padding: 12px;
    background: #fff;
    border: 1px solid #eaeaea;
    border-radius: 8px;
  }
  
  .metric-item.paid {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .progress-indicator {
    margin-top: 12px;
  }
}
</style>
