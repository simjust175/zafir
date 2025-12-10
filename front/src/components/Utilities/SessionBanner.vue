<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed top-0 left-0 w-full z-50 bg-red-600 text-white text-center py-3 shadow-md"
    >
      <strong>{{ title }}</strong> — {{ message }}
    </div>
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

    // Auto-hide after 8 seconds (safe)
    // setTimeout(() => {
    //   visible.value = false;
    // }, 8000);
  });
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity .3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>