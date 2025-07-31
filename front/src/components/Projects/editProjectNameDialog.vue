<template>
  <v-dialog
    v-model="dialogModel"
  >
    <v-card width="400">
      <v-card-title>Edit Project Name</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="editedName"
          label="Project Name"
          variant="outlined"
          autofocus
          clearable
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          variant="text"
          @click="dialogModel = false"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          :loading="isSaving"
          @click="saveProjectName"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
  

<!-- eslint-disable vue/require-default-prop -->
  <script setup>
  import { ref, watch } from 'vue'
  // import { useToast } from 'vue-toastification'
  
  const props = defineProps({
    open: Boolean,
    initialName: String,
    projectId: [String, Number]
  })
  
  const emit = defineEmits(['update:open', 'saved'])
  
  const dialogModel = ref(props.open)
  watch(() => props.open, val => dialogModel.value = val)
  watch(dialogModel, val => emit('update:open', val))
  
  const editedName = ref(props.initialName || '')
  const isSaving = ref(false)
  // const toast = useToast()
  
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
      dialogModel.value = false
    } catch (err) {
      // toast.error('Failed to update project name.')
      console.error('Patch error:', err)
    } finally {
      isSaving.value = false
    }
  }
  </script>
  
  <style scoped>
  .v-text-field {
    margin-top: 8px;
  }
  </style>