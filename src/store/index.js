import { createStore } from "vuex";
/* import { jwtdecode } from './modules'; */
import axios from 'axios';
import jwtdecode from 'jwt-decode';
import router from '../router'
const apiUrl = import.meta.env.VITE_API_URL

// Promesa compartida: evita que llamadas concurrentes a autoLogin (p.ej. varios
// guards de navegación disparados a la vez) hagan múltiples peticiones de refresh.
let autoLoginPromise = null;

const store = createStore({



    state: { //Creo las variables que son solo de lectura
        token: '',       // access token (solo en memoria, nunca en localStorage)
        user: '',
        existe: 0,
        ubicacion: '',
        icono: '',
        color: '',
        ruta: apiUrl,

        identificacion: "",
        ingreso: {},
        equipo: {},
        idorden: "",
        referenciaequipo: {},
        nuevareferencia: 0,
        detallesequipo: {},
        movimientosPendientes: 0,
        snackbarSesion: { visible: false, texto: '' },
        sesionExpirando: false,
        refreshCount: 0,
    },
    mutations: {//creo las mutaciones para cambiar el valor de las variables del estado
        setToken(state, token) {//con state accedo a las variables del estado y con el token accedo al valor que devolvio el back al momento de loguearme
            state.token = token;
        },
        setUsuario(state, usuario) {//usuario es donde vamos a tener el token decodificado
            state.user = usuario
        },
        setExistetoken(state, existe) {//Se define si existe el token o no
            state.existe = existe
        },
        
        setUbicacion(state, { ubicacion, icono, color }) {
            state.ubicacion = ubicacion
            state.icono = icono
            state.color = color
        },
        
        setIdentificacion(state, id) {
            state.identificacion = id
        },
        setOrdenesEquipo(state, ingreso) {
            state.ingreso = ingreso

        },
        

        setReferenciaEquipo(state, { referenciaequipo, nuevareferencia }) {
            state.referenciaequipo = referenciaequipo
            state.nuevareferencia = nuevareferencia

        },
    

        setDetallesEquipo(state, detallesequipo) {
            state.detallesequipo = detallesequipo
        },
        setMovimientosPendientes(state, count) {
            state.movimientosPendientes = count
        },
        setSnackbarSesion(state, payload) {
            state.snackbarSesion = payload;
        },
        setSesionExpirando(state, val) {
            state.sesionExpirando = val;
        },
        setRefreshCount(state, val) {
            state.refreshCount = val;
        },
        incrementRefreshCount(state) {
            state.refreshCount++;
        },
    },
    actions: {
        // Guarda el access token en estado (memoria) y el refresh token en localStorage
        guardarToken({ commit }, { accessToken, refreshToken }) {
            commit("setToken", accessToken);
            commit("setUsuario", jwtdecode(accessToken));
            commit("setExistetoken", 1);
            commit("setRefreshCount", 0);
            localStorage.setItem('refreshToken', refreshToken);
        },

        // Al reabrir la app: usa el refresh token para obtener un nuevo access token.
        // Las llamadas concurrentes comparten la misma Promise (un solo refresh).
        autoLogin({ commit, state }) {
            // Si ya hay token en Vuex (autenticado en esta sesión), no hacer nada
            if (state.token && state.existe === 1) {
                return true;
            }

            if (autoLoginPromise) return autoLoginPromise;

            autoLoginPromise = (async () => {
                const refreshToken = localStorage.getItem('refreshToken');

                if (!refreshToken) {
                    commit("setExistetoken", 0);
                    return false;
                }

                try {
                    const response = await fetch(`${apiUrl}api/usuario/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken }),
                    });

                    if (!response.ok) {
                        localStorage.removeItem('refreshToken');
                        commit("setExistetoken", 0);
                        return false;
                    }

                    const data = await response.json();
                    const accessToken = data.accessToken;
                    if (typeof accessToken !== 'string' || !accessToken) {
                        throw new Error('Respuesta de refresh inválida');
                    }
                    commit("setToken", accessToken);
                    commit("setUsuario", jwtdecode(accessToken));
                    commit("setExistetoken", 1);
                    commit("setRefreshCount", 0);
                    if (data.refreshToken) {
                        localStorage.setItem('refreshToken', data.refreshToken);
                    }
                    return true;
                } catch (error) {
                    // El refreshToken inválido ya fue descartado en el bloque !response.ok.
                    // Aquí solo llegamos por errores transitorios (red, JSON malformado,
                    // jwtdecode sobre un accessToken ausente) — conservar el refreshToken
                    // para que el usuario pueda reintentar.
                    console.error("Error en autoLogin:", error);
                    commit("setExistetoken", 0);
                    return false;
                }
            })().finally(() => {
                // .finally() externo: se ejecuta como microtask DESPUÉS de la
                // asignación (un finally interno correría antes en la ruta
                // síncrona sin refreshToken y dejaría cacheada la promesa).
                autoLoginPromise = null;
            });

            return autoLoginPromise;
        },

        async sesionExpirada({ commit, dispatch, state }) {
            if (state.sesionExpirando) return;
            commit('setSesionExpirando', true);
            commit('setSnackbarSesion', { visible: true, texto: 'Tu sesión ha expirado. Serás redirigido al inicio de sesión.' });
            setTimeout(() => dispatch('salir'), 2500);
        },

        async salir({ commit }) {
            const refreshToken = localStorage.getItem('refreshToken');
            try {
                if (refreshToken) {
                    await fetch(`${apiUrl}api/usuario/salir`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken }),
                    });
                }
            } catch (err) {
                console.error('Error al cerrar sesión en servidor:', err);
            } finally {
                commit("setToken", null);
                commit("setUsuario", null);
                commit("setRefreshCount", 0);
                localStorage.removeItem('refreshToken');
                router.push({ name: 'Login' });
            }
        },
       
        guardarUbicacion({ commit }, { ubicacion, icono, color }) {//el commit es algo que se recibe para confirmar las llamadas a mutaciones
            commit("setUbicacion", { ubicacion, icono, color });

        },
        guardarIdentificacion({ commit }, identificacion) {//el commit es algo que se recibe para confirmar las llamadas a mutaciones
            commit("setIdentificacion", identificacion.id);


        },
        guardarOrdenesEquipo({ commit }, ingreso) {//el commit es algo que se recibe para confirmar las llamadas a mutaciones
            commit("setOrdenesEquipo", ingreso);

        },
       

        guardarReferenciaEquipo({ commit }, { referenciaequipo, nuevareferencia }) {//el commit es algo que se recibe para confirmar las llamadas a mutaciones
            commit("setReferenciaEquipo", { referenciaequipo, nuevareferencia });

        },
        guardarDetallesEquipo({ commit }, detallesequipo) {
            commit("setDetallesEquipo", detallesequipo.detallesequipo);
        },

        async fetchMovimientosPendientes({ commit, state }) {
            const rol = state.user?.rol;
            if (!['administrador', 'bodega', 'soporte', 'aplicaciones', 'lumira', 'ingresos'].includes(rol)) return;
            try {
                // axios pasa por los interceptores globales: verifica vigencia del
                // token (y lo renueva o notifica sesión vencida) antes de la petición.
                const { data } = await axios.get(`${apiUrl}api/ingreso/movimientos/pendientes/count`);
                commit('setMovimientosPendientes', data.count);
            } catch (err) {
                console.warn('[store] No se pudo obtener movimientos pendientes:', err.message);
            }
        },
    },



})

export default store;