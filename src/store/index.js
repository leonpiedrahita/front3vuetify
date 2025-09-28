import { createStore } from "vuex";
/* import { jwtdecode } from './modules'; */
import jwtdecode from 'jwt-decode';
import router from '../router'
const apiUrl = import.meta.env.VITE_API_URL
const store = createStore({


    state: { //Creo las variables que son solo de lectura
        token: '',
        user: '',
        existe: 0,
        ubicacion: '',
        icono: '',
        color: '',
        ruta: apiUrl,

        identificacion: "",
        ordenes: {},
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
        setOrdenesEquipo(state, { ordenes, equipo, idorden }) {
            state.ordenes = ordenes
            state.equipo = equipo
            state.idorden = idorden
        },
        setReferenciaEquipo(state, { referenciaequipo, nuevareferencia }) {
            state.referenciaequipo = referenciaequipo
            state.nuevareferencia = nuevareferencia

        },
        setDetallesEquipo(state, detallesequipo) {
            state.detallesequipo = detallesequipo


        }

    },
    actions: {//Las acciones hacen los llamados a las mutaciones
        guardarToken({ commit }, token) {//el commit es algo que se recibe para confirmar las llamadas a mutaciones
            commit("setToken", token);
            commit("setUsuario", jwtdecode(token));
            localStorage.setItem('token', token);
        },
        autoLogin({ commit }) {
            // 1. Obtiene el token
            const token = localStorage.getItem('token');

            if (token) {
                try {
                    // 2. Decodifica el token
                    const decodedToken = jwtdecode(token);

                    // 3. Obtiene la hora de expiración (exp) y la hora actual
                    // El tiempo en JWT (exp) está en segundos (Unix time), se multiplica por 1000 para milisegundos
                    const expirationTime = decodedToken.exp * 1000;
                    const currentTime = new Date().getTime();

                    // 4. Verificación ESTÁNDAR de JWT: La hora actual debe ser MENOR que la hora de expiración
                    if (currentTime < expirationTime) {
                        // Token VÁLIDO (no ha expirado)
                        commit("setToken", token);
                        commit("setUsuario", decodedToken);
                        commit("setExistetoken", 1);
                        return true;
                    } else {
                        // Token EXPIRADO
                        console.log("Token ha expirado. Limpiando almacenamiento.");
                        localStorage.removeItem('token'); // Es buena práctica eliminar el token expirado
                        commit("setExistetoken", 0);
                        return false;
                    }
                } catch (error) {
                    // Maneja el caso en que el token esté corrupto o sea inválido y no se pueda decodificar
                    console.error("Error al decodificar el token, es inválido:", error);
                    localStorage.removeItem('token'); // Elimina el token inválido
                    commit("setExistetoken", 0);
                    return false;
                }

            } else {
                // No hay token en localStorage
                commit("setExistetoken", 0);
                return false;
            }
        },
        salir({ commit }) {//para borrar los datos y devolver el usuario a Home
            commit("setToken", null);
            commit("setUsuario", null);
            localStorage.removeItem('token');
            router.push({ name: 'Login' });
        },
        guardarUbicacion({ commit }, { ubicacion, icono, color }) {//el commit es algo que se recibe para confirmar las llamadas a mutaciones
            commit("setUbicacion", { ubicacion, icono, color });

        },
        guardarIdentificacion({ commit }, identificacion) {//el commit es algo que se recibe para confirmar las llamadas a mutaciones
            commit("setIdentificacion", identificacion.id);

        },
        guardarOrdenesEquipo({ commit }, { ordenes, equipo, idorden }) {//el commit es algo que se recibe para confirmar las llamadas a mutaciones
            commit("setOrdenesEquipo", { ordenes, equipo, idorden });

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