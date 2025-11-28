<template>
  <v-navigation-drawer
    v-if="router.currentRoute.value.fullPath !== '/register'"
    v-model="drawer"
    :permanent="true"
    class="pt-3"
    width="200"
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
        title="Home"
        prepend-icon="mdi-home-outline"
        value="home"
        :rail="railStat"
        @click="router.push('/')"
      />
      <NavItemWithTooltip
        title="Dashboard"
        prepend-icon="mdi-table-eye"
        value="table"
        :rail="railStat"
        @click="openExpandedTable"
      />
      <NavItemWithTooltip
        title="Manage projects"
        prepend-icon="mdi-office-building-cog-outline"
        value="projects"
        :rail="railStat"
        @click="router.push('/projects')"
      />
      <NavItemWithTooltip
        title="Manage invoices"
        prepend-icon="mdi-currency-usd"
        value="invoices"
        :rail="railStat"
        @click="router.push('/invoices')"
      />
      <NavItemWithTooltip
        title="Manage users"
        prepend-icon="mdi-account-multiple-plus-outline"
        value="user"
        :rail="railStat"
        @click="router.push('/users')"
      />

      
      <!-- removed the: value="upload" so that it should not be selected like a nav -->
      <NavItemWithTooltip
        title="Upload"
        prepend-icon="mdi-file-upload-outline"
        
        :rail="railStat"
        @click="activateUploadDialog = !activateUploadDialog"
      />
      
      <!-- removed the: value="create" so that it should not be selected like a nav -->
      <!-- <NavItemWithTooltip
        title="Create invoice"
        prepend-icon="mdi-invoice-plus-outline"
        
        :rail="railStat"
        @click="invoiceFormRef?.open()"
      /> -->
      
      <!-- removed the: value="chat" so that it should not be selected like a nav -->
      <div class="temp d-flex align-center">
        <NavItemWithTooltip
          title="AI chat"
          prepend-icon="mdi-robot-outline"
          :rail="railStat"
          @click="showChatBot = true"
        />
        <v-chip
          variant="tonal"
          density="compact"
          color="success"
          text="soon..."
        />
      </div>
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
    @close="activateDialog = false"
  />
  <invoice-upload-main
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
import NavItemWithTooltip from "./NavItemWithTooltip.vue";
import { ref, computed, watch } from "vue";
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import { setLogin } from "@/stores/loginState"
const loginState = setLogin()


const display = useDisplay();

// Detects mobile based on breakpoint
const isMobile = computed(() => display.smAndDown.value);

//rail
const railStat = computed(()=> isMobile.value || router.currentRoute.value.fullPath === '/table')

// Dynamically set drawer location
const drawerLocation = computed(() => display.smAndDown.value ? 'bottom' : 'left');


const showChatBot = ref(false)
const router = useRouter();

const activeItem = ref(router.currentRoute.value.path)

// Watch for route changes to update active item
watch(() => router.currentRoute.value.path, (newPath) => {
  activeItem.value = newPath
})
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
  console.log("=> =>", loginState.userName);
  
  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/register/logout/${loginState.userName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    console.log("logout", data);

    if (data.Success) {
      loginState.logout(); // ✅ use centralized store method
      router.push("/register");
    } else {
      console.warn("Logout failed:", data?.message || "Unknown error");
    }
  } catch (err) {
    console.error("❌ Logout request failed:", err);
  }
};
</script>

<style>
.mt-max {
  margin-top: 100px;
}
</style>
