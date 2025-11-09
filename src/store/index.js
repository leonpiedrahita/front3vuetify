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

    if (!token) {
        // No hay token, forzamos el cierre de sesión/desactivamos el token
        commit("setExistetoken", 0);
        return false;
    }

    try {
        // Decodifica el token para obtener sus datos (payload)
        const payload = jwtdecode(token); 
        
        // Convertimos los timestamps de JWT (en segundos) a objetos Date (en milisegundos)
        const horaExpiracion = new Date(payload.exp * 1000);
        const horaActual = new Date();
        
        // Comprobación de la expiración:
        // Si la hora actual es MENOR que la hora de expiración, el token es VÁLIDO.
        if (horaActual < horaExpiracion) {
            
            // 2. Token Válido: Establece los datos de la sesión
            commit("setToken", token);
            commit("setUsuario", payload); // Usamos el payload decodificado
            commit("setExistetoken", 1);
            return true;
            
        } else {
            
            // 3. Token Expirado: Limpiamos la sesión
            localStorage.removeItem('token'); // Opcional pero recomendado
            commit("setExistetoken", 0);
            return false;
            
        }
    } catch (error) {
        // Captura errores si el token está malformado o es ilegible
        console.error("Error decodificando el token:", error);
        localStorage.removeItem('token');
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