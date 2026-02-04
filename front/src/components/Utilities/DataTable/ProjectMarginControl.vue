<template>
  <div class="project-margin-control">
    <button 
      class="margin-trigger"
      :class="{ 'has-margin': marginValue > 0 }"
      @click="openEditor"
    >
      <div class="trigger-icon">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line
            x1="19"
            y1="5"
            x2="5"
            y2="19"
          />
          <circle
            cx="6.5"
            cy="6.5"
            r="2.5"
          />
          <circle
            cx="17.5"
            cy="17.5"
            r="2.5"
          />
        </svg>
      </div>
      <span class="trigger-label">Project Margin</span>
      <span class="trigger-value">{{ marginValue > 0 ? `${marginValue}%` : 'Not set' }}</span>
      <svg
        class="trigger-chevron"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

    <v-dialog
      v-model="isOpen"
      max-width="480"
    >
      <div class="margin-editor">
        <div class="editor-header">
          <div class="header-visual">
            <div class="visual-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line
                  x1="19"
                  y1="5"
                  x2="5"
                  y2="19"
                />
                <circle
                  cx="6.5"
                  cy="6.5"
                  r="2.5"
                />
                <circle
                  cx="17.5"
                  cy="17.5"
                  r="2.5"
                />
              </svg>
            </div>
          </div>
          <div class="header-content">
            <h2>Project Margin</h2>
            <p>{{ projectName }}</p>
          </div>
          <button
            class="close-btn"
            @click="isOpen = false"
          >
            <svg
              width="20"
              height="20"
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

        <div class="editor-body">
          <div class="margin-comparison">
            <div class="comparison-item current">
              <span class="comparison-label">Current</span>
              <span class="comparison-value">{{ marginValue }}%</span>
            </div>
            <div class="comparison-arrow">
              <svg
                width="20"
                height="20"
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
            </div>
            <div
              class="comparison-item new"
              :class="{ changed: editValue !== marginValue }"
            >
              <span class="comparison-label">New</span>
              <span class="comparison-value">{{ editValue }}%</span>
            </div>
          </div>

          <div class="input-section">
            <label class="section-label">Set margin percentage</label>
            <div class="slider-row">
              <input
                v-model.number="editValue"
                type="range"
                min="0"
                max="50"
                step="1"
                class="margin-range"
              >
              <div class="value-input-wrap">
                <input
                  v-model.number="editValue"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  class="value-input"
                  @click.stop
                >
                <span class="value-suffix">%</span>
              </div>
            </div>
            
            <div class="preset-row">
              <button 
                v-for="p in [0, 5, 10, 15, 20, 25, 50]" 
                :key="p"
                class="preset-chip"
                :class="{ active: editValue === p }"
                @click="editValue = p"
              >
                {{ p }}%
              </button>
            </div>
          </div>

          <div class="info-banner">
            <svg
              width="16"
              height="16"
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
              <line
                x1="12"
                y1="16"
                x2="12"
                y2="12"
              />
              <line
                x1="12"
                y1="8"
                x2="12.01"
                y2="8"
              />
            </svg>
            <div class="info-text">
              <strong>This will apply to:</strong>
              <ul>
                <li>All existing invoices without manual overrides</li>
                <li>All future invoices added to this project</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="editor-footer">
          <button
            class="btn-secondary"
            @click="isOpen = false"
          >
            Cancel
          </button>
          <button 
            class="btn-primary" 
            :disabled="saving || editValue === marginValue"
            @click="saveMargin"
          >
            <span
              v-if="saving"
              class="btn-spinner"
            />
            <svg
              v-else
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {{ saving ? 'Applying...' : 'Apply to Project' }}
          </button>
        </div>
      </div>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  projectId: { type: Number, required: true },
  projectName: { type: String, default: '' },
  marginValue: { type: Number, default: 0 },
  invoiceCount: { type: Number, default: 0 }
});

const emit = defineEmits(['update:marginValue', 'saved']);

const isOpen = ref(false);
const editValue = ref(props.marginValue);
const saving = ref(false);

watch(() => props.marginValue, (val) => {
  editValue.value = val;
});

const openEditor = () => {
  editValue.value = props.marginValue;
  isOpen.value = true;
};

const saveMargin = async () => {
  saving.value = true;
  try {
    const margin = Math.max(0, Math.min(100, Number(editValue.value) || 0));
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/patch/invoices?marginPerProject=${props.projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ margin })
    });
    
    if (!res.ok) throw new Error('Failed to update margin');
    
    emit('update:marginValue', margin);
    emit('saved', { margin, projectId: props.projectId });
    isOpen.value = false;
  } catch (err) {
    console.error('Error saving margin:', err);
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.project-margin-control {
  display: inline-flex;
}

.margin-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 14px 0 10px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}

.margin-trigger:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.margin-trigger.has-margin {
  background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
  border-color: #c4b5fd;
}

.margin-trigger.has-margin:hover {
  border-color: #a78bfa;
}

.trigger-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 6px;
  color: #fff;
}

.trigger-label {
  color: #6b7280;
}

.trigger-value {
  font-weight: 600;
  color: #111827;
  font-variant-numeric: tabular-nums;
}

.has-margin .trigger-value {
  color: #7c3aed;
}

.trigger-chevron {
  color: #9ca3af;
  transition: transform 0.2s ease;
}

.margin-trigger:hover .trigger-chevron {
  transform: translateY(2px);
}

.margin-editor {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.editor-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.header-visual {
  flex-shrink: 0;
}

.visual-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: #fff;
}

.header-content {
  flex: 1;
  min-width: 0;
}

.header-content h2 {
  margin: 0 0 4px;
  font-size: 1.375rem;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.02em;
}

.header-content p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.editor-body {
  padding: 24px;
}

.margin-comparison {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  margin-bottom: 28px;
}

.comparison-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.comparison-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.comparison-value {
  font-size: 1.75rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #d1d5db;
  transition: all 0.2s ease;
}

.comparison-item.new .comparison-value {
  color: #111827;
}

.comparison-item.new.changed .comparison-value {
  color: #7c3aed;
}

.comparison-arrow {
  color: #d1d5db;
}

.input-section {
  margin-bottom: 24px;
}

.section-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 14px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.margin-range {
  flex: 1;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(90deg, #e5e7eb 0%, #e5e7eb 100%);
  border-radius: 4px;
  outline: none;
}

.margin-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.4);
  transition: transform 0.15s ease;
}

.margin-range::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.margin-range::-moz-range-thumb {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.4);
}

.value-input-wrap {
  display: flex;
  align-items: center;
  background: #fff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
  width: 90px;
  flex-shrink: 0;
}

.value-input-wrap:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}

.value-input {
  width: 50px;
  height: 44px;
  padding: 0 8px 0 14px;
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  background: transparent;
  border: none;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.value-input:focus {
  outline: none;
}

.value-input::-webkit-outer-spin-button,
.value-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.value-suffix {
  padding: 0 12px 0 4px;
  font-size: 1rem;
  font-weight: 600;
  color: #9ca3af;
}

.preset-row {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap; /* FORCED SINGLE ROW */
  overflow-x: auto;  /* Allows scrolling on tiny screens without breaking layout */
  scrollbar-width: none;
}

.preset-chip {
  flex: 1;
  white-space: nowrap;
  padding: 10px 0;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
  transition: all 0.2s;
}

.preset-chip:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.preset-chip.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.35);
}

.info-banner {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 12px;
}

.info-banner svg {
  flex-shrink: 0;
  color: #d97706;
  margin-top: 2px;
}

.info-text {
  font-size: 0.8125rem;
  color: #92400e;
  line-height: 1.5;
}

.info-text strong {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
}

.info-text ul {
  margin: 0;
  padding-left: 18px;
}

.info-text li {
  margin-bottom: 2px;
}

.editor-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
}

.btn-secondary {
  height: 44px;
  padding: 0 24px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 24px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(102, 126, 234, 0.35);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.45);
}

.btn-primary:disabled {
  background: #d1d5db;
  box-shadow: none;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
