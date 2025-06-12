<template>
  <v-card
    class="pa-4"
    :class="{'pt-2':actionStat}"
  >
    <v-data-table
      :headers="headers"
      :items="dbContents"
      :search="search"
      :sort-by="[{ key: 'created_at', order: 'desc' }]"
      hide-default-footer
      :max-height="heightPerWindow"
      :loading="dbContents.length === 0 ? loading : null"
      loading-text="Loading... Please wait"
    >
      <template #loading>
        <v-skeleton-loader type="table-row@10" />
      </template>
      <template #top>
        <v-toolbar
          class="bg-grey-lighten-5"
          flat
        >
          <v-toolbar-title v-if="!actionStat">
            Charity details
          </v-toolbar-title>
          <v-toolbar-title v-else>
            <v-icon
              v-if="actionStat"
              class="mb-4"
              :icon="arrowIcon"
              size="large"
              left
              @click="$router.push('/')"
            />
          </v-toolbar-title>

          <v-divider
            class="mx-4"
            inset
            vertical
          />
          <v-spacer />
          <v-text-field
            v-if="actionStat"
            v-model="search"
            density="compact"
            class="pr-4 rounded-b-pill"
            label="Search"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            hide-details
            single-line
          />

          <v-icon
            v-if="!actionStat"
            icon="mdi-arrow-expand"
            :class="{ 'mr-5': props.language === 'en', 'ml-5': props.language === 'he' }"
            color="blue-darken-1"
            @click="$router.push('/table')"
          />

          <DialogComponent
            :dialog-prop="dialogProp"
            :edited-item="editedItem"
            :form-title="formTitle"
            @close="close"
            @save="save"
          />
          <DeleteDialogComponent
            :dialog-delete="dialogDelete"
            @close-delete="closeDelete"
            @delete-item-confirm="deleteItemConfirm"
          />
        </v-toolbar>
      </template>

      <template #item.actions="{ item }">
        <div
          v-show="actionStat"
          class="d-flex"
        >
          <v-icon
            class="me-2"
            size="small"
            color="blue"
            @click="editItem(item)"
          >
            mdi-pencil
          </v-icon>
          <v-icon
            size="small"
            color="red"
            class="ml-2"
            @click="deleteItem(item)"
          >
            mdi-delete
          </v-icon>
        </div>
      </template>

      <template #no-data>
        <empty-state @refresh="initialize()" class="my-12"/>
      </template>

      <template #item.integrity="{ value }">
        <v-chip :color="getColor(value)">
          {{ value }}
        </v-chip>
      </template>
      <template #item.amount="{ item }">
        <span>{{ getCurrencySymbol(item.currency) + item.amount }}</span>
      </template>
      <template #item.currency="{ item }">
        <span>{{ item.currency.toUpperCase() }}</span>
      </template>
      <template #item.created_at="{ item }">
        {{ new Date(item.created_at).toLocaleDateString() }}
      </template>
      <template #item.method="{ value }">
        <v-chip
          v-if="actionStat"
          :color="methodColor(value)"
          :prepend-icon="methodIcon(value)"
          label
        >
          {{ t(value) }}
        </v-chip>
        <div
          v-else
          class="d-flex"
        >
          <v-icon
            :color="methodColor(value)"
            :icon="methodIcon(value)"
          />
          {{ t(value) }}
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick, defineProps, defineEmits } from "vue";
import DialogComponent from "./DialogComponent.vue";
import DeleteDialogComponent from "./DeleteDialogComponent.vue";
import EmptyState from "../EmptyState.vue";

const emit = defineEmits(["amountUpdate"])
const props = defineProps({
  amountArray: { type: Array, default: () => [] },
  language: String,
  actionStat: Boolean,
  employee: Number
});

const search = ref("");
const dialogProp = ref(false);
const dialogDelete = ref(false);
const actionStat = ref(props.actionStat);
const heightPerWindow = computed(()=> actionStat.value ? "" : 405)

import { useLocale } from 'vuetify'
const { t } = useLocale()

const headers = computed(() => {
  const baseHeaders = [
    { title: t('date'), key: 'created_at' },
    { title: t("Category"), key: "method" },
    { title: t("Amount"), key: "amount" },
    { title: t("Currency"), key: "currency" },
    { title: t("Description"), key: "description" },
  ];
  if (actionStat.value) {
    baseHeaders.push({ title: t("Level of Integrity"), key: "integrity" });
    baseHeaders.push({ title: t("Charity method"), key: "charity_method" });
    baseHeaders.push({ title: t("Actions"), key: "actions", sortable: false });
  }
  return baseHeaders;
});

const arrowIcon = computed(() => `mdi-arrow-${props.language === 'he' ? 'right' : 'left'}` );
const currencySymbols = reactive({
  EUR: "€",
  GBP: "£",
  ILS: "₪",
  FRANC: "₣",
  USD: "$",
  default: "?",
});

const getCurrencySymbol = (currency) => currencySymbols[currency.toUpperCase()] || currencySymbols.default

const dbContents = ref([]);
const loading = ref(true); // Initialize with true to show loading state.
const editedIndex = ref(-1);
const editedItem = ref({
  date: "",
  method: "",
  amount: 0,
  currency: "",
  integrity: 0,
  description: "",
});

const defaultItem = {
  date: "",
  method: "",
  amount: 0,
  currency: "",
  integrity: 0,
  description: "",
};

const formTitle = computed(() =>
  editedIndex.value === -1 ? "New Item" : "Edit Item"
);

// Automatically initialize data when the component is mounted.
onMounted(() => {
  initialize();
});

const initialize = () => {
  loading.value = true;
  setTimeout(() => {
    dbContents.value = [...props.amountArray];
    emit("amountUpdate")// Simulate async data loading.
    loading.value = false; // Set loading to false once data is loaded.
  }, 500); // Optional delay to simulate loading.
};

// Watch for changes in the `amountArray` prop and initialize if it updates.
watch(
  () => props.amountArray,
  (newArray) => {
    if (newArray) {
      initialize();
    }
  },
  { immediate: true } // Trigger the watcher immediately on mount.
);

const editItem = (item) => {
  editedIndex.value = dbContents.value.indexOf(item);
  editedItem.value = { ...item };
  dialogProp.value = true;
};

const deleteItem = (item) => {
  editedIndex.value = dbContents.value.indexOf(item);
  editedItem.value = { ...item };
  dialogDelete.value = true;
};

const deleteItemConfirm = () => {
  dbContents.value.splice(editedIndex.value, 1);
  closeDelete();
};

const close = () => {
  dialogProp.value = false;
  nextTick(() => {
    editedItem.value = { ...defaultItem };
    editedIndex.value = -1;
  });
};

const closeDelete = () => {
  dialogDelete.value = false;
  nextTick(() => {
    editedItem.value = { ...defaultItem };
    editedIndex.value = -1;
  });
};

const save = () => {
  //PATCH EDIT && CALL GET()
  if (editedIndex.value > -1) {
    Object.assign(dbContents.value[editedIndex.value], editedItem.value);
  } else {
    dbContents.value.push(editedItem.value);
  }
  close();
};

const colors = {
  1: "red-darken-2",
  2: "red-lighten-3",
  3: "orange",
  4: "yellow",
  5: "green",
  income: "green",
  charity: "blue",
  expense: "red"
};

const methodIcons = {
  income: "mdi mdi-menu-up",
  expense: "mdi mdi-menu-down",
  charity: "mdi mdi-menu-down"
}

const getColor = (value) => colors[value] || "grey"; // Default to 'grey' for unexpected values.
const methodColor = (value) => colors[value] || "grey"
const methodIcon = (value) => methodIcons[value]
</script>
