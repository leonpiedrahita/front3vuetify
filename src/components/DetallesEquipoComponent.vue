<template>
  <v-card id="vcard-imprimir" class="pa-2">
    <v-row justify="center">
      <v-col cols="4" class="d-flex justify-center">
        <v-btn color="primary" class="ma-3 tabla-normal" @click="imprimirVCard">
          <v-icon left class="mr-2">mdi-printer</v-icon>
          Imprimir hoja de vida
        </v-btn>
      </v-col>
      <v-col cols="4" class="d-flex justify-center">
        <v-btn v-permission="['administrador','calidad','cotizaciones']" color="primary" class="ma-3 tabla-normal" @click="nuevoDocumento">
          <v-icon left class="mr-2">mdi-file-document-plus-outline</v-icon>
          Guardar Documento
        </v-btn>
      </v-col>
    </v-row>
    <v-dialog v-model="ventanaGuardarDocumento" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="12" md="12">

                <v-select v-model="nombredocumentoseleccionado" :items="listaNombresDocumentos"
                  label="Nombre del documento" required :rules="[(v) => !!v || 'Campo Requerido']"></v-select>

              </v-col>
              <v-col cols="12" md="12">
                <v-file-input v-model="files" label="Seleccione un documento" placeholder="Seleccione un documento"
                  multiple prepend-icon="mdi-paperclip" accept="image/png, image/jpeg, image/bmp, application/pdf"
                  show-size counter :rules="fileRules" outlined dense @update:modelValue="onFileChange">
                  <template v-slot:selection="{ fileNames }">
                    <v-chip v-for="(file, index) in fileNames" :key="index" small label color="primary" class="ma-1">
                      {{ file }}
                    </v-chip>
                  </template>
                </v-file-input>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" text @click="cancelarGuardarDocumento"> Cancelar </v-btn>
          <v-btn :disabled="!(
            files &&
            nombredocumentoseleccionado
          )
            " color="primary darken-1" text @click="guardarDocumento">
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
              {{ equipo.tipoDeContrato }}
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
              {{ equipo.ubicacionDireccion }}
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
      <v-data-table :headers="encabezadosDocumentosLegales" :items="documentosLegales" class="tabla-normal elevation-1"
        loading-text="Cargando ... por favor espere">
        <template v-slot:[`item.imprimir`]="{ item }">
          <div class="columna-imprimir">
            <div>
              <v-icon style="margin-left: 10px" medium @click="imprimirDocumento(item)">
                mdi-printer
              </v-icon>
            </div>
          </div>
        </template>
      </v-data-table>


    </v-row>
    <v-dialog v-model="esperaguardar" persistent width="500">
      <v-card color="c6" dark>
        <v-card-text>
          Por favor espere...
          <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog transition="dialog-bottom-transition" max-width="600" persistent v-model="confirmacionguardado">
      <v-card>
        <v-toolbar class="text-h4" color="primary" dark>¡Genial!</v-toolbar>
        <v-card-text>
          <div class="text-h5 pa-5">
            El documento ha sido guardado exitosamente.
          </div>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn class="c6" @click="AceptarConfirmacionGuardado">Aceptar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-row>
      <!-- se crea la data table prinecipal para listar los clientes -->
      <v-data-table :headers="headers" :items="historial" class="tabla-normal elevation-1"
        loading-text="Cargando ... por favor espere">
        <template v-slot:[`item.imprimir`]="{ item }">
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
            <td>{{ item.fechaDeFinalizacion }}</td>
            <td>{{ item.tipoDeAsistencia }}</td>
          </tr>
        </tbody>
      </table>

    </v-row>


  </v-card>
<!-- <pre>
      
       {{equipo}}
    
      </pre> -->

</template>
<script>
import axios from "axios";
import { useVuelidate } from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'
import { ref } from "vue";
import { useRouter } from "vue-router";
export default {

  name: "DetallesEquipoComponent",

  data: () => ({
    esperaguardar: false,
    confirmacionguardado: false,
    ventanaGuardarDocumento: false,
    files: null,
    nombredocumentoseleccionado: null,
    listaNombresDocumentos: [
      "Factura",
      "Certificado de conformidad",
      "Declaracion de Importación"
    ],

    equipo: [],
    historial: [],
    url: '',
    error: '',
    reporte: {

    },
    documento:{},
    encabezadosDocumentosLegales: [
      {
        title: "Documento",
        key: "nombreDocumento",
        align: "center",

      },
      {
        title: "Imprimir",
        value: "imprimir",
        sortable: false,
        align: "center",
        class: "columna-imprimir"
      },
    ],
    headers: [
      {
        title: "Fecha de ejecución",
        key: "fechaDeFinalizacion",
        align: "center",

      },
      {
        title: "Tipo de soporte",
        key: "tipoDeAsistencia",
        align: "center",

      },
      {
        title: "Imprimir",
        value: "imprimir",
        sortable: false,
        align: "center",
        class: "columna-imprimir"
      },

    ],
    headersimpresion: [
      {
        title: "Fecha de ejecución",
        key: "fechaDeFinalizacion",
        align: "center",

      },
      {
        title: "Tipo de soporte",
        key: "tipoDeAsistencia",
        align: "center",

      },


    ],
    items: [


    ],
    fileRules: [
      value => !value || value.length <= 1 || 'Máximo 1 archivos permitidos.',
      value =>
        !value || value.every(file => file.size < 5 * 1024 * 1024) || 'Cada archivo debe ser menor a 5MB.',
      value =>
        !value || value.every(file => ['image/png', 'image/jpeg', 'image/bmp', 'application/pdf'].includes(file.type))
        || 'Solo se permiten imágenes y archivos PDF.',
    ],
  }),

  computed: {
    formTitle() {
      if (this.ventanaGuardarDocumento) {
        return "Nuevo documento";
      }
    },

  },
  created() {
    this.equipo = this.$store.state.detallesequipo;
    this.historial = this.equipo.historialDeServicios;
    this.documentosLegales = this.equipo.documentosLegales;
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

    nuevoDocumento() {
      this.$store.dispatch("autoLogin");

      if (this.$store.state.existe === 0) {
        this.$router.push({ name: "Login" });
      } else {
        this.ventanaGuardarDocumento = true;
      }
    },
    imprimirDocumento(item) {

      this.documento = Object.assign({}, item);
      
        console.log('llavereporte', this.documento.llaveDocumento)
        axios.post(
          this.$store.state.ruta + 'api/s3/buscarurl',
          {
            fileKey: this.documento.llaveDocumento

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


      


    },
    imprimirReporte(item) {

      this.reporte = Object.assign({}, item);
      console.log("reporte", this.reporte.identificacionDeReporte)
      console.log(typeof (this.reporte.identificacionDeReporte))
      if (this.reporte.reporteExterno === 0) {
        localStorage.setItem("idreporte", this.reporte.identificacionDeReporte);
        const nuevaVentanaURL = this.$router.resolve({ name: 'ImprimirReporte' }).href;
        window.open(nuevaVentanaURL, '_blank', "width=800,height=600");
      }
      else if (this.reporte.reporteExterno === 1) {
        console.log('llavereporte', this.reporte.llaveReporte)
        axios.post(
          this.$store.state.ruta + 'api/s3/buscarurl',
          {
            fileKey: this.reporte.llaveReporte

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
    },
    onFileChange(files) {
      // Si no hay archivos seleccionados, establecer 'files' como null
      this.files = files && files.length > 0 ? files[0] : null;
      console.log('Archivo seleccionado:', this.files);
    },

    cancelarGuardarDocumento() {
      this.ventanaGuardarDocumento = false;
      this.$nextTick(() => {
        this.nombredocumentoseleccionado = null;
        this.files = null;
      });
    },
    AceptarConfirmacionGuardado() {
      this.confirmacionguardado = false;

    },
    async guardarDocumento() {
      this.esperaguardar = true;
      try {
        if (!this.files) {
          throw new Error("Debe seleccionar un archivo antes de guardar.");
        }

        if (!this.nombredocumentoseleccionado) {
          throw new Error("Nombre del documento no seleccionado.");
        }
        console.log('Equipo.id', this.equipo.id)
        console.log(typeof (this.equipo.id))
        const formData = new FormData();
        formData.append('file', this.files);
        formData.append('id_equipo', JSON.stringify(this.equipo.id));
        formData.append('serie', JSON.stringify(this.equipo.serie));
        formData.append('nombredocumento', JSON.stringify(this.nombredocumentoseleccionado));

        const response = await axios.post(
          `${this.$store.state.ruta}api/s3/guardardocumento`,
          formData,
          {
            headers: {
              token: this.$store.state.token
            },
          }
        );



        console.log("Documento guardado:", response);
        this.ventanaGuardarDocumento = false;
        this.nombredocumentoseleccionado = null;
        this.files = null;
        axios
          .get(this.$store.state.ruta + `api/equipo/listaruno/${this.equipo.id}`,
            {
              headers: {
                token: this.$store.state.token,
              },
            })
          /*.get(`http://localhost:3001/api/reporte/listaruno/${id}`)*/
          .then((response) => {
            this.equipo = response.data;
            console.log("Equipo actualizado:", this.equipo);
            this.historial = this.equipo.historialDeServicios;
            this.documentosLegales = this.equipo.documentosLegales;
          })
          .catch((error) => {
            console.error("Error al obtener el reporte:", error);
          })
          .finally(() => {
            this.esperaguardar = false;
            this.confirmacionguardado = true;
          });;


      } catch (error) {
        console.error("Error al guardar el reporte:", error.response?.data || error.message);
      } finally {
        this.esperaguardar = false;
      }
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

.tabla-imprimir th,
.tabla-imprimir td {
  border: 1px solid black;
  padding: 8px;
  text-align: center;
}
button.disabled {
  cursor: not-allowed;
  opacity: 0.5;
  pointer-events: none; /* Evita cualquier interacción del usuario */
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