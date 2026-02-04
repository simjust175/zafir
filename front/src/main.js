/**
 * main.js
 * Enterprise Invoice Management - Billio
 */

import '@/styles/global.scss'

import { registerPlugins } from '@/plugins'
import App from './App.vue'
import VueApexCharts from "vue3-apexcharts"
import { createPinia } from "pinia"
import piniaPluginPersistedState from "pinia-plugin-persistedstate"

import { createApp } from 'vue'

const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedState)

app.use(pinia)
app.use(VueApexCharts)

registerPlugins(app)

app.mount('#app')
