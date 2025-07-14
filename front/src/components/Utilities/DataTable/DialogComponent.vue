<template>
  <v-dialog
    v-model="dialog"
    max-width="500px"
  >
    <template #activator="{ props }">
      <v-btn
        v-if="$router.name == '/'"
        class="mb-2"
        color="primary"
        dark
        v-bind="props"
        icon="mdi-arrow-expand"
        @click="$router.push('/table')"
      />
    </template>

    <v-card>
      <v-toolbar
        :title="formTitle"
        class="px-8"
        color="grey-lighten-2"
      >
        <v-icon class="pr-2" left>mdi-pencil</v-icon>
      </v-toolbar>

      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" md="12" sm="6">
              <v-text-field v-model="editedItem.issuer" label="Issuer" />
            </v-col>

            <v-col cols="6" md="6" sm="6">
              <v-text-field v-model="editedItem.amount" label="Amount" />
            </v-col>

            <v-col cols="6" md="6" sm="6">
              <v-text-field v-model="editedItem.btwPercent" label="Btw" prefix="%" />
            </v-col>

            <v-col cols="6" md="6" sm="6">
              <v-text-field v-model="editedItem.margin" label="Margin" prefix="%" />
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="blue-darken-1" variant="text" @click="close">Cancel</v-btn>
        <v-btn color="blue-darken-1" variant="text" @click="save">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  dialogProp: Boolean,
  editedItem: Object,
  originalItem: Object, // ✅ NEW prop
  formTitle: String,
});

const dialog = computed(() => props.dialogProp);
const emit = defineEmits(['close', 'save']);

const close = () => {
  emit('close');
};

const normalize = (val) => {
  if (val === '' || val === null || val === undefined) return null;
  const number = Number(val);
  return isNaN(number) ? val : number;
};

const save = async () => {
  const toEdit = props.editedItem;
  const base = props.originalItem;

  const changes = {};

  for (const key in toEdit) {
    const normalizedToEdit = normalize(toEdit[key]);
    const normalizedOriginal = normalize(base[key]);

    if (normalizedToEdit !== normalizedOriginal) {
      changes[key] = toEdit[key];
    }
  }

  // If no changes, skip patch
  if (Object.keys(changes).length === 0) {
    emit('close');
    return;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_URL}/invoice/patch/invoices?id=${toEdit.invoice_id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      }
    );

    if (!response.ok) throw new Error('Failed to patch invoice');

    const data = await response.json();
    emit('save');
    console.log('✅ Successfully patched:', data);
  } catch (error) {
    console.error('❌ Patch error:', error.message);
  }
};
</script>