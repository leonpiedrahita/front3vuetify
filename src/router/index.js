// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  
  {//creo un nuevo componente a partir de su ruta
    path: '/login',
    name: 'Login',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "segura" */ '@/views/Login.vue'),
    meta: {
      public: true
    },
  },

  {
    path: '/segura',
    name: 'Segura',
    component: () => import(/* webpackChunkName: "listarclientes" */ '../views/Segura.vue'),
    meta: {
      auth: true
    },
    children: [
      {
        path: '/listarclientes',
        name: 'ListarClientes',
        component: () => import(/* webpackChunkName: "listarclientes" */ '../views/ListarClientes.vue'),
        meta: {
          auth: true
        }
      },
      {
        path: '/listarequipos',
        name: 'ListarEquipos',
        component: () => import(/* webpackChunkName: "listarclientes" */ '../views/ListarEquipos.vue'),
        meta: {
          auth: true
        }
      },
      {
        path: '/formulariogenerarorden',
        name: 'FormularioGenerarOrden',
        component: () => import(/* webpackChunkName: "formulariogenerarorden" */ '../views/FormularioGenerarOrden.vue'),
        meta: {
          auth: true
        }
      },
      {
        path: '/firma',
        name: 'Firma',
        component: () => import(/* webpackChunkName: "firma" */ '../views/Firma.vue'),
        meta: {
          auth: true
        }
      },
      {
        path: '/detallesequipo',
        name: 'DetallesEquipo',
        component: () => import(/* webpackChunkName: "detallesequipo" */ '../views/DetallesEquipo.vue'),
        meta: {
          public: true
        },
      },
      {
        path: '/listarrefequipos',
        name: 'ListarRefEquipos',
        component: () => import(/* webpackChunkName: "listarrefequipos" */ '../views/ListarRefEquipos.vue'),
        meta: {
          public: true
        },
      },
      {
        path: '/listarordenes',
        name: 'ListarOrdenes',
        component: () => import(/* webpackChunkName: "listarrefequipos" */ '../views/ListarOrdenes.vue'),
        meta: {
          public: true
        },
      },
      {
        path: '/pasos',
        name: 'Pasos',
        component: () => import(/* webpackChunkName: "listarrefequipos" */ '../views/Pasos.vue'),
        meta: {
          public: true
        },
      },
      {
        path: '/formulariorefequipos',
        name: 'FormularioRefEquipos',
        component: () => import(/* webpackChunkName: "formulariogenerarorden" */ '../views/FormularioRefEquipos.vue'),
        meta: {
          auth: true
        }
      },
      {
        path: '/imprimirreporte',
        name: 'ImprimirReporte',
        component: () => import(/* webpackChunkName: "formulariogenerarorden" */ '../views/ImprimirReporte.vue'),
        meta: {
          auth: true
        },

        props: true,
      },
      {
        path: '/adminusuarios',
        name: 'AdministracionUsuarios',
        component: () => import(/* webpackChunkName: "formulariogenerarorden" */ '../views/AdministracionUsuarios.vue'),
        meta: {
          auth: true
        },

        props: true,
      },
      {
        path: '/seguimientoingresos',
        name: 'SeguimientoIngresos',
        component: () => import(/* webpackChunkName: "formulariogenerarorden" */ '../views/SeguimientoIngresos.vue'),
        meta: {
          auth: true
        },

        props: true,
      }

    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'ListarEquipos' },
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
