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
  components: { VFileUpload },
  theme: {
    defaultTheme: 'light', // or 'dark', depending on what you want
    themes: {
      light: {
        dark: false,
        colors: {
          background: '#FDFBFA',
          primary: '#7316E5',
          secondary: '#424242',
        },
      },
      dark: {
        dark: true,
        colors: {
          background: '#121212',
          primary: '#BB86FC',
          secondary: '#03DAC6',
        },
      },
    },
  },
})