<template>
  <v-dialog
    v-model="dialogStat"
    max-width="500px"
  >
    <v-card :class="[themeCardColor, 'elevation-12', 'pb-6', 'rounded-lg']">
      <v-toolbar
        :class="[themeToolbarColor, 'text-h5', 'pl-4']"
        flat
      >
        <v-icon
          class="ml-4 mr-12"
          left
        >
          mdi-alert-circle
        </v-icon>
        <span class="ml-12">Confirm Deletion</span>

        <template #append>
          <v-btn
            icon="mdi-close"
            @click="closeDelete"
          />
        </template>
      </v-toolbar>

      <v-card-text class="text-body-1 text-center pt-8">
        Are you sure you want to delete this item?
      </v-card-text>

      <v-card-actions class="d-flex align-content-end">
        <v-spacer />
        <v-btn
          color="grey"
          variant="outlined"
          @click="closeDelete"
        >
          Cancel
        </v-btn>
        <v-btn
          color="red darken-1"
          variant="text"
          @click="deleteItemConfirm"
        >
          Delete
        </v-btn>
        <v-spacer />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<!-- eslint-disable vue/require-default-prop -->
<script setup>
import { defineProps, defineEmits, computed } from "vue";
import { useTheme } from "vuetify";

// Props & emits
const props = defineProps({
  dialogDelete: Boolean,
  id: Object,
  editedIndex: Number,
  item: Object
});
const emit = defineEmits(["closeDelete", "deleteItemConfirm"]);

const dialogStat = computed(() => props.dialogDelete);

// Theme
const theme = useTheme();
const themeName = computed(() => theme.global.name.value);

const themeCardColor = computed(() =>
  themeName.value === 'dark' ? 'bg-grey-darken-3' : 'bg-grey-lighten-4'
);

const themeToolbarColor = computed(() =>
  themeName.value === 'dark' ? 'bg-grey-darken-4' : 'bg-grey-lighten-3'
);

// Events
const closeDelete = () => {
  emit("closeDelete");
};
const deleteItemConfirm = () => {
  emit("deleteItemConfirm", props.id.invoice_id);
};
</script>
