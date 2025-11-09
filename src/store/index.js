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
                const iniciotoken = new Date(jwtdecode(token).iat * 1000);
                const finaltoken = new Date(jwtdecode(token).exp * 1000);
                const horaactual = new Date();
                const restatoken = horaactual - iniciotoken
                /*                 console.log(finaltoken)
                                console.log(iniciotoken)
                                console.log(horaactual)
                                console.log(restatoken) */
                if (restatoken < 1800000) {
                    commit("setToken", token);
                    commit("setUsuario", jwtdecode(token));
                    commit("setExistetoken", 1);
                } else {
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
            localStorage.removeItem('token');
            router.push({ name: 'Login' });
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