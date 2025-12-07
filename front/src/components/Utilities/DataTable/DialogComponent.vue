<template>
  <v-dialog v-model="internalDialog">
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
        :color="theme.global.name.value === 'dark' ? 'bg-grey-darken-3' : 'bg-grey-lighten-4'"
      >
        <v-icon class="pr-2" left>
          mdi-pencil
        </v-icon>
      </v-toolbar>

      <v-card-text>
        <v-container>
          <h5>{{ editedItem }}</h5>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="localItem.issuer"
                label="Issuer"
              />
            </v-col>

            <v-col cols="6">
              <v-text-field
                v-model.number="localItem.amount"
                prefix="€"
                label="Amount"
              />
            </v-col>

            <v-col cols="6">
              <v-text-field
                v-model.number="localItem.btwPercent"
                label="Btw"
                suffix="%"
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
import { useTheme } from 'vuetify';
const theme = useTheme()

const props = defineProps({
  dialogProp: Boolean,
  editedItem: Object,
  originalItem: Object,
  formTitle: String,
});

const emit = defineEmits(['close', 'save']);

const internalDialog = ref(props.dialogProp);
const localItem = ref({ ...props.editedItem });

// Keep a reference to original net amount for live recalculation
const netAmount = ref(null);

// Sync dialog open/close with parent
watch(() => props.dialogProp, (val) => {
  internalDialog.value = val;
});
watch(internalDialog, (val) => {
  if (!val) emit('close');
});

// Sync localItem with prop and store netAmount
watch(() => props.editedItem, (val) => {
  localItem.value = { ...val };

  // Calculate the net amount (without BTW)
  if (val.btwPercent) {
    netAmount.value = val.amount / (1 + val.btwPercent / 100);
  } else {
    netAmount.value = val.amount;
  }
});

// Live recalculation when btwPercent changes
watch(() => localItem.value.btwPercent, (newBtw, oldBtw) => {
  if (newBtw !== oldBtw && netAmount.value != null) {
    const updatedAmount = netAmount.value * (1 + (Number(newBtw) || 0) / 100);
    localItem.value.amount = Number(updatedAmount.toFixed(2));
  }
});

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

  emit('save', { body: changes, id: toEdit.id });
  close();
};
</script>