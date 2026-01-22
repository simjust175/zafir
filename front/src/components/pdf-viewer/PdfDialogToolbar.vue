<template>
  <div class="pdf-toolbar">
    <div class="toolbar-left">
      <button
        class="close-btn"
        :disabled="disableClose"
        @click="$emit('close')"
        title="Close preview"
      >
        <v-icon size="20">mdi-close</v-icon>
      </button>
      <div class="toolbar-title-group">
        <span class="toolbar-title">Document Preview</span>
        <span class="toolbar-subtitle">Invoice document</span>
      </div>
    </div>
    
    <div class="toolbar-right">
      <div class="supplier-badge">
        <span class="supplier-icon">
          <v-icon size="16" color="primary">mdi-file-pdf-box</v-icon>
        </span>
        <span class="supplier-name">{{ issuer || 'Unknown Supplier' }}</span>
      </div>
      
      <div class="toolbar-divider" />
      
      <div class="toolbar-actions">
        <a 
          :href="pdfUrl" 
          target="_blank" 
          rel="noopener" 
          class="icon-btn" 
          title="Open in New Tab"
        >
          <v-icon size="18">mdi-open-in-new</v-icon>
        </a>
        <a 
          :href="pdfUrl" 
          download 
          class="icon-btn download" 
          title="Download PDF"
        >
          <v-icon size="18">mdi-download-outline</v-icon>
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
  padding: 16px 20px;
  background: linear-gradient(180deg, 
    rgb(var(--v-theme-surface)) 0%, 
    rgba(var(--v-theme-on-surface), 0.02) 100%
  );
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  background: rgb(var(--v-theme-surface));
  border-radius: 10px;
  cursor: pointer;
  color: rgb(var(--v-theme-grey-600));
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.close-btn:hover:not(:disabled) {
  background: rgba(var(--v-theme-on-surface), 0.06);
  border-color: rgba(var(--v-theme-on-surface), 0.15);
  color: rgb(var(--v-theme-on-surface));
  transform: scale(1.02);
}

.close-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.close-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toolbar-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toolbar-title {
  font-size: 15px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  letter-spacing: -0.01em;
}

.toolbar-subtitle {
  font-size: 12px;
  color: rgb(var(--v-theme-grey-500));
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.supplier-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px 8px 10px;
  background: rgba(var(--v-theme-primary), 0.08);
  border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-primary), 0.12);
}

.supplier-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(var(--v-theme-primary), 0.12);
  border-radius: 7px;
}

.supplier-name {
  font-size: 13px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toolbar-divider {
  width: 1px;
  height: 28px;
  background: rgba(var(--v-theme-on-surface), 0.1);
}

.toolbar-actions {
  display: flex;
  gap: 6px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  background: rgb(var(--v-theme-surface));
  border-radius: 10px;
  cursor: pointer;
  color: rgb(var(--v-theme-grey-600));
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-btn:hover {
  background: rgba(var(--v-theme-on-surface), 0.06);
  border-color: rgba(var(--v-theme-on-surface), 0.15);
  color: rgb(var(--v-theme-on-surface));
  transform: translateY(-1px);
}

.icon-btn.download:hover {
  background: rgba(var(--v-theme-primary), 0.1);
  border-color: rgba(var(--v-theme-primary), 0.2);
  color: rgb(var(--v-theme-primary));
}

.icon-btn:active {
  transform: translateY(0);
}

@media (max-width: 600px) {
  .pdf-toolbar {
    flex-wrap: wrap;
    gap: 12px;
    padding: 14px 16px;
  }

  .toolbar-right {
    width: 100%;
    justify-content: space-between;
  }

  .supplier-badge {
    flex: 1;
    min-width: 0;
  }

  .supplier-name {
    max-width: 120px;
  }

  .toolbar-divider {
    display: none;
  }
}
</style>
