<template>
    <v-card class="pa-2 ">
        <v-data-table :headers="encabezado" :items="ordenes" :search="search" class="elevation-1" :loading="cargando"
            loading-text="Cargando ... por favor espere">
            <template v-slot:top>

                <v-toolbar flat>

                    <v-row justify="space-around">
                        <v-col cols="6" sm="5">
                            <v-text-field v-model="search" append-icon="mdi-magnify"
                                label="Buscar: Equipo/Serie/Cliente/Estado" single-line hide-details></v-text-field>
                        </v-col>


                    </v-row>
                </v-toolbar>
            </template>
            <template v-slot:[`item.crear`]="{ item }">
                <v-icon medium @click="abrirOrden(item)">
                    mdi-vector-polyline-edit
                </v-icon>
            </template>
        </v-data-table>
        
    </v-card>
   <!--  <pre>{{ ordenes }}</pre> -->
</template>

<script>
import axios from "axios";
export default {
    name: "ListarOrdenesComponent",
    components: {},
    data: () => ({
        cargando: true,
        ordenes: [],
        search: "",
        ordenseleccionada: {},
        encabezado: [
            {
                title: "Nombre del equipo",
                key: "equipo.nombre",
                align: "center",
            },
            { title: "Número de serie", value: "equipo.serie", align: "center" },
            {
                title: "Cliente asignado",
                align: "center",
                key: "equipo.cliente.nombre",
            },
            {
                title: "Estado",
                align: "center",
                key: "estado",
                divider: true,
            },

            {
                title: "Ver / Editar",
                key: "crear",
                sortable: false,
                align: "center",
            },
        ],
    }),

    methods: {
        listar() {
            //va a ir a mi backend y me traerá las peticiones de la base de datos
            axios
                .get(this.$store.state.ruta + "api/ingreso/ingresos",
                {
              headers: {
                token: this.$store.state.token,
              },
            }
                )
                .then((response) => {
                    this.ordenes = response.data; //el this es porque no es propia de la funcion sino de l componente
                    this.cargando = false
                })
                .catch((error) => {
                    //console.log(error);
                    return error;
                });
        },
        abrirOrden(item) {
            this.ordenseleccionada = Object.assign({}, item);
            this.$store.dispatch("guardarOrdenesEquipo", {
                ordenes: this.ordenseleccionada,
                equipo: this.ordenseleccionada.equipo,
                idorden: this.ordenseleccionada.id
            });
            this.$router.push({ name: "Pasos" })
        }
    },
    beforeCreate() {
        this.$store.dispatch("autoLogin");
        if (this.$store.state.existe === 0) {
            this.$router.push({ name: "Login" });
        }
        this.$store.dispatch("guardarUbicacion", {
            ubicacion: "Lista de ingresos",
            icono: "mdi-vector-circle",
            color: "c6",
        });
    },
    created() {
        this.listar();
    },
};
</script>

<style></style>