<template>
  <v-dialog
    v-model="dialogModel"
    max-width="440"
    class="edit-project-dialog"
  >
    <v-card class="dialog-card" rounded="xl">
      <div class="dialog-header">
        <div class="icon-container">
          <v-icon size="28" color="primary">mdi-pencil-outline</v-icon>
        </div>
        <h3 class="dialog-title">Edit Project Name</h3>
        <p class="dialog-subtitle">Update your project's display name</p>
      </div>

      <div class="dialog-body">
        <div class="input-wrapper">
          <label class="input-label">Project Name</label>
          <v-text-field
            v-model="editedName"
            placeholder="Enter project name"
            variant="outlined"
            density="comfortable"
            autofocus
            clearable
            hide-details="auto"
            rounded="lg"
            class="name-input"
          >
            <template #prepend-inner>
              <v-icon size="20" color="grey-darken-1">mdi-folder-outline</v-icon>
            </template>
          </v-text-field>
        </div>
      </div>

      <div class="dialog-actions">
        <v-btn
          variant="outlined"
          size="large"
          rounded="lg"
          class="action-btn cancel-btn"
          @click="$emit('close')"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          size="large"
          rounded="lg"
          :loading="isSaving"
          :disabled="!editedName || editedName === initialName"
          class="action-btn save-btn"
          @click="saveProjectName"
        >
          <v-icon start size="18">mdi-check</v-icon>
          Save Changes
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>
  

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  open: Boolean,
  initialName: String,
  projectId: [String, Number]
})

const emit = defineEmits(['update:open', 'saved', 'close'])

const dialogModel = ref(props.open)
watch(() => props.open, val => dialogModel.value = val)
watch(dialogModel, val => emit('update:open', val))

const editedName = ref(props.initialName || '')
const isSaving = ref(false)

const saveProjectName = async () => {
  const newName = editedName.value.trim()
  if (!newName || isSaving.value) return

  isSaving.value = true
  try {
    const res = await fetch(
      `${import.meta.env.VITE_BASE_URL}/invoice/patch/projects?project=${props.projectId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_name: newName })
      }
    )

    if (!res.ok) throw new Error('Failed to patch project name')

    emit('saved', newName)
    emit('close')
    dialogModel.value = false
  } catch (err) {
    console.error('Patch error:', err)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.dialog-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  overflow: hidden;
}

.dialog-header {
  text-align: center;
  padding: 32px 32px 24px;
  background: linear-gradient(180deg, 
    rgba(var(--v-theme-primary), 0.04) 0%, 
    transparent 100%
  );
}

.icon-container {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: rgba(var(--v-theme-primary), 0.12);
}

.dialog-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 6px;
  letter-spacing: -0.01em;
}

.dialog-subtitle {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-grey-500));
  margin: 0;
}

.dialog-body {
  padding: 8px 32px 24px;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin-left: 4px;
}

.name-input {
  margin-top: 0;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  padding: 20px 32px 28px;
  background: rgba(var(--v-theme-on-surface), 0.02);
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}

.action-btn {
  flex: 1;
  font-weight: 600;
  letter-spacing: 0.01em;
  text-transform: none;
}

.cancel-btn {
  border-color: rgba(var(--v-theme-on-surface), 0.15);
  color: rgb(var(--v-theme-grey-700));
}

.save-btn {
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.25);
}

@media (max-width: 480px) {
  .dialog-header,
  .dialog-body,
  .dialog-actions {
    padding-left: 20px;
    padding-right: 20px;
  }
  
  .dialog-actions {
    flex-direction: column-reverse;
  }
}
</style>

<style>
.edit-project-dialog .v-overlay__content {
  align-items: center;
}
</style>
