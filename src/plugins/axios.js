import axios from 'axios';
import jwtdecode from 'jwt-decode';

const apiUrl = import.meta.env.VITE_API_URL;

const MAX_REFRESH = 2;

// Promesa compartida: evita que peticiones concurrentes con token expirado
// disparen múltiples llamadas al endpoint de refresh simultáneamente.
let refreshPromise = null;

const axiosPlugin = {
  install: (app) => {
    const instance = axios.create({ timeout: 20000 });

    app.config.globalProperties.$axios = instance;

    const getStore = () => app.config.globalProperties.$store;

    // Helper único de refresh — cualquier llamada concurrente espera la misma Promise
    const doRefresh = () => {
      if (!refreshPromise) {
        const rt = localStorage.getItem('refreshToken');
        refreshPromise = axios
          .post(`${apiUrl}api/usuario/refresh`, { refreshToken: rt })
          .then(({ data }) => {
            const store = getStore();
            store.commit('setToken', data.accessToken);
            store.commit('setUsuario', jwtdecode(data.accessToken));
            store.commit('incrementRefreshCount');
            if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
            return data.accessToken;
          })
          .finally(() => { refreshPromise = null; });
      }
      return refreshPromise;
    };

    // Verifica expiración del token ANTES de cualquier petición (todos los métodos).
    // Renueva automáticamente el access token si expiró, hasta MAX_REFRESH veces por sesión.
    instance.interceptors.request.use(async config => {
      // No interceptar los endpoints de autenticación (evita bucles)
      if (config.url?.includes('/api/usuario/')) return config;

      const store = getStore();
      if (!store) return config;

      // Si ya hay un cierre de sesión en curso, cancelar silenciosamente
      if (store.state.sesionExpirando) return Promise.reject(new Error('SESION_EXPIRADA'));

      const exp = store.state.user?.exp;
      if (!exp || exp * 1000 >= Date.now()) return config; // token vigente

      // Token expirado — verificar límite de renovaciones
      if (store.state.refreshCount >= MAX_REFRESH) {
        store.dispatch('sesionExpirada');
        return Promise.reject(new Error('SESION_EXPIRADA'));
      }

      if (localStorage.getItem('refreshToken')) {
        try {
          const newToken = await doRefresh();
          config.headers['token'] = newToken;
          return config;
        } catch (refreshError) {
          // Refresh también expiró: continúa hacia sesionExpirada (feedback al usuario)
          if (import.meta.env.DEV) console.error('[API] Falló renovación de token:', refreshError);
        }
      }

      store.dispatch('sesionExpirada');
      return Promise.reject(new Error('SESION_EXPIRADA'));
    });

    // Interceptor de request: log de salida (solo en desarrollo)
    instance.interceptors.request.use(config => {
      if (import.meta.env.DEV) console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Interceptor de respuesta: log de resultado + renueva el access token automáticamente en 403
    instance.interceptors.response.use(
      response => {
        if (import.meta.env.DEV) {
          console.log(`[API] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        }
        return response;
      },
      async (error) => {
        if (import.meta.env.DEV) {
          const status = error.response?.status ?? 'ERR';
          const url = error.config?.url ?? '';
          const method = error.config?.method?.toUpperCase() ?? '';
          console.error(`[API] ${status} ${method} ${url}`, error.response?.data ?? error.message);
        }

        const original = error.config;

        // Solo actúa en 403 y evita bucles infinitos
        if (error.response?.status === 403 && !original._retry) {
          original._retry = true;

          const store = getStore();

          if (store.state.refreshCount >= MAX_REFRESH) {
            store.dispatch('sesionExpirada');
            return Promise.reject(error);
          }

          if (!localStorage.getItem('refreshToken')) {
            store.dispatch('salir');
            return Promise.reject(error);
          }

          try {
            const newToken = await doRefresh();
            original.headers['token'] = newToken;
            return instance(original);
          } catch (refreshError) {
            store.dispatch('salir');
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  },
};

export default axiosPlugin;
