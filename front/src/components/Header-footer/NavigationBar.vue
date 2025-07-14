<template>
  <v-navigation-drawer
    v-if="router.currentRoute.value.fullPath !== '/register'"
    v-model="drawer"
    :permanent="true"
    class="pt-3"
    :rail="isMobile || router.currentRoute.value.fullPath === '/table'"
    :mobile="isMobile"
    :temporary="!rail"
  >
    <!-- :location="drawerLocation" -->
    <!-- @click.stop="toggleRail" -->
    <!-- <v-list-item
      prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
      :title="display.smAndDown.value"
      nav
    /> -->

    <v-divider />

    <v-list
      density="compact"
      nav
    >
      <v-list-item
        prepend-icon="mdi-table-eye"
        :title="titles.table[lang]"
        value="table"
        @click="openExpandedTable"
      />
      <v-list-item
        prepend-icon="mdi-account-plus-outline"
        title="Add user"
        value="user"
        @click="router.push('/users')"
      />
      <v-list-item
        prepend-icon="mdi-file-upload-outline"
        title="Upload"
        @click="acivateUploadDialog = !acivateUploadDialog"
      />
      <v-list-item
        prepend-icon="mdi-invoice-plus-outline"
        title="Create invoice"
        @click="invoiceFormRef?.open()"
      />
     
      <v-list-item
        prepend-icon="mdi-robot-outline"
        title="AI chat"
        value="chat"
        @click="showChatBot = true"
      />
      <v-list-item
        prepend-icon="mdi-receipt-text-outline"
        :title="titles.receipts[lang]"
        value="receipt"
      />
    </v-list>
    <template #append>
      <v-list-item
        prepend-icon="mdi-export"
        :title="titles.logout[lang]"
        value="logout"
      />
    </template>
  </v-navigation-drawer>
  <main-dialog
    :activate-dialog="activateDialog"
    title="Confirm Log-out"
    text="confirm_dialog"
    @confirm="logout"
  />
  <file-upload
    :active="acivateUploadDialog"
    @close="acivateUploadDialog = false"
  />
  <v-dialog
    v-model="showChatBot"
    max-width="600px"
    persistent
  >
    <ChatBot @close="showChatBot = false" />
  </v-dialog>
  <create-invoice ref="invoiceFormRef" />
  <!-- <v-main style="height: 250px"></v-main> -->
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';

const display = useDisplay();

// Detects mobile based on breakpoint
const isMobile = computed(() => display.smAndDown.value);

// Dynamically set drawer location
const drawerLocation = computed(() => display.smAndDown.value ? 'bottom' : 'left');


const showChatBot = ref(false)
const props = defineProps({ lang: String })
const router = useRouter();

// import { useLocale } from 'vuetify'
// const { t } = useLocale()
const invoiceFormRef = ref(null);
const activateDialog = ref(false)
const acivateUploadDialog = ref(false)
const drawer = ref(true);
const rail = ref(true);


const toggleRail = () => {
  rail.value = !rail.value;
};

const titles = reactive({
  table: {
    he: "פרטים",
    en: "Table"
  },
  charts: {
    he: "הטבלאות שלי",
    en: "My tables"
  },
  currency: {
    he: "מטבע",
    en: "Currency"
  },
  percent: {
    he: "אחוזים",
    en: "Percentage"
  },
  location: {
    he: "מיקום",
    en: "Location"
  },
  receipts: {
    he: "קבלות",
    en: "Receipts"
  },
  logout: {
    he: "התנתקות",
    en: "logout"
  },

})

const openExpandedTable = () => {
  router.push('/table');
  rail.value = false;
};

const currencyDropDownStat = ref(false);
</script>

<style>
.mt-max {
  margin-top: 100px;
}
</style>
