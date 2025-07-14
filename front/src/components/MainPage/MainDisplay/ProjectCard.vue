<!-- eslint-disable vue/require-default-prop -->
<template>
  <v-card
    class="mx-0"
    max-width="400"
    border
    flat
  >
    <v-list-item
      class="px-6"
      height="58"
    >
      <template #prepend>
        <v-avatar
          color="surface-light"
          size="32"
        >
          🎯
        </v-avatar>
      </template>
  
      <template #title>
        <!-- {{ project.project }} -->
      </template>
  
      <template #append>
        <v-btn
          class="text-none"
          color="primary"
          text="Create goal"
          variant="text"
          slim
        />
      </template>
    </v-list-item>
  
    <v-divider />
  
    <v-card-text class="text-medium-emphasis pa-6">
      <div class="text-h6 mb-6">
        Earn my first $100
      </div>
  
      <div class="text-h4 font-weight-black mb-4">
        0%
      </div>
  
      <v-progress-linear
        bg-color="surface-variant"
        class="mb-6"
        color="primary"
        height="10"
        model-value="2"
        rounded="pill"
      />
  
      <div>$0 of $100 earned — 7 days left</div>
    </v-card-text>
  </v-card>
</template>

<script setup>
defineProps({
    project: Array
})

</script>