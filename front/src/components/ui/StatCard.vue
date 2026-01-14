<template>
  <v-card class="stat-card" :class="cardClass">
    <div class="stat-card-content">
      <div class="stat-info">
        <span class="stat-label">{{ label }}</span>
        <div class="stat-value-row">
          <span class="stat-value">{{ formattedValue }}</span>
          <span v-if="trend" class="stat-trend" :class="trendClass">
            <v-icon :icon="trendIcon" size="14" />
            {{ trend }}%
          </span>
        </div>
        <span v-if="subtitle" class="stat-subtitle">{{ subtitle }}</span>
      </div>
      <div class="stat-icon-wrapper" :class="iconColorClass">
        <v-icon :icon="icon" size="24" />
      </div>
    </div>
    <div v-if="showProgress" class="stat-progress">
      <v-progress-linear
        :model-value="progress"
        :color="progressColor"
        height="4"
        rounded
      />
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  icon: {
    type: String,
    default: 'mdi-chart-line'
  },
  color: {
    type: String,
    default: 'primary'
  },
  trend: {
    type: [Number, String],
    default: null
  },
  trendDirection: {
    type: String,
    default: 'up'
  },
  subtitle: {
    type: String,
    default: ''
  },
  prefix: {
    type: String,
    default: ''
  },
  suffix: {
    type: String,
    default: ''
  },
  format: {
    type: String,
    default: 'number'
  },
  showProgress: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0
  },
  progressColor: {
    type: String,
    default: 'primary'
  },
  elevated: {
    type: Boolean,
    default: false
  }
})

const cardClass = computed(() => ({
  'stat-card--elevated': props.elevated
}))

const iconColorClass = computed(() => `bg-${props.color}`)

const trendClass = computed(() => ({
  'trend-up': props.trendDirection === 'up',
  'trend-down': props.trendDirection === 'down'
}))

const trendIcon = computed(() => 
  props.trendDirection === 'up' ? 'mdi-trending-up' : 'mdi-trending-down'
)

const formattedValue = computed(() => {
  let val = props.value
  
  if (props.format === 'currency') {
    val = new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val)
  } else if (props.format === 'number') {
    val = new Intl.NumberFormat().format(val)
  }
  
  return `${props.prefix}${val}${props.suffix}`
})
</script>

<style scoped>
.stat-card {
  padding: 20px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-grey-200));
  transition: all var(--billio-transition-normal);
}

.stat-card:hover {
  border-color: rgb(var(--v-theme-grey-300));
}

.stat-card--elevated {
  border: none;
  box-shadow: var(--billio-shadow-md);
}

.stat-card--elevated:hover {
  box-shadow: var(--billio-shadow-lg);
  transform: translateY(-2px);
}

.stat-card-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-600));
  margin-bottom: 8px;
}

.stat-value-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.2;
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.trend-up {
  background: rgba(var(--v-theme-success), 0.1);
  color: rgb(var(--v-theme-success));
}

.trend-down {
  background: rgba(var(--v-theme-error), 0.1);
  color: rgb(var(--v-theme-error));
}

.stat-subtitle {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-grey-500));
  margin-top: 4px;
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-progress {
  margin-top: 16px;
}
</style>
