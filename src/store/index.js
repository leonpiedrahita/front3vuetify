import { createStore } from "vuex";
/* import { jwtdecode } from './modules'; */
import jwtdecode from 'jwt-decode';
import router from '../router'
const apiUrl = import.meta.env.VITE_API_URL
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
        detallesequipo: {}
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


        }

    },
    actions: {
        // Guarda el access token en estado (memoria) y el refresh token en localStorage
        guardarToken({ commit }, { accessToken, refreshToken }) {
            commit("setToken", accessToken);
            commit("setUsuario", jwtdecode(accessToken));
            commit("setExistetoken", 1);
            localStorage.setItem('refreshToken', refreshToken);
        },

        // Al reabrir la app: usa el refresh token para obtener un nuevo access token
        async autoLogin({ commit, state }) {
            // Si ya hay token en Vuex (autenticado en esta sesión), no hacer nada
            if (state.token && state.existe === 1) {
                return true;
            }

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

                const { accessToken } = await response.json();
                commit("setToken", accessToken);
                commit("setUsuario", jwtdecode(accessToken));
                commit("setExistetoken", 1);
                return true;
            } catch (error) {
                console.error("Error en autoLogin:", error);
                localStorage.removeItem('refreshToken');
                commit("setExistetoken", 0);
                return false;
            }
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
        guardarDetallesEquipo({ commit }, detallesequipo) {//el commit es algo que se recibe para confirmar las llamadas a mutaciones
            commit("setDetallesEquipo", detallesequipo.detallesequipo);


        },


    },



})

export default store;