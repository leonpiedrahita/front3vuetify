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
      },
      {
        path: '/misborradores',
        name: 'MisBorradores',
        component: () => import('../views/MisBorradores.vue'),
        meta: { auth: true },
      },
      {
        path: '/calendariopreventivos',
        name: 'CalendarioPreventivos',
        component: () => import('../views/CalendarioPreventivos.vue'),
        meta: { auth: true },
      },
      {
        path: '/importararchivos',
        name: 'ImportarArchivos',
        component: () => import('../views/ImportarArchivos.vue'),
        meta: { auth: true },
      },
      {
        path: '/permisos',
        name: 'Permisos',
        component: () => import('../views/Permisos.vue'),
        meta: { auth: true },
      },
      {
        path: '/bandeja-movimientos',
        name: 'BandejaMovimientos',
        component: () => import('../views/BandejaMovimientos.vue'),
        meta: { auth: true },
      },
      {
        path: '/listado-ubicaciones',
        name: 'ListadoUbicaciones',
        component: () => import('../views/ListadoUbicaciones.vue'),
        meta: { auth: true },
      }

    ]
  },
  {
    path: '/imprimirreporte',
    name: 'ImprimirReporte',
    component: () => import('../views/ImprimirReporte.vue'),
    meta: { public: true },
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

// Guard global: bloquea navegación a rutas con meta.auth sin sesión válida.
// El import es dinámico para evitar dependencia circular (store importa router).
router.beforeEach(async (to) => {
  if (!to.meta.auth) return true;

  const { default: store } = await import('../store');

  // Sin sesión activa en memoria: intentar recuperarla con el refresh token
  if (!store.state.token || store.state.existe !== 1) {
    const restaurada = await store.dispatch('autoLogin');
    if (!restaurada) return { name: 'Login' };
  }

  // Access token vencido y sin refresh token disponible: sesión expirada
  const exp = store.state.user?.exp;
  if (exp && exp * 1000 < Date.now() && !localStorage.getItem('refreshToken')) {
    store.dispatch('sesionExpirada');
    return { name: 'Login' };
  }

  return true;
});

export default router
