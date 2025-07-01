<template>
  <v-navigation-drawer
    v-model="drawer"
    theme="light"
    :rail="rail"
    :permanent="true"
    :temporary="!rail"
  >
    <!-- @click.stop="toggleRail" -->
    <v-list-item
      prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
      title="User name"
      nav
    >
      <template #append>
        <v-btn
          :icon="chevronIcon"
          variant="text"
          @click.stop="toggleRail"
        />
      </template>
    </v-list-item>

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
        prepend-icon="mdi-finance"
        :title="titles.charts[lang]"
        value="charts"
      />
      <v-list-item
        prepend-icon="mdi-percent"
        :title="titles.percent[lang]"
        value="percentage"
      />
      <v-list-item
        prepend-icon="mdi-currency-usd"
        :title="titles.currency[lang]"
        value="currency"
      />
      <currency-drop-down :select-stat="false" />
      <v-list-item
        prepend-icon="mdi-map-marker"
        :title="titles.location[lang]"
        value="currency"
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
  <!-- <v-main style="height: 250px"></v-main> -->
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useRouter } from 'vue-router';
const props = defineProps({ lang: String })
const router = useRouter();

// import { useLocale } from 'vuetify'
// const { t } = useLocale()
const activateDialog = ref(false)

const drawer = ref(true);
const rail = ref(true);
const chevronIcon = computed(() => `mdi-chevron-${props.lang === 'he' ? 'right' : 'left'}`);

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
