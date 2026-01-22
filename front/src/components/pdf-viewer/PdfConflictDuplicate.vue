<template>
  <div class="duplicate-actions">
    <button class="action-btn success" @click="handleKeepBoth">
      <span class="btn-icon">
        <v-icon size="18">mdi-content-duplicate</v-icon>
      </span>
      <span class="btn-content">
        <span class="btn-label">Keep Both</span>
        <span class="btn-hint">Save both documents</span>
      </span>
    </button>
    
    <button class="action-btn primary" @click="handleKeepThis">
      <span class="btn-icon">
        <v-icon size="18">mdi-file-check-outline</v-icon>
      </span>
      <span class="btn-content">
        <span class="btn-label">Keep Current</span>
        <span class="btn-hint">Delete the duplicate</span>
      </span>
    </button>
    
    <button class="action-btn danger" @click="handleKeepNone">
      <span class="btn-icon">
        <v-icon size="18">mdi-trash-can-outline</v-icon>
      </span>
      <span class="btn-content">
        <span class="btn-label">Delete Both</span>
        <span class="btn-hint">Remove all copies</span>
      </span>
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  fileA: String,
  fileB: String,
  pdfUrl: String,
  duplicatePdfUrl: String
});

const emit = defineEmits(["keep-both", "keep-this", "keep-duplicate", "keep-none"]);

const selection = ref(null);

const handleKeepBoth = () => {
  selection.value = 'both';
  emit('keep-both');
};

const handleKeepThis = () => {
  selection.value = 'this';
  emit('keep-this');
};

const handleKeepNone = () => {
  selection.value = 'none';
  emit('keep-none');
};
</script>

<style scoped>
.duplicate-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 20px 24px;
  background: linear-gradient(180deg, 
    rgba(var(--v-theme-on-surface), 0.02) 0%, 
    rgba(var(--v-theme-on-surface), 0.04) 100%
  );
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  flex-shrink: 0;
}

.btn-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.btn-label {
  font-weight: 600;
  line-height: 1.2;
}

.btn-hint {
  font-size: 11px;
  font-weight: 400;
  opacity: 0.7;
}

.action-btn.success {
  background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
  color: #166534;
  border-color: rgba(22, 101, 52, 0.15);
}

.action-btn.success .btn-icon {
  background: rgba(22, 163, 74, 0.15);
}

.action-btn.success:hover {
  background: linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%);
  border-color: rgba(22, 101, 52, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2);
}

.action-btn.primary {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, #5851EA 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3);
}

.action-btn.primary .btn-icon {
  background: rgba(255, 255, 255, 0.2);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(var(--v-theme-primary), 0.4);
}

.action-btn.danger {
  background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
  color: #B91C1C;
  border-color: rgba(185, 28, 28, 0.15);
}

.action-btn.danger .btn-icon {
  background: rgba(220, 38, 38, 0.12);
}

.action-btn.danger:hover {
  background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
  border-color: rgba(185, 28, 28, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
}

.action-btn:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .duplicate-actions {
    flex-direction: column;
    gap: 10px;
    padding: 16px;
  }

  .action-btn {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
