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

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#52B69A',
          secondary: '#fcc16b',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
          titulo:'#000000',
          //Colores personalizados
          c0:'#000000',
          c1:'#F36938',
          c2:'#E65C2B',
          c3:'#7E543E',
          c4:'#10474E',
          c5:'#8FD3F6',
          c6:'#52B69A',
          c7:'#C0EADE',
          c8:'#CBE2F2',
          c9:'#FCB247',
        },
       
          
        
      },
    },
  },
})
