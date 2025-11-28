<template>
  <div>
    <!-- Action bar -->
    <div class="sticky-action-bar pa-3">
      <v-btn-toggle
        v-model="selection"
        mandatory
        class="w-100 d-flex flex-wrap justify-space-around ga-2"
        color="primary"
        rounded="lg"
      >
        <v-btn
          value="both"
          variant="tonal"
          color="success"
          class="action-btn"
          @click="$emit('keep-both')"
        >
          <v-icon size="24">
            mdi-content-duplicate
          </v-icon>
          <span>Keep Both</span>
        </v-btn>

        <v-btn
          value="this"
          variant="tonal"
          color="primary"
          class="action-btn"
          @click="$emit('keep-this')"
        >
          <v-icon size="24">
            mdi-file-check
          </v-icon>
          <span>Keep This</span>
        </v-btn>


        <v-btn
          value="none"
          variant="tonal"
          color="error"
          class="action-btn"
          @click="$emit('keep-none')"
        >
          <v-icon size="24">
            mdi-delete
          </v-icon>
          <span>Delete Both</span>
        </v-btn>
      </v-btn-toggle>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  fileA: String,
  fileB: String
});

defineEmits(["keep-both", "keep-this", "keep-duplicate", "keep-none"]);

const selection = ref(null);
</script>

<style scoped>
.sticky-action-bar {
  position: sticky;
  top: 0;
  background: inherit;
  z-index: 5;
  border-bottom: 1px solid var(--v-theme-surface-variant);
}

.action-btn {
  flex: 1 1 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px;
}
</style>
