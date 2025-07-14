<template>
  <v-card
    class="pa-2"
    theme="light"
  >
    <div class="d-flex flex-column fill-height">
      <v-tabs
        v-model="tab"
        class="bg-white"
        hide-slider
        stacked
        grow
      >
        <v-tab
          value="1"
          :class="{ 'bg-grey-lighten-3': tab == 1 }"
          :ripple="false"
        >
          <v-icon icon="mdi mdi-hand-coin-outline" />
          {{ $t('charity') }}
        </v-tab>

        <v-tab
          value="2"
          :class="{ 'bg-grey-lighten-3': tab == 2 }"
          :ripple="false"
        >
          <v-icon icon="mdi mdi-finance" />
          {{ $t('income') }}
        </v-tab>

        <v-tab
          value="3"
          :class="{ 'bg-grey-lighten-3': tab == 3 }"
          :ripple="false"
        >
          <v-icon icon="mdi mdi-chevron-triple-down" />
          {{ $t('expense') }}
        </v-tab>
      </v-tabs>

      <v-tabs-window
        v-model="tab"
        class="fill-height"
      >
        <v-tabs-window-item value="1">
          <main-form-text-field
            input-method="charity"
            v-bind="$attrs"
            :language="language"
          />
        </v-tabs-window-item>

        <v-tabs-window-item value="2">
          <main-form-text-field
            input-method="income"
            v-bind="$attrs"
            :language="language"
          />
        </v-tabs-window-item>

        <v-tabs-window-item value="3">
          <main-form-text-field
            input-method="expense"
            v-bind="$attrs"
            :language="language"
          />
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
  </v-card>
</template>

<script>
import MainFormTextField from './MainFormTextField.vue'
export default {
    components: { MainFormTextField },
    props: {
        language: String
    },
    data() {
        return {
            tab: null
        }
    },
}
</script>

<style></style>