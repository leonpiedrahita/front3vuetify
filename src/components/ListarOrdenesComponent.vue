<template>
    <v-card class="pa-2 mt-15 ">
        <v-data-table :headers="headers" :items="ordenes" :search="search" class="elevation-1" :loading="cargando"
            loading-text="Cargando ... por favor espere">
            <template v-slot:top>
                
                <v-toolbar flat>
                    
          <v-row justify="space-around">
            <v-col cols="6" sm="5">
              <v-text-field v-model="search" append-icon="mdi-magnify" label="Buscar: Equipo/Serie/Cliente/Estado"
                single-line hide-details></v-text-field>
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
        headers: [
            {
                text: "Nombre del dispositivo",
                value: "equipo.nombre",
                align: "center",
            },
            { text: "Número de serie", value: "equipo.serie", align: "center" },
            {
                text: "Cliente asignado",
                align: "center",
                value: "equipo.cliente.nombre",
            },
            {
                text: "Estado",
                align: "center",
                value: "estado",
                divider: true,
            },

            {
                text: "Ver / Editar",
                value: "crear",
                sortable: false,
                align: "center",
            },
        ],
    }),

    methods: {
        listar() {
            //va a ir a mi backend y me traerá las peticiones de la base de datos
            axios
                .get(this.$store.state.ruta + "api/orden/listar")
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
                idorden: this.ordenseleccionada._id
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
            ubicacion: "Ordenes de servicio",
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