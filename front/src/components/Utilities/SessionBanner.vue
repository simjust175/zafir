<template>
  <transition name="slide-fade">
    <v-alert
      v-if="visible"
      type="error"
      variant="tonal"
      class="fixed top-0 left-0 w-full z-50 rounded-0 py-4 shadow-lg backdrop-blur-sm"
      border="bottom"
      density="comfortable"
      closable
      @click:close="visible = false"
    >
      <strong>{{ title }}</strong> — {{ message }}
    </v-alert>
  </transition>
</template>

<script setup>
import { ref, onMounted } from "vue";

const visible = ref(false);
const title = ref("");
const message = ref("");

onMounted(() => {
  window.addEventListener("token-warning", (e) => {
    title.value = e.detail.title || "Session Warning";
    message.value = e.detail.message || "";

    visible.value = true;

    // Auto-hide
    setTimeout(() => {
      visible.value = false;
    }, 6000);
  });
});
</script>

<style scoped>
/* Slide down + fade */
.slide-fade-enter-active {
  transition: all .35s ease;
}
.slide-fade-leave-active {
  transition: all .25s ease;
  opacity: 0;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-15px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>