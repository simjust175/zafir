/**
 * main.js
 * Enterprise Invoice Management - Billio
 */

import '@/styles/global.scss'

import { registerPlugins } from '@/plugins'
import App from './App.vue'
import { createPinia } from "pinia"
import piniaPluginPersistedState from "pinia-plugin-persistedstate"

import { createApp } from 'vue'

const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedState)

app.use(pinia)

registerPlugins(app)

app.mount('#app')
