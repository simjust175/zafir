/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'
import { VFileUpload } from 'vuetify/labs/VFileUpload'



// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  components: {
    VFileUpload,
  },
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: {
        dark: false,
        colors: {
          background: '#FFFFFF',
          'primary': '#7316E5FF',
          secondary: '#424242',
        },
      },
      dark: {
        dark: true,
        colors: {
          background: '#121212',
          'primary': '#BB86FC',
          secondary: '#03DAC6',
        },
      },
    },
  },
})
