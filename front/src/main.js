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
import { createPinia } from "pinia";
import piniaPluginPersistedState from "pinia-plugin-persistedstate"
// main.js



// Composables
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'


const vuetify = createVuetify({
    theme: {
        defaultTheme: 'light', // 'light' | 'dark' | 'system'
      },
})

const app = createApp(App)
const pinia = createPinia()

registerPlugins(app)

pinia.use(piniaPluginPersistedState)

app.use(pinia)
app.use(VueApexCharts);
app.use(vuetify)
app.component("apexchart", VueApexCharts);
app.mount('#app')






