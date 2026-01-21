<template>
  <v-dialog
    v-model="dialogTrigger"
    max-width="440"
    class="complete-project-dialog"
  >
    <v-card class="dialog-card" rounded="xl">
      <div class="dialog-header">
        <div class="icon-container warning">
          <v-icon size="28" color="warning">mdi-alert-circle-outline</v-icon>
        </div>
        <h3 class="dialog-title">Complete Project</h3>
        <p class="dialog-subtitle">This action cannot be undone</p>
      </div>

      <div class="dialog-body">
        <div class="project-preview">
          <div class="project-icon">
            <v-icon size="20" color="primary">mdi-folder-outline</v-icon>
          </div>
          <div class="project-info">
            <span class="project-label">Project</span>
            <span class="project-name">{{ project[0]?.project_name }}</span>
          </div>
        </div>
        
        <p class="confirmation-text">
          Are you sure you want to mark this project as complete? All associated invoices will be archived.
        </p>
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
          color="warning"
          size="large"
          rounded="lg"
          class="action-btn confirm-btn"
          @click="save('complete')"
        >
          <v-icon start size="18">mdi-check-circle</v-icon>
          Complete Project
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from "vue"
const props = defineProps({
    project: Object,
    trigger: Boolean
})
const emit = defineEmits(['close', 'projectRemoved'])
const dialogTrigger = ref(false);
watch(()=> props.trigger, (newVal)=> dialogTrigger.value = newVal)

function formatDateToMySQL(date) {
  return date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0') + ' ' +
    String(date.getHours()).padStart(2, '0') + ':' +
    String(date.getMinutes()).padStart(2, '0') + ':' +
    String(date.getSeconds()).padStart(2, '0');
}

const save = async()=> {
  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/invoice/patch/projects?project=${props.project[0]?.project_id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({completed_on: formatDateToMySQL(new Date())})
    })

    if (!res.ok) {
      throw new Error('Failed to change value')
    }
    emit('close')
    emit('projectRemoved')
  } catch (err) {
    console.error(err)
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
    rgba(var(--v-theme-warning), 0.04) 0%, 
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
  background: rgba(var(--v-theme-warning), 0.12);
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
  padding: 0 32px 24px;
}

.project-preview {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: rgba(var(--v-theme-primary), 0.04);
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
  border-radius: 12px;
  margin-bottom: 20px;
}

.project-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(var(--v-theme-surface));
  border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-primary), 0.15);
}

.project-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.project-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgb(var(--v-theme-grey-500));
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.project-name {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  text-transform: capitalize;
}

.confirmation-text {
  font-size: 0.9375rem;
  color: rgb(var(--v-theme-grey-600));
  line-height: 1.6;
  margin: 0;
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

.confirm-btn {
  box-shadow: 0 4px 12px rgba(var(--v-theme-warning), 0.25);
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
.complete-project-dialog .v-overlay__content {
  align-items: center;
}
</style>
