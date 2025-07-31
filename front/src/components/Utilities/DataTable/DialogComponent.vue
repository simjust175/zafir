<template>
  <v-dialog
    v-model="internalDialog"
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
        <v-icon class="pr-2" left>
          mdi-pencil
        </v-icon>
      </v-toolbar>

      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="localItem.issuer"
                label="Issuer"
              />
            </v-col>

            <v-col cols="6">
              <v-text-field
                v-model="localItem.amount"
                prefix="€"
                label="Amount"
              />
            </v-col>

            <v-col cols="6">
              <v-text-field
                v-model="localItem.btwPercent"
                label="Btw"
                prefix="%"
              />
            </v-col>

            <v-col cols="6">
              <v-text-field
                v-model="localItem.margin"
                label="Margin"
                prefix="%"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="close"
        >
          Cancel
        </v-btn>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="save"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  dialogProp: Boolean,
  editedItem: Object,
  originalItem: Object,
  formTitle: String,
});

const emit = defineEmits(['close', 'save']);

// Local copy of dialog (so we can mutate it)
const internalDialog = ref(props.dialogProp);

// Watch dialogProp from parent and sync it locally
watch(() => props.dialogProp, (val) => {
  internalDialog.value = val;
});

// Emit close when dialog is closed
watch(internalDialog, (val) => {
  if (!val) emit('close');
});

// Local copy of edited item to avoid mutating prop
const localItem = ref({ ...props.editedItem });

watch(() => props.editedItem, (val) => {
  localItem.value = { ...val };
});

// ===== Logic =====
const normalize = (val) => {
  if (val === '' || val === null || val === undefined) return null;
  const number = Number(val);
  return isNaN(number) ? val : number;
};

const close = () => {
  internalDialog.value = false;
};

const save = () => {
  const toEdit = localItem.value;
  const base = props.originalItem;
  const changes = {};

  for (const key in toEdit) {
    const normEdit = normalize(toEdit[key]);
    const normBase = normalize(base[key]);
    if (normEdit !== normBase) {
      changes[key] = toEdit[key];
    }
  }

  if (Object.keys(changes).length === 0) {
    close();
    return;
  }

  emit('save', { body: changes, id: toEdit.invoice_id });
  close();
};
</script>
