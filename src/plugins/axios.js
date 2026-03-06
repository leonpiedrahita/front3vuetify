import axios from 'axios';
import jwtdecode from 'jwt-decode';

const apiUrl = import.meta.env.VITE_API_URL;

const axiosPlugin = {
  install: (app) => {
    const instance = axios.create();

    app.config.globalProperties.$axios = instance;

    // Interceptor de respuesta: renueva el access token automáticamente en 403
    instance.interceptors.response.use(
      response => response,
      async (error) => {
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
