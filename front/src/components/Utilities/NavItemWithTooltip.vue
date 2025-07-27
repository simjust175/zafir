<template>
  <v-tooltip
    v-if="rail"
    location="right"
    open-delay="300"
  >
    <template #activator="{ props }">
      <v-list-item
        v-bind="{ ...props, ...$attrs }"
        :prepend-icon="prependIcon"
        :title="title"
      />
    </template>
    <span>{{ title }}</span>
  </v-tooltip>

  <v-list-item
    v-else
    :prepend-icon="prependIcon"
    v-bind="$attrs"
    :title="title"
    class="rounded-e-xl"
  />
</template>

<script setup>
defineProps({
  title: String,
  rail: Boolean,
  prependIcon: String
});
</script>