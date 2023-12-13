/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from './App.vue'
import store from './store'
import axiosPlugin from './plugins/axios';
// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

const app = createApp(App)

registerPlugins(app)
app.use(store);
app.use(axiosPlugin);
app.mount('#app')
