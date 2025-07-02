<!-- eslint-disable vue/valid-v-slot -->
<template>
  <v-card
    class="pa-3"
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
            Invoices
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
            class="mr-5"
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
          class="d-flex align-center justify-lg-space-between"
        >
          <v-icon
            size="22"
            color="primary"
            @click="editItem(item)"
          >
            mdi-pencil
          </v-icon>
          <v-icon
            size="22"
            color="error"
            class="ml-4"
            @click="deleteItem(item)"
          >
            mdi-delete
          </v-icon>
          <v-icon
            size="22"
            color="success"
            class="ml-4"
            @click="sendItem(item)"
          >
            mdi-send
          </v-icon>
        </div>
      </template>

      <template #no-data>
        <empty-state
          class="my-12"
          @refresh="initialize()"
        />
      </template>

      <!-- <template #item.integrity="{ value }">
        <v-chip :color="getColor(value)">
          {{ value }}
        </v-chip>
      </template> -->
      <template #item.amount="{ item }">
        <span>€{{ item.amount }}</span>
      </template>
    
      <template #item.created_at="{ item }">
        {{ new Date(item.created_at).toLocaleDateString() }}
      </template>
      <template #item.includesBtw="{ item }">
        {{ item.includesBtw ? "included" : "excluded" }}
      </template>
      <template #item.btwPercent="{ item }">
        {{ item.btwPercent ? `${item.btwPercent}%` : "" }}
      </template>
      <!-- <template #item.method="{ value }">
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
      </template> -->
    </v-data-table>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, defineProps, defineEmits } from "vue";
import DialogComponent from "./DialogComponent.vue";
import DeleteDialogComponent from "./DeleteDialogComponent.vue";
import EmptyState from "../EmptyState.vue";
import { invoices  } from "@/stores/invoiceState";
const invoiceArray = invoices()
import socket from "@/socket.js";


const emit = defineEmits(["amountUpdate"])
const props = defineProps({
  invoices: { type: Array, default: () => [] },
  language: String,
  actionStat: Boolean,
  employee: Number
});

const search = ref("");
const dialogProp = ref(false);
const dialogDelete = ref(false);
const actionStat = ref(props.actionStat);
const heightPerWindow = computed(()=> actionStat.value ? "" : 405)


const headers = computed(() => {
  const baseHeaders = [
    { title: 'date', key: 'created_at' },
    { title: "Issuer", key: "issuer" },
    { title: "Amount", key: "amount" },
    { title: "Btw", key: "includesBtw" },
    { title: "(%)", key: "btwPercent" },
    { title: "", key: "actions", sortable: false },
  ];
  return baseHeaders;
});

const arrowIcon = computed(() => `mdi-arrow-${props.language === 'he' ? 'right' : 'left'}` );

const dbContents = ref([]);
const loading = ref(true); // Initialize with true to show loading state.
const editedIndex = ref(-1);
const editedItem = ref({
  date: "",
  issuer: "",
  amount: 0,
  btw: "",
});

const defaultItem = {
  date: "",
  issuer: "",
  amount: 0,
  btw: ""
};

const formTitle = computed(() =>
  editedIndex.value === -1 ? "New Item" : "Edit Item"
);

// Automatically initialize data when the component is mounted.
onMounted(() => {
  initialize();
  socket.on("new-invoice", (invoice) => {
  console.log("📩 New invoice received", invoice);
  dbContents.value = [invoice, ...dbContents.value];
  invoiceArray.dbResponse = [invoice, ...invoiceArray.dbResponse];
});
});



const initialize = () => {
  loading.value = true;
  setTimeout(() => {
    dbContents.value = [...props.invoices];
    emit("amountUpdate")// Simulate async data loading.
    loading.value = false; // Set loading to false once data is loaded.
  }, 500); // Optional delay to simulate loading.
};

// Watch for changes in the `invoices` prop and initialize if it updates.
watch(
  () => props.invoices,
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

const sendItem = (item) => {
  console.log("sending 📨📨📨📨📨", dbContents.value.indexOf(item), {...item});
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

// onMounted(() => {
//   socket.on("new-invoice", (invoice) => {
//     console.log("📩 New invoice received", invoice);
//     dbContents.value.unshift(invoice); // Insert at top of your reactive array
//   });
// });

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
