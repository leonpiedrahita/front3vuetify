// Plugins
import vue from '@vitejs/plugin-vue'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// Utilities
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({ 
      template: { transformAssetUrls }
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
    vuetify({
      autoImport: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'TuApp',
        short_name: 'App',
        start_url: '/',
        display: 'standalone',
        theme_color: 'primary',
       icons: [
          { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icon-180x180.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  define: { 'process.env': {},
  __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true' },//puse esta linea para que dejara de salir el erro que traia ese nombre pero no se mas
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    port: 3000,
  },
  
})
