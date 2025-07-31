/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import vuetify from './vuetify'
import router from '@/router'
// import Toast from "vue-toastification";
// // Import the CSS or use your own!
// import "vue-toastification/dist/index.css";
// const options = {
//   // You can set your default options here
// };

export function registerPlugins (app) {
  app
    .use(vuetify)
    .use(router)
    // .use(Toast, options)
}
