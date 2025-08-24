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
        <v-btn v-permission="['administrador', 'calidad', 'cotizaciones']" color="primary" class="ma-3 tabla-normal"
          @click="nuevoDocumento">
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
    <v-dialog v-model="ventanaGuardarSoporte" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="12" md="12">

                <v-select v-model="nombresoporteseleccionado" :items="listaNombresSoportes" label="Nombre del documento"
                  required :rules="[(v) => !!v || 'Campo Requerido']"></v-select>

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
          <v-btn color="error" text @click="cancelarGuardarSoporte"> Cancelar </v-btn>
          <v-btn :disabled="!(
            files &&
            nombresoporteseleccionado
          )
            " color="primary darken-1" text @click="guardarSoporte">
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
      <v-card-title>
        <v-card title="Dirección/Ciudad" variant="flat">
          <v-card-text>
            <v-toolbar-title>
              {{ equipo.ubicacionDireccion }}
            </v-toolbar-title>
            <v-toolbar-title>
              {{ equipo.ubicacionNombre }}
            </v-toolbar-title>
          </v-card-text>
        </v-card>
      </v-card-title>
     
      <v-divider class="mb-5 mt-5 ocultar-en-impresion"></v-divider>
    </v-row>
    <v-card-title class="text-center ocultar-en-impresion" id="tamanotitulo">Documentos Legales</v-card-title>

    <v-row>
      <!-- se crea la data table prinecipal para listar los clientes -->
     <v-data-table
  :headers="encabezadosDocumentosLegales"
  :items="documentosFiltrados"
  class="tabla-normal elevation-1"
  loading-text="Cargando ... por favor espere"
  hide-default-footer
  disable-pagination
>
  <template v-slot:[`item.imprimir`]="{ item }">
    <div class="columna-imprimir">
      <v-icon style="margin-left:10px" medium @click="imprimirDocumento(item)">
        mdi-file-download-outline
      </v-icon>
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
    <v-divider class="mb-5 mt-5"></v-divider>
    <v-card-title class="text-center" id="tamanotitulo">Historial de Soportes</v-card-title>
    <v-divider class="mb-5 mt-5"></v-divider>
    <v-row>
      <!-- se crea la data table prinecipal para listar los clientes -->
      <v-data-table :headers="headers" :items="historial" class="tabla-normal elevation-1"
        loading-text="Cargando ... por favor espere">
        <template v-slot:[`item.soportes`]="{ item }">
          <div class="columna-imprimir">
            <div>
              <v-icon style="margin-left: 10px" medium @click="abrirSoportes(item)">
                mdi-text-box-multiple-outline
              </v-icon>
            </div>
          </div>
        </template>
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
    <v-dialog v-model="dialogosoportes" transition="dialog-bottom-transition" persistent fullscreen>
      <v-card>

        <!-- TOOLBAR CON COLOR Y ESTILO -->
        <v-toolbar flat style="background-color: #52B69A; color: white;">
          <v-spacer></v-spacer>

          <!-- Título centrado en negrilla -->
          <v-toolbar-title class="text-center font-weight-bold">
           {{ equipo.nombre }} &nbsp; | &nbsp; {{ equipo.serie }}
          </v-toolbar-title>
          <v-spacer></v-spacer>

          {{ reporte.tipoDeAsistencia }} &nbsp; | &nbsp;{{ reporte.fechaDeFinalizacion }}


          <v-spacer></v-spacer>
          <!-- Botón cerrar a la derecha -->
          <v-btn icon="mdi-close" @click="dialogosoportes = false" variant="text" color="white" class="ml-auto" />
        </v-toolbar>

        <!-- CUERPO DEL DIALOGO -->
        <v-card-text>
          <v-data-table :headers="encabezadosSoportes" :items="soportes || []" class="elevation-1">

            <!-- Slot para botón superior -->
            <template v-slot:top>
              <div class="d-flex justify-center">
                <v-btn color="primary" @click="ventanaGuardarSoporte = true" elevation="1" class="text-capitalize"
                  min-width="auto" rounded>
                  <v-icon left size="18">mdi-text-box-plus-outline</v-icon>
                  Agregar documento
                </v-btn>
              </div>
            </template>
            <!-- Slot personalizado para imprimir -->
            <template v-slot:[`item.imprimir`]="{ item }">
              <div class="columna-imprimir">
                <div>
                  <v-icon style="margin-left: 10px" medium @click="imprimirSoporte(item)">
                    mdi-file-download-outline
                  </v-icon>
                </div>
              </div>
            </template>
          </v-data-table>

          <!-- DEBUG (puedes eliminar esto) -->
          <!-- {{ this.historialclientes }} -->
        </v-card-text>

      </v-card>
    </v-dialog>

  </v-card>
  <!-- <pre>

  {{ equipo }}

</pre>  -->

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
    dialogosoportes: false,
    esperaguardar: false,
    confirmacionguardado: false,
    ventanaGuardarDocumento: false,
    ventanaGuardarSoporte: false,
    files: null,
    nombredocumentoseleccionado: null,
    nombresoporteseleccionado: null,
    listaNombresDocumentos: [
      "Factura de Compra",
      "Factura de Venta",
      "Certificado de conformidad",
      "Declaracion de Importación",
      "Sin Declaración de Importación (Soporte)",
      "Sin Certificado de Conformidad (Soporte) ",
    ],
    listaNombresSoportes: [
      "Acta de entrega",
      "Acta de retiro",
      "Contrato",
      "Soportes del reporte",
      "Asistencia a entrenamiento",
      "Certificados de entrenamiento",
      "Evaluaciones de entrenamiento",
    ],

    equipo: [],
    historial: [],
    soportes: [],
    url: '',
    error: '',
    reporte: {

    },
    documento: {},
    encabezadosDocumentosLegales: [
      {
        title: "Documento",
        key: "nombreDocumento",
        align: "center",

      },

      {
        title: "Descargar",
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
        title: "Documentos soporte",
        value: "soportes",
        sortable: false,
        align: "center",
        class: "columna-imprimir"
      },
      {
        title: "Imprimir reporte",
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
    encabezadosSoportes: [
      {
        title: "Documento",
        key: "nombreDocumento",
        align: "center",

      },

      {
        title: "Descargar",
        value: "imprimir",
        sortable: false,
        align: "center",
        class: "columna-imprimir"
      },
    ],
    items: [


    ],
    fileRules: [
      value => !value || value.length <= 1 || 'Máximo 1 archivos permitidos.',
      value =>
        !value || value.every(file => file.size < 10 * 1024 * 1024) || 'Cada archivo debe ser menor a 10MB.',
      value =>
        !value || value.every(file => ['image/png', 'image/jpeg', 'image/bmp', 'application/pdf'].includes(file.type))
        || 'Solo se permiten imágenes y archivos PDF.',
    ],
  }),

  computed: {
   documentosFiltrados() {
    return this.documentosLegales.filter(item => {
      // Si el usuario tiene rol permitido, muestra todo
      if (this.esRolPermitido) {
        return true;
      }
      // Si no, excluye documentos que contengan "Factura"
      return !/Factura/i.test(item.nombreDocumento);
    });
  },
  esRolPermitido() {
    const permitidos = ['administrador', 'calidad', 'cotizaciones', 'comercial'];
    return permitidos.includes(this.$store.state.user.rol);
  },
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
    imprimirSoporte(item) {

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
    abrirSoportes(item) {
      this.reporte = Object.assign({}, item);
      this.soportes = this.reporte.documentosSoporte;
      console.log("soportes", this.soportes)
      console.log("reporte", this.reporte)
      this.dialogosoportes = true;
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
  const estilo = document.head.innerHTML;
  const imagenUrl = `${location.origin}/biosystems.jpg`;

  const esMovil = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (esMovil) {
    // ----------- MODO MÓVIL (iframe oculto) -----------
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Imprimir Información</title>
          ${estilo}
          <style>
            body { font-family: Arial, sans-serif; margin: 0mm; }
            .v-card { box-shadow: none; font-size: 15px !important; }
            .imagen-superior-centrada { display:block; margin:0 auto 10px auto; width:200px; height:auto; }
            .marco-delgado { border:2px solid #000; border-radius:8px; padding:10px; margin:10px; font-size:15px; }
          </style>
        </head>
        <body>
          <div class="marco-delgado">
            <img src="${imagenUrl}" class="imagen-superior-centrada" />
            ${contenido}
          </div>
        </body>
      </html>
    `);
    doc.close();

    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    };

  } else {
    // ----------- MODO PC (window.open) -----------
    const ventana = window.open("", "_blank", "width=800,height=600");

    ventana.document.write(`
      <html>
        <head>
          <title>Imprimir Información</title>
          ${estilo}
          <style>
            body { font-family: Arial, sans-serif; margin: 0mm; }
            .v-card { box-shadow: none; font-size: 15px !important; }
            .imagen-superior-centrada { display:block; margin:0 auto 10px auto; width:200px; height:auto; }
            .marco-delgado { border:2px solid #000; border-radius:8px; padding:10px; margin:10px; font-size:15px; }
          </style>
        </head>
        <body>
          <div class="marco-delgado">
            <img src="${imagenUrl}" class="imagen-superior-centrada" />
            ${contenido}
          </div>
        </body>
      </html>
    `);

    ventana.document.close();

    ventana.onload = () => {
      ventana.focus();
      ventana.print();
      ventana.close();
    };
  }
}
,

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
    cancelarGuardarSoporte() {
      this.ventanaGuardarSoporte = false;
      this.$nextTick(() => {
        this.nombresoporteseleccionado = null;
        this.files = null;
      });
    },
    AceptarConfirmacionGuardado() {
      this.actualizarVentana();
      this.confirmacionguardado = false;
      this.dialogosoportes = false;
      this.ventanaGuardarSoporte = false;

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
    },

    async actualizarVentana() {
      axios.get(this.$store.state.ruta + `api/equipo/listaruno/${this.equipo.id}`,
        {
          headers: {
            token: this.$store.state.token,
          },
        })
        .then((response) => {
          this.equipo = response.data;
          this.historial = this.equipo.historialDeServicios;
          this.documentosLegales = this.equipo.documentosLegales;
        })
        .catch((error) => {
          console.error("Error al obtener el reporte:", error);
        });


    },
    async guardarSoporte() {
      this.esperaguardar = true;
      console.log('equipo', this.equipo)
      console.log('reporte', this.reporte.id)
      try {
        if (!this.files) {
          throw new Error("Debe seleccionar un archivo antes de guardar.");
        }

        if (!this.nombresoporteseleccionado) {
          throw new Error("Nombre del documento no seleccionado.");
        }
        const formData = new FormData();
        formData.append('file', this.files);
        formData.append('id_servicio', JSON.stringify(this.reporte.id));
        formData.append('serie', JSON.stringify(this.equipo.serie));
        formData.append('nombredocumento', JSON.stringify(this.nombresoporteseleccionado));

        const response = await axios.post(
          `${this.$store.state.ruta}api/s3/guardarsoporte`,
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
  pointer-events: none;
  /* Evita cualquier interacción del usuario */
}

.columna-imprimir {
  display: flex;
  justify-content: center;
  align-items: center;
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
    font-size: 15px !important;

  }
  .ocultar-en-impresion {
    display: none !important;
  }

  /* Reducir y unificar el tamaño de fuente en toda la impresión */
  body *,
  table *,
  th *,
  td *,
  .v-card *,
  .v-card-title *,
  .v-card-text *,
  .v-toolbar-title *,
  .v-card-subtitle * {
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