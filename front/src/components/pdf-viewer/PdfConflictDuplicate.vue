<template>
  <div class="duplicate-actions">
    <button class="action-btn success" @click="handleKeepBoth">
      <v-icon size="16">mdi-content-duplicate</v-icon>
      Keep Both
    </button>
    <button class="action-btn primary" @click="handleKeepThis">
      <v-icon size="16">mdi-file-check</v-icon>
      Keep Current
    </button>
    <button class="action-btn danger" @click="handleKeepNone">
      <v-icon size="16">mdi-delete</v-icon>
      Delete Both
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
  gap: 8px;
  padding: 12px 16px;
  background: #fafbfc;
  border-bottom: 1px solid #e3e8ee;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn.success {
  background: #dcfce7;
  color: #166534;
}

.action-btn.success:hover {
  background: #bbf7d0;
}

.action-btn.primary {
  background: #635bff;
  color: #fff;
}

.action-btn.primary:hover {
  background: #5851ea;
}

.action-btn.danger {
  background: #fef2f2;
  color: #b91c1c;
}

.action-btn.danger:hover {
  background: #fecaca;
}
</style>
