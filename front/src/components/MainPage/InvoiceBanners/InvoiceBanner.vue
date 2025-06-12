<template>

  <v-card
    class="px-4"
    lines="one"
    width="100%"
    height="100"
    :class="{'pt-2':actionStat}"
  >
    <div class="d-flex">
      <!-- <v-icon :icon="cardIcon(item.type)"></v-icon> -->
      <v-icon
        size="70"
        :icon="cardIcon(item.type)"
      />
      <p class="text-grey-lighten-2 text-caption">
        {{ item.type }}
      </p>
      <v-divider
        direction="vertical"
        color="transparent"
      />
      Expires{{ formatDate(item.date) }}
    </div>

    <div>
      <v-btn @click="editItem(item)"> 
        Edit 
      </v-btn>
      <v-btn @click="deleteItem(index)">
        Delete
      </v-btn>
    </div>
  </v-card>
</template>

<script src>
import { ref, reactive, computed, watch, onMounted, nextTick, defineProps, defineEmits } from "vue";
import DialogComponent from "../../Utilities/DataTable/DialogComponent.vue";
import DeleteDialogComponent from "../../Utilities/DataTable/DeleteDialogComponent.vue";
import EmptyState from "../../Utilities/EmptyState.vue";

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

<style>

</style>