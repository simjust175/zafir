<template>
  <div>
   <v-btn>test</v-btn>

    <!-- Invoice Popup -->
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { invoices } from "@/stores/invoiceState";
const invoiceArray = invoices()
const activeEmailAddresses = computed(() => {
  const emails = invoiceArray.activeEmails.activeEmails || []
  return [...new Set(emails.map(ks => ks.email_address))]
})

import { useTheme } from "vuetify"

const theme = useTheme()
const themeColor = computed(() =>
  theme.global.name.value === "dark" ? "bg-grey-darken-3" : "bg-grey-lighten-4"
)

const menu = ref(false)
//CHECK IF ONLInE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
const online = computed(() => activeEmailAddresses.value.length)
</script>

<style scoped>
#logo {
  z-index: 1;
}

#logo-text {
  z-index: 2;
}

.live-dot {
  height: 10px;
  width: 10px;
  background-color: red;
  border-radius: 50%;
  display: inline-block;
  animation: pulse 1.5s infinite;
  z-index: 1;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.5);
    opacity: 0.5;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>