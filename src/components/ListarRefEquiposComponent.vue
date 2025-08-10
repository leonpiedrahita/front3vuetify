<template>
  <v-card class="pa-2">
    <v-data-table :headers="headers" :items="referencias" :search="search" class="elevation-1" :loading="cargando"
      loading-text="Cargando ... por favor espere" hide-default-footer  disable-pagination>
      <template v-slot:top>
        <v-toolbar flat>
          <v-row justify="space-around">

            <v-col cols="6" sm="5">
              <v-text-field v-model="search" append-icon="mdi-magnify" label="Buscar: Nombre/Marca/Servicio" single-line
                hide-details></v-text-field>
            </v-col>

            <v-col cols="6" sm="2">

              <v-btn v-permission="['administrador', 'calidad']" color="c6" min-width="228" size="large"
                variant="flat" large @click="nuevoEquipo()">
                Nueva referencia
              </v-btn>

            </v-col>

          </v-row>
        </v-toolbar>
      </template>
      <template v-slot:[`item.crear`]="{ item }">
        <v-icon medium @click="abrirOrden(item)">

          mdi-file-document-edit-outline
        </v-icon>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import axios from "axios";
export default {
  name: "ListarRefEquiposComponent",
  components: {},
  data: () => ({
    cargando: true,
    referencias: [],
    search: "",
    referenciaseleccionada: {},
    headers: [
      {
        title: "Nombre del equipo",
        value: "nombre",
        align: "center",
      },
      { title: "Marca", value: "marca", align: "center" },
      {
        title: "Servicio",
        align: "center",
        value: "servicio",
      },
      {
        title: "Riesgo",
        align: "center",
        value: "clasificacionriesgo",
        divider: true,
      },

      {
        title: "Ver / Editar",
        value: "crear",
        sortable: false,
        align: "center",
      },
    ],
    referenciaenblanco: {
      nombre: "",
      marca: "",
      fabricante: "",
      servicio: "",
      clasificacionriesgo: "",
      periodicidadmantenimiento: "",
      alto: "",
      ancho: "",
      profundo: "",
      peso: "",
      voltaje: "",
      corriente: "",
      potencia: "",
      principiodemedicion: "",
      pruebasporhora: "",
      temperatura: "",
      humedad: "",
      agua: "",
      desague: "",
      recomendaciones: "",
    },
  }),

  methods: {
    listar() {
      //va a ir a mi backend y me traerá las peticiones de la base de datos
      axios
        .get(this.$store.state.ruta + "api/refequipo/listar",
          {
            headers: {
              token: this.$store.state.token,
            },
          }
        )
        .then((response) => {
          this.referencias = response.data; //el this es porque no es propia de la funcion sino de l componente
          this.cargando = false
        })
        .catch((error) => {
          //console.log(error);
          return error;
        });
    },
    abrirOrden(item) {
      this.referenciaseleccionada = Object.assign({}, item);
      this.$store.dispatch("guardarReferenciaEquipo", {
        referenciaequipo: this.referenciaseleccionada,
        nuevareferencia: 0,
      });
      this.$router.push({ name: "FormularioRefEquipos" })
    },
    nuevoEquipo() {

      this.$store.dispatch("guardarReferenciaEquipo", {
        referenciaequipo: this.referenciaenblanco,
        nuevareferencia: 1,
      });
      this.$router.push({ name: "FormularioRefEquipos" })
    }
  },
  beforeCreate() {
    this.$store.dispatch("autoLogin");
    if (this.$store.state.existe === 0) {
      this.$router.push({ name: "Login" });
    }
    this.$store.dispatch("guardarUbicacion", {
      ubicacion: "Referencias de Equipos",
      icono: "mdi-amplifier",
      color: "c6",
    });
  },
  created() {
    this.listar();
  },
};
</script>

<style>
button.disabled {
  cursor: not-allowed;
  opacity: 0.5;
  pointer-events: none;
  /* Evita cualquier interacción del usuario */
}
</style>