<template>
  <v-dialog v-model="dialog" max-width="500px">
    <template v-slot:activator="{ props }">
      <v-btn class="mb-2" color="primary" dark v-bind="props" icon="mdi-arrow-expand" @click="$router.push('/table')"
        v-if="$router.name == '/'">
      </v-btn>
    </template>
    <v-card>
      <v-toolbar :title="formTitle" class="px-8" color="grey-lighten-2">
        <v-icon class="pr-2" left>mdi-pencil</v-icon>
      </v-toolbar>

      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" md="12" sm="6">
              <v-text-field v-model="editedItem.method" label="Method"></v-text-field>
            </v-col>
            <v-col cols="6" md="6" sm="6">
              <v-text-field v-model="editedItem.amount" label="Amount"></v-text-field>
            </v-col>
            <v-col cols="6" md="6" sm="6">
              <v-text-field v-model="editedItem.currency" label="currency"></v-text-field>
            </v-col>
            <v-col cols="12" md="12" sm="6">
              <v-text-field v-model="editedItem.integrity" label="Level of Integrity"></v-text-field>
            </v-col>
            <v-col cols="12" md="12" sm="6">
              <drop-down :menuItems="charityMethods" @methodSelect="editedItem.charity_method =$event" :beforeUpdate="editedItem.charity_method" />
            </v-col>
            <v-col cols="12" md="12" sm="6">
              <v-text-field v-model="editedItem.description" label="Description"></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="close">Cancel</v-btn>
        <v-btn color="blue-darken-1" variant="text" @click="save">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  dialogProp: Boolean,
  editedItem: Object,
  formTitle: String,
});

const dialog = computed(() => props.dialogProp)

const charityMethods = ref([
  "Anei irchu",
  "Chasidus",
  "Family",
  "Other"
]);

const emit = defineEmits(['close', 'save']);

const close = () => {
  emit('close');
};

const save = () => {
  emit('save');
};
</script>