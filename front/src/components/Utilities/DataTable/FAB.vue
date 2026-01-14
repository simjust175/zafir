<template>
  <button class="floating-action-btn">
    <v-icon size="24">mdi-plus</v-icon>
  </button>
</template>

<script setup>
</script>

<style scoped>
.floating-action-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: #635bff;
  color: #fff;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(99, 91, 255, 0.4);
  transition: all 0.2s ease;
}

.floating-action-btn:hover {
  background: #5851ea;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 91, 255, 0.5);
}

.floating-action-btn:active {
  transform: translateY(0);
}
</style>
