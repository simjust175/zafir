<template>
  <div class="text-center">
    <v-select
      v-model="methodSelection"
      :items="menuItems"
      :label="$t(label[currentLanguage])"
      item-value="value"
      item-title="text"
    >
      <!-- Custom rendering of items -->
      <template #item="{ item, props }">
        <v-list-item v-bind="props">
          <v-list-item-title v-if="!item.isButton">
            {{ item.text }}
          </v-list-item-title>
          <div
            v-else
            class="d-flex align-center justify-space-between"
          >
            <span>{{ item.text }}</span>
            <v-btn
              small
              color="primary"
              @click.stop="handleButtonClick(item)"
            >
              {{ $t('Action') }}
            </v-btn>
          </div>
        </v-list-item>
      </template>
    </v-select>
  </div>
</template>


<script setup>
import { defineProps, computed, ref, defineEmits, watch } from "vue";

const props = defineProps({
  menuItems: Array,
  beforeUpdate: String,
  language: String
});

const currentLanguage = computed(() => props.language)
const label = ref({ en: "Select method", he: "בחירת קטגורייה" })
const methodSelection = ref(props.beforeUpdate ? props.beforeUpdate : label[currentLanguage.value]);
const emit = defineEmits(["methodSelect"]);

const handleButtonClick = (item) => {
  console.log("Button clicked for item:", item);
};

watch(methodSelection, (newValue) => {
  emit("methodSelect", newValue);
});

</script>
