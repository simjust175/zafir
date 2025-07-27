<template>
  <v-navigation-drawer
    v-if="router.currentRoute.value.fullPath !== '/register'"
    v-model="drawer"
    :permanent="true"
    class="pt-3"
    :rail="railStat"
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
      <NavItemWithTooltip
        title="Chart"
        prepend-icon="mdi-table-eye"
        value="table"
        :rail="railStat"
        @click="openExpandedTable"
      />
      <NavItemWithTooltip
        title="Manage users"
        prepend-icon="mdi-account-plus-outline"
        value="user"
        :rail="railStat"
        @click="router.push('/users')"
      />
      <NavItemWithTooltip
        title="Upload"
        prepend-icon="mdi-file-upload-outline"
        value="upload"
        :rail="railStat"
        @click="activateUploadDialog = !activateUploadDialog"
      />
      <NavItemWithTooltip
        title="Create invoice"
        prepend-icon="mdi-invoice-plus-outline"
        value="create"
        :rail="railStat"
        @click="invoiceFormRef?.open()"
      />
      <NavItemWithTooltip
        title="AI chat"
        prepend-icon="mdi-robot-outline"
        value="chat"
        :rail="railStat"
        @click="showChatBot = true"
      />
      <NavItemWithTooltip
        title="Receipts"
        prepend-icon="mdi-receipt-text-outline"
        value="receipt"
        :rail="railStat"
      />
    </v-list>
    <template #append>
      <div
        v-if="!(isMobile || router.currentRoute.value.fullPath === '/table')"
        class="d-flex justify-center"
      >
        <v-btn
          append-icon="mdi-export"
          text="Logout"
          color="primary"
          value="logout"
          rounded="md"
          width="93%"
          class="mb-2"
          @click="activateDialog = !activateDialog"
        />
      </div>
      <v-list-item
        v-else
        prepend-icon="mdi-export"
        title="Logout"
        value="logout"
        class="bg-primary rounded-lg ma-1"
        @click="activateDialog = !activateDialog"
      />
    </template>
  </v-navigation-drawer>
  <main-dialog
    :activate-dialog="activateDialog"
    title="Confirm Log-out"
    text="Are you sure?"
    @confirm="logout"
  />
  <file-upload
    :active="activateUploadDialog"
    @close="activateUploadDialog = false"
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
import NavItemWithTooltip from "../Utilities/NavItemWithTooltip.vue";
import { ref, computed } from "vue";
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';

const display = useDisplay();

// Detects mobile based on breakpoint
const isMobile = computed(() => display.smAndDown.value);

//rail
const railStat = computed(()=> isMobile.value || router.currentRoute.value.fullPath === '/table')

// Dynamically set drawer location
const drawerLocation = computed(() => display.smAndDown.value ? 'bottom' : 'left');


const showChatBot = ref(false)
const router = useRouter();

// import { useLocale } from 'vuetify'
// const { t } = useLocale()
const invoiceFormRef = ref(null);
const activateDialog = ref(false)
const activateUploadDialog = ref(false)
const drawer = ref(true);
const rail = ref(true);

const toggleRail = () => {
  rail.value = !rail.value;
};

const openExpandedTable = () => {
  router.push('/table');
  rail.value = false;
};

const logout = async () => {
  const res = await fetch(`${import.meta.env.VITE_BASE_URL}/register/logout/${loginState.userName}`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      }
  });
  const data = await res.json();
  console.log("logout", data);
  if (data.Success) {
      localStorage.removeItem("token");
      localStorage.removeItem("user_email") 
      loginState.token = false;
      router.push("/register")
  }
}
</script>

<style>
.mt-max {
  margin-top: 100px;
}
</style>
