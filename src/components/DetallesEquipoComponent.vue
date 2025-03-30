<template>
  <v-card id="vcard-imprimir" class="pa-2 mt-15 ">
    <v-row justify="end">
      <v-col cols="4" class="d-flex justify-end">
        <v-btn color="primary" class="ma-3 tabla-normal" @click="imprimirVCard">
          <v-icon left class="mr-2">mdi-printer</v-icon>
          Imprimir hoja de vida
        </v-btn>
      </v-col>
    </v-row>
    <v-card-title class="text-center" id="tamanotitulo">Informacion del equipo</v-card-title>
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


    <v-card-title class="text-center" id="tamanotitulo">Informacion del propietario</v-card-title>

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
    <v-card-title class="text-center" id="tamanotitulo">Informacion del cliente</v-card-title>
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
      <v-divider class="mb-5 mt-5"></v-divider>
    </v-row>
    <v-row>
      <!-- se crea la data table prinecipal para listar los clientes -->
      <v-data-table :headers="headers" :items="historial" class="tabla-normal elevation-1"
        loading-text="Cargando ... por favor espere">
        <template v-slot:[`item.agregarsede`]="{ item }">
          <div class="columna-imprimir">
            <div>
              <v-icon style="margin-left: 10px" medium @click="imprimirReporte(item)">
                mdi-printer
              </v-icon>
            </div>
          </div>
        </template>
      </v-data-table>
<!-- Tabla HTML (solo para impresión) -->
<table class="tabla-imprimir">
    <thead>
      <tr>
        <th>Fecha de ejecución</th>
        <th>Tipo de soporte</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in historial" :key="index">
        <td>{{ item.fechadefinalizacion }}</td>
        <td>{{ item.tipodeasistecia }}</td>
      </tr>
    </tbody>
  </table>
      
    </v-row>


  </v-card>


</template>
<script>
import axios from "axios";
export default {

  name: "DetallesEquipoComponent",

  data: () => ({
    equipo: [],
    historial: [],
    url: '',
    error: '',
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
        class: "columna-imprimir"
      },

    ],
    headersimpresion: [
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
      console.log("reporte", this.reporte.identificaciondereporte)
      console.log(typeof (this.reporte.identificaciondereporte))
      if (this.reporte.reporteexterno === 0) {
        localStorage.setItem("idreporte", this.reporte.identificaciondereporte);
        const nuevaVentanaURL = this.$router.resolve({ name: 'ImprimirReporte' }).href;
        window.open(nuevaVentanaURL, '_blank', "width=800,height=600");
      }
      else if (this.reporte.reporteexterno === 1) {
        console.log('llavereporte', this.reporte.llavereporte)
        axios.post(
          this.$store.state.ruta + 'api/s3/buscarurl',
          {
            fileKey: this.reporte.llavereporte

          },
          {
            headers: {
              token: this.$store.state.token,
            },
          }
        )
          .then((response) => {
            // Capturar la URL de la respuesta
            this.url = response.data.url;
            this.error = '';
            console.log('URL', this.url)
            // Abrir la URL en una nueva pestaña
            window.open(this.url, '_blank');
          })
          .catch((error) => {
            this.error = error.response ? error.response.data.error : 'Error al realizar la solicitud';
            this.url = '';
            console.log(error);
          });


      }


    },

    imprimirVCard() {
      const contenido = document.getElementById("vcard-imprimir").innerHTML;
      const estilo = document.head.innerHTML; // Obtiene los estilos actuales

      const ventana = window.open("", "_blank", "width=800,height=600");
      ventana.document.write(`
    <html>
      <head>
        <title>Imprimir Información</title>
        ${estilo}  <!-- Inserta los estilos actuales -->
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .v-card { box-shadow: none; }
        </style>
      </head>
      <body>${contenido}</body>
    </html>
  `);
      ventana.document.close();

      // Espera un poco para asegurarse de que los estilos se apliquen antes de imprimir
      setTimeout(() => {
        ventana.print();
        ventana.close();
      }, 500);
    }
  },
};
</script>

<style scoped>
/* Ocultar la tabla de impresión en vista normal */
.tabla-imprimir {
  display: none;
  width: 100%;
  border-collapse: collapse;
}

.tabla-imprimir th, .tabla-imprimir td {
  border: 1px solid black;
  padding: 8px;
  text-align: center;
}

/* En modo impresión */
@media print {

  /* Ocultar la tabla normal y mostrar la tabla de impresión */
  .tabla-normal {
    display: none !important;
  }

  .tabla-imprimir {
    display: table !important;
  }

  #tamanotitulo {
    font-size: 20px !important;

  }

  /* Reducir y unificar el tamaño de fuente en toda la impresión */
  body,
  table,
  th,
  td,
  .v-card,
  .v-card-title,
  .v-card-text,
  .v-toolbar-title,
  .v-card-subtitle {
    font-size: 15px !important;
    /* Tamaño uniforme */
    line-height: 1.2 !important;
    /* Ajustar el espaciado */
  }


  /* Evitar que v-card aplique tamaños grandes en la impresión */


  /* Ajustar márgenes y eliminar scroll */
  html,
  body {
    height: auto !important;
    overflow: visible !important;
    margin: 0;
    padding: 0;
  }

  /* Evitar cortes de tabla en la impresión */
  .v-data-table {
    page-break-before: auto;
    page-break-after: auto;
    page-break-inside: avoid;
  }
}
</style>