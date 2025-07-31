<template>
  <v-dialog
    v-model="dialogTrigger"
    class="d-flex flex-column align-center justify-center"
  >
    <v-card
      class="pa-4 pt-1 rounded-xl"
      append-icon="mdi-close"
      prepend-icon="mdi-alert-circle"
      title="Confirm completion"
      @click:append-inner="$emit('close')"
    >
      <!-- <v-card-title>
          Confirm completion
        </v-card-title> -->
      <v-card-text>
        Are you sure you want to complete, project: <span class="text-capitalize font-weight-medium">{{ project[0]?.project_name }}</span>?<br>
        <span class="text-caption-3 font-weight-light"> This action cannot be undone</span>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="error"
          variant="text"
          @click="$emit('close')"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="outlined"
          @click="save('complete')"
        >
          Confirm
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<!-- eslint-disable vue/require-default-prop -->
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

<style>
.v-dialog > .v-overlay__content{
    align-items: center;
}

</style>