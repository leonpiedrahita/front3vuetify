import axios from 'axios';
import jwtdecode from 'jwt-decode';

const apiUrl = import.meta.env.VITE_API_URL;

const MAX_REFRESH = 2;

const axiosPlugin = {
  install: (app) => {
    const instance = axios.create();

    app.config.globalProperties.$axios = instance;

    // Verifica expiración del token ANTES de cualquier petición (todos los métodos).
    // Renueva automáticamente el access token si expiró, hasta MAX_REFRESH veces por sesión.
    axios.interceptors.request.use(async config => {
      // No interceptar los endpoints de autenticación (evita bucles)
      if (config.url?.includes('/api/usuario/')) return config;

      const store = app.config.globalProperties.$store;
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

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${apiUrl}api/usuario/refresh`, { refreshToken });
          store.commit('setToken', data.accessToken);
          store.commit('setUsuario', jwtdecode(data.accessToken));
          store.commit('incrementRefreshCount');
          config.headers['token'] = data.accessToken;
          return config;
        } catch { /* refresh también expiró */ }
      }

      store.dispatch('sesionExpirada');
      return Promise.reject(new Error('SESION_EXPIRADA'));
    });

    // Interceptor de request: log de salida
    instance.interceptors.request.use(config => {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Interceptor de respuesta: log de resultado + renueva el access token automáticamente en 403
    instance.interceptors.response.use(
      response => {
        console.log(`[API] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        return response;
      },
      async (error) => {
        const status = error.response?.status ?? 'ERR';
        const url = error.config?.url ?? '';
        const method = error.config?.method?.toUpperCase() ?? '';
        console.error(`[API] ${status} ${method} ${url}`, error.response?.data ?? error.message);

        const original = error.config;

        // Solo actúa en 403 y evita bucles infinitos
        if (error.response?.status === 403 && !original._retry) {
          original._retry = true;

          const store = app.config.globalProperties.$store;

          if (store.state.refreshCount >= MAX_REFRESH) {
            store.dispatch('sesionExpirada');
            return Promise.reject(error);
          }

          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            store.dispatch('salir');
            return Promise.reject(error);
          }

          try {
            const { data } = await axios.post(`${apiUrl}api/usuario/refresh`, { refreshToken });

            store.commit('setToken', data.accessToken);
            store.commit('setUsuario', jwtdecode(data.accessToken));
            store.commit('incrementRefreshCount');

            original.headers['token'] = data.accessToken;
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
