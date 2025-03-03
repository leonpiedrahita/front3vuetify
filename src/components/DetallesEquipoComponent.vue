<template>
  <v-card class="pa-2 mt-15 ">
    <v-card-title class="text-center"  >Informacion del equipo</v-card-title>
    <v-row justify="center">
      <v-card-title>
        <v-card title="Nombre del Analizador" variant="flat">
          <v-card-text>
            <v-toolbar-title>
              {{ equipo.nombre }}
            </v-toolbar-title>
          </v-card-text>
        </v-card>
      </v-card-title>
      <v-card-title>
        <v-card title="Numero de serie" variant="flat">
          <v-card-text>
            <v-toolbar-title>
              {{ equipo.serie }}
            </v-toolbar-title>
          </v-card-text>
        </v-card>
      </v-card-title>
      <v-card-title>
        <v-card title="Tipo de contrato" variant="flat">
          <v-card-text>
            <v-toolbar-title>
              {{ equipo.tipodecontrato }}
            </v-toolbar-title>
          </v-card-text>
        </v-card>
      </v-card-title>
      <v-divider class="mb-5 mt-5"></v-divider>
    </v-row>


    <v-card-title class="text-center">Informacion del propietario</v-card-title>

    <v-row justify="center">
      <v-card-title>
        <v-card title="Nombre/Razón social" variant="flat">
          <v-card-text>
            <v-toolbar-title>
              {{ equipo.propietario.nombre }}
            </v-toolbar-title>
          </v-card-text>
        </v-card>
      </v-card-title>
      <v-card-title>
        <v-card title="Identificación" variant="flat">
          <v-card-text>
            <v-toolbar-title>
              {{ equipo.propietario.nit }}
            </v-toolbar-title>
          </v-card-text>
        </v-card>
      </v-card-title>
      <v-card-title>
        <v-card title="Dirección" variant="flat">
          <v-card-text>
            <v-toolbar-title>
              {{ equipo.ubicaciondireccion }}
            </v-toolbar-title>
          </v-card-text>
        </v-card>
      </v-card-title>

    </v-row>
    <v-divider class="mb-5 mt-5"></v-divider>
    <v-card-title class="text-center">Informacion del cliente</v-card-title>
    <v-row justify="center">
      <v-card-title>
        <v-card title="Nombre/Razón social" variant="flat">
          <v-card-text>
            <v-toolbar-title>
              {{ equipo.cliente.nombre }}
            </v-toolbar-title>
          </v-card-text>
        </v-card>
      </v-card-title>
      <v-card-title>
        <v-card title="Identificación" variant="flat">
          <v-card-text>
            <v-toolbar-title>
              {{ equipo.cliente.nit }}
            </v-toolbar-title>
          </v-card-text>
        </v-card>
      </v-card-title>

    </v-row>
    <v-row>
    <!-- se crea la data table prinecipal para listar los clientes -->
    <v-data-table :headers="headers" :items="historial"  
       class="elevation-1" 
      loading-text="Cargando ... por favor espere">
      <template v-slot:[`item.agregarsede`]="{ item }">
        <div>
          <v-icon style="margin-left: 10px" medium @click="imprimirReporte(item)">
            mdi-printer
          </v-icon>
        </div>
      </template>
    </v-data-table>
    </v-row>


  </v-card>
  
</template>
<script>
export default {
  name: "DetallesEquipoComponent",

  data: () => ({
    equipo: [],
    historial: [],
    reporte: {
      
    },
    headers: [
      {
        title: "Fecha de ejecución",
        key: "fechadefinalizacion",
        align: "center",
        
      },
    {
        title: "Tipo de soporte",
        key: "tipodeasistecia",
        align: "center",
        
      },
      {
        title: "Imprimir",
        value: "agregarsede",
        sortable: false,
        align: "center",
        
      },
      
    ],
    items: [     
      
      
    ],
  }),

  computed: {},
  created() {
    this.equipo = this.$store.state.detallesequipo;
    this.historial = this.equipo.historialdeservicios;
  },
  beforeCreate() {
    this.$store.dispatch("autoLogin");
    if (this.$store.state.existe === 0) {
      this.$router.push({ name: "Login" });
    }
    this.$store.dispatch("guardarUbicacion", {
      ubicacion: "Detalles Equipo",
      icono: "mdi-amplifier",
      color: "c6",
    });
  },
  methods: {

  imprimirReporte(item) {

  this.reporte = Object.assign({}, item);
  console.log("reporte",this.reporte.identificaciondereporte)
  console.log(typeof(this.reporte.identificaciondereporte))
  localStorage.setItem("idreporte", this.reporte.identificaciondereporte);
  const nuevaVentanaURL = this.$router.resolve({ name: 'ImprimirReporte' }).href;
          window.open(nuevaVentanaURL, '_blank',"width=800,height=600");
},
  },
};
</script>

<style scoped></style>