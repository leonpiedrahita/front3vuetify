/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from './App.vue'
import store from './store'
import permission from '../src/directives/permissions.js';
import axiosPlugin from './plugins/axios'
import router from './router'
import { VueSignaturePad } from "vue-signature-pad";




// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

const app = createApp(App)

registerPlugins(app)
app.use(store);
app.directive('permission', permission);
app.use(router);

app.use(axiosPlugin);
app.component("VueSignaturePad", VueSignaturePad);

app.mount('#app')
