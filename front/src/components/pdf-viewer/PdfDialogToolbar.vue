<template>
  <div class="pdf-toolbar">
    <div class="toolbar-left">
      <button
        class="close-btn"
        :disabled="disableClose"
        @click="$emit('close')"
      >
        <v-icon size="20">mdi-close</v-icon>
      </button>
      <span class="toolbar-title">Document Preview</span>
    </div>
    
    <div class="toolbar-right">
      <span class="supplier-badge">
        <v-icon size="16">mdi-file-pdf-box</v-icon>
        {{ issuer || 'Unknown Supplier' }}
      </span>
      <div class="toolbar-actions">
        <a :href="pdfUrl" target="_blank" rel="noopener" class="icon-btn" title="Open in New Tab">
          <v-icon size="18">mdi-open-in-new</v-icon>
        </a>
        <a :href="pdfUrl" download class="icon-btn" title="Download PDF">
          <v-icon size="18">mdi-download</v-icon>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  issuer: String,
  pdfUrl: String,
  iconColor: String,
  toolbarBackground: String,
  disableClose: Boolean
})
defineEmits(['close'])
</script>

<style scoped>
.pdf-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fafbfc;
  border-bottom: 1px solid #e3e8ee;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  color: #697386;
  transition: all 0.15s ease;
}

.close-btn:hover:not(:disabled) {
  background: #e3e8ee;
  color: #1a1f36;
}

.close-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1f36;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.supplier-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #697386;
}

.toolbar-actions {
  display: flex;
  gap: 4px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #697386;
  text-decoration: none;
  transition: all 0.15s ease;
}

.icon-btn:hover {
  background: #e3e8ee;
  color: #1a1f36;
}
</style>
