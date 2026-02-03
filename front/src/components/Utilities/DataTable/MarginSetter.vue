<template> 
  <div class="margin-setter">
    <div class="margin-control">
      <button
        class="stepper-btn"
        @click.stop="decrementMargin"
      >
        <svg
          width="12"
          height="12"
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
        </svg>
      </button>
      <div class="margin-value">
        <input
          v-model.number="localMargin"
          type="number"
          step="1"
          class="margin-input"
          @input="onMarginChange"
          @click.stop
        >
        <span class="percent-sign">%</span>
      </div>
      <button
        class="stepper-btn"
        @click.stop="incrementMargin"
      >
        <svg
          width="12"
          height="12"
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
    
    <div
      v-if="marginChangedMap[item.issuer]"
      class="action-buttons"
    >
      <button
        class="action-btn save"
        :disabled="loading"
        @click.stop="saveMargin(item)"
      >
        <svg
          v-if="!loading"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <v-progress-circular
          v-else
          indeterminate
          size="12"
          width="2"
          color="white"
        />
      </button>
      <button
        class="action-btn cancel"
        :disabled="loading"
        @click.stop="cancelMargin(item)"
      >
        <svg
          width="12"
          height="12"
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
  </div>
</template>
  
<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['marginUpdate']);

// Use Math.round to ensure the initial value is an integer
const localMargin = ref(Math.round(props.item?.weightedMargin || 0));
const marginChangedMap = ref({});
const loading = ref(false);

const onMarginChange = () => {
  // Ensure we compare integers by rounding the prop value during comparison
  marginChangedMap.value[props.item.issuer] = localMargin.value !== Math.round(props.item.weightedMargin);
};

watch(() => localMargin.value, () => onMarginChange());

watch(() => props.item?.weightedMargin, (newVal) => {
  // Round the incoming prop value to remove decimals
  localMargin.value = Math.round(newVal || 0);
});

const incrementMargin = () => {
  localMargin.value = (localMargin.value || 0) + 1;
};

const decrementMargin = () => {
  localMargin.value = Math.max(0, (localMargin.value || 0) - 1);
};

const saveMargin = async (item) => {
  const query = [{ project: props.item.invoices?.[0]?.project }, { issuer: item.issuer }];
  if (localMargin.value === null) return null;
  
  loading.value = true;
  
  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/patch/invoices?margin=${JSON.stringify(query)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        margin: localMargin.value,
        margin_override: 1
      })
    });
    
    if (!res.ok) {
      throw new Error('Failed to change margin');
    }
    
    await res.json();
    marginChangedMap.value[item.issuer] = false;
    emit('marginUpdate', localMargin.value);
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const cancelMargin = (item) => {
  // Round the value when resetting/canceling
  localMargin.value = Math.round(item.weightedMargin || 0);
  marginChangedMap.value[item.issuer] = false;
};
</script>

<style scoped>
.margin-setter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.margin-control {
  display: inline-flex;
  align-items: center;
  background: #fafafa;
  border: 1px solid #eaeaea;
  border-radius: 6px;
  overflow: hidden;
}

.stepper-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
  transition: all 0.15s ease;
}

.stepper-btn:hover {
  background: #f0f0f0;
  color: #171717;
}

.margin-value {
  display: flex;
  align-items: center;
  padding: 0 2px;
}

.margin-input {
  width: 32px;
  height: 28px;
  padding: 0;
  font-size: 13px;
  font-weight: 500;
  color: #171717;
  text-align: center;
  background: transparent;
  border: none;
  outline: none;
}

.margin-input::-webkit-outer-spin-button,
.margin-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.percent-sign {
  font-size: 12px;
  color: #999;
  margin-right: 4px;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn.save {
  background: #10b981;
  color: #fff;
}

.action-btn.save:hover {
  background: #059669;
}

.action-btn.cancel {
  background: #f5f5f5;
  color: #999;
}

.action-btn.cancel:hover {
  background: #eaeaea;
  color: #171717;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
