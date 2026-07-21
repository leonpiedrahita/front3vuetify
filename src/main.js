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
import { traducirEtiqueta } from './utils/etiquetas'
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

// Helper global de presentación: traduce etiquetas de flujo interno según el
// toggle admin y el rol del usuario. Uso en plantillas: {{ $etiqueta(valor) }}
app.config.globalProperties.$etiqueta = (texto) =>
  traducirEtiqueta(texto, store.getters.aplicaEtiquetasAlternativas);

app.mount('#app')
