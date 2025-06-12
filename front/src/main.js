/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'
import VueApexCharts from "vue3-apexcharts";
import store from "./storage";
// main.js



// Composables
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'
import { createI18n, useI18n } from 'vue-i18n'
//import { en, he } from 'vuetify/locale'
import en from '@/Locals/en.json'
import he from '@/Locals/he.json'

const messages = {
  en: {
    $vuetify: {
      ...en,
      dataIterator: {
        rowsPerPageText: 'Items per page:',
        pageText: '{0}-{1} of {2}',
      },
    },
    ...en
  },
  he: {
    $vuetify: {
      ...he,
      dataIterator: {
        rowsPerPageText: 'Element per sida:',
        pageText: '{0}-{1} av {2}',
      },
    },
    ...he
  },
}

const i18n = createI18n({
  legacy: false, // Vuetify does not support the legacy mode of vue-i18n
  locale: 'en',
  fallbackLocale: 'en',
  messages,
})

const vuetify = createVuetify({
  locale: {
    adapter: createVueI18nAdapter({ i18n, useI18n }),
  },
})

const app = createApp(App)

registerPlugins(app)

app.use(store)
app.use(VueApexCharts);
app.use(i18n)
app.use(vuetify)
app.component("apexchart", VueApexCharts);
app.mount('#app')






