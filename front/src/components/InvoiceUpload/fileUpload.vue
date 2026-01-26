<template>
  <div class="file-upload-wrapper">
    <div 
      class="upload-area"
      :class="{ 
        'is-dragging': isDragging, 
        'has-file': file 
      }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerInput"
    >
      <input
        ref="inputRef"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        hidden
        @change="handleSelect"
      />

      <template v-if="!file">
        <div class="upload-icon">
          <v-icon size="32" color="primary">mdi-cloud-upload-outline</v-icon>
        </div>
        <p class="upload-label">Drop file or click to browse</p>
        <p class="upload-hint">PDF, JPG, PNG up to 10MB</p>
      </template>

      <template v-else>
        <div class="file-row">
          <div class="file-icon-wrapper">
            <v-icon :icon="fileIcon" size="24" color="primary" />
          </div>
          <div class="file-details">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ fileSize }}</span>
          </div>
          <v-btn
            icon
            variant="text"
            size="x-small"
            @click.stop="removeFile"
          >
            <v-icon size="18" color="grey-600">mdi-close</v-icon>
          </v-btn>
        </div>
      </template>
    </div>

    <div v-if="error" class="error-text">
      <v-icon size="14" color="error">mdi-alert-circle</v-icon>
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['file-selected', 'file-removed', 'close'])

const file = ref(null)
const inputRef = ref(null)
const isDragging = ref(false)
const error = ref('')

const fileIcon = computed(() => {
  if (!file.value) return 'mdi-file-document'
  if (file.value.type === 'application/pdf') return 'mdi-file-pdf-box'
  if (file.value.type?.startsWith('image/')) return 'mdi-file-image'
  return 'mdi-file-document'
})

const fileSize = computed(() => {
  if (!file.value?.size) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(file.value.size) / Math.log(k))
  return parseFloat((file.value.size / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
})

const triggerInput = () => {
  inputRef.value?.click()
}

const handleSelect = (e) => {
  const selected = e.target.files?.[0]
  if (selected) validateAndSet(selected)
}

const handleDrop = (e) => {
  isDragging.value = false
  const dropped = e.dataTransfer?.files?.[0]
  if (dropped) validateAndSet(dropped)
}

const validateAndSet = (f) => {
  error.value = ''
  
  const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
  if (!validTypes.includes(f.type)) {
    error.value = 'Invalid file type'
    return
  }
  
  if (f.size > 10 * 1024 * 1024) {
    error.value = 'File too large (max 10MB)'
    return
  }
  
  file.value = f
  emit('file-selected', f)
}

const removeFile = () => {
  file.value = null
  error.value = ''
  if (inputRef.value) inputRef.value.value = ''
  emit('file-removed')
}
</script>

<style scoped>
.file-upload-wrapper {
  width: 100%;
}

.upload-area {
  border: 2px dashed rgb(var(--v-theme-grey-300));
  border-radius: 12px;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgb(var(--v-theme-grey-50));
}

.upload-area:hover,
.upload-area.is-dragging {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.04);
}

.upload-area.has-file {
  padding: 16px 20px;
  background: rgb(var(--v-theme-surface));
  border-style: solid;
  border-color: rgb(var(--v-theme-primary));
}

.upload-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 12px;
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-label {
  font-size: 0.9375rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 4px;
}

.upload-hint {
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-grey-500));
  margin: 0;
}

.file-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon-wrapper {
  width: 40px;
  height: 40px;
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-details {
  flex: 1;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.file-size {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-grey-500));
}

.error-text {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 0.8125rem;
  color: rgb(var(--v-theme-error));
}
</style>
