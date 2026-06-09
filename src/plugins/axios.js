import axios from 'axios';
import jwtdecode from 'jwt-decode';

const apiUrl = import.meta.env.VITE_API_URL;

const MUTATION_METHODS = ['post', 'patch', 'put', 'delete'];

const axiosPlugin = {
  install: (app) => {
    const instance = axios.create();

    app.config.globalProperties.$axios = instance;

    // Verifica expiración del token ANTES de cualquier petición mutante.
    // Se añade al axios global para cubrir también los imports directos de axios.
    axios.interceptors.request.use(async config => {
      // No interceptar los endpoints de autenticación (evita bucles)
      if (config.url?.includes('/api/usuario/')) return config;
      if (!MUTATION_METHODS.includes(config.method?.toLowerCase())) return config;

      const store = app.config.globalProperties.$store;
      if (!store) return config;

      // Si ya hay un cierre de sesión en curso, cancelar silenciosamente
      if (store.state.sesionExpirando) return Promise.reject(new Error('SESION_EXPIRADA'));

      const exp = store.state.user?.exp;
      if (!exp || exp * 1000 >= Date.now()) return config; // token vigente

      // Token expirado — intentar renovar con el refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${apiUrl}api/usuario/refresh`, { refreshToken });
          store.commit('setToken', data.accessToken);
          store.commit('setUsuario', jwtdecode(data.accessToken));
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

          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            // Sin refresh token → redirige al login
            app.config.globalProperties.$store.dispatch('salir');
            return Promise.reject(error);
          }

          try {
            const { data } = await axios.post(`${apiUrl}api/usuario/refresh`, { refreshToken });

            // Actualiza el store con el nuevo access token
            const store = app.config.globalProperties.$store;
            store.commit('setToken', data.accessToken);
            store.commit('setUsuario', jwtdecode(data.accessToken));

            // Reintenta el request original con el nuevo token
            original.headers['token'] = data.accessToken;
            return instance(original);
          } catch (refreshError) {
            // El refresh token también es inválido/expirado → cierra sesión
            app.config.globalProperties.$store.dispatch('salir');
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  },
};

export default axiosPlugin;
