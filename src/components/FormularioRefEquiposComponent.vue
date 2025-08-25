<template>
  <v-card id="vcard-imprimir" class="pa-2">
    <form>
      <v-container>
        <v-row justify="center">
          <v-col cols="4" class="d-flex justify-center">
            <v-btn v-permission="['administrador', 'calidad', 'cotizaciones']" color="primary" class="ma-3 tabla-normal"
              @click="nuevoDocumento">
              <v-icon left class="mr-2">mdi-file-document-plus-outline</v-icon>
              Guardar Documento
            </v-btn>
          </v-col>
          <v-col cols="4" class="d-flex justify-end">
            <v-btn color="primary" class="ma-3 tabla-normal" @click="imprimirVCard">
              <v-icon left class="mr-2">mdi-printer</v-icon>
              Imprimir Ficha Técnica
            </v-btn>
          </v-col>
        </v-row>
        <v-dialog v-model="esperaguardar" persistent width="500">
          <v-card color="c6" dark>
            <v-card-text>
              Por favor espere...
              <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
            </v-card-text>
          </v-card>
        </v-dialog>
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
                        <v-chip v-for="(file, index) in fileNames" :key="index" small label color="primary"
                          class="ma-1">
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
        <v-row>
          <v-col cols="12" align-self="center">
            <div class="gridtitulo">Documentacion :</div>
          </v-col>
        </v-row>
        <v-divider class="mb-5 mt-5"></v-divider>
        <v-row>
          <!-- se crea la data table prinecipal para listar los clientes -->
          <v-data-table :headers="encabezadosDocumentosLegales" :items="documentosLegales"
            class="tabla-normal elevation-1" loading-text="Cargando ... por favor espere" hide-default-footer
            disable-pagination>
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
        <v-divider class="mb-5 mt-5"></v-divider>
        <v-row>
          <v-col cols="12" align-self="center">
            <div class="gridtitulo">Informacion general del equipo :</div>
          </v-col>
        </v-row>
        <v-row justify="space-between">
          <v-col cols="12" lg="6">
            <v-text-field v-model="equipo.nombre" label="Nombre" class="centered-input" required
              :rules="[(v) => !!v || 'Campo Requerido']"></v-text-field>
          </v-col>
          <v-col cols="12" lg="6">
            <v-text-field v-model="equipo.marca" label="Marca" class="centered-input" required
              :rules="[(v) => !!v || 'Campo Requerido']"></v-text-field>
          </v-col>
          <v-col cols="12" lg="6">
            <v-text-field v-model="equipo.fabricante" label="Fabricante" class="centered-input" required
              :rules="[(v) => !!v || 'Campo Requerido']"></v-text-field>
          </v-col>
          <v-col cols="12" lg="6">
            <v-text-field v-model="equipo.servicio" label="Servicio" class="centered-input" required
              :rules="[(v) => !!v || 'Campo Requerido']"></v-text-field>
          </v-col>

          <v-col cols="12" md="6">
            <v-select v-model="equipo.clasificacionriesgo" :items="clasificacionriesgo" label="Clasificacion de riesgo"
              required :rules="[(v) => !!v || 'Campo Requerido']"></v-select>
          </v-col>
          <v-col cols="12" md="6">
            <v-select v-model="equipo.periodicidadmantenimiento" :items="periodicidadmantenimiento"
              label="Periodicidad de mantenimiento" required :rules="[(v) => !!v || 'Campo Requerido']"></v-select>
          </v-col>
        </v-row>
        <v-divider class="mb-5 mt-5"></v-divider>
        <v-row>
          <v-col cols="12" align-self="center">
            <div class="gridtitulo">Dimensiones :</div>
          </v-col>
        </v-row>
        <v-row justify="space-between">
          <v-col cols="12" lg="6">
            <v-text-field v-model="equipo.alto" label="Alto (cm)" class="centered-input" required
              :rules="[(v) => !!v || 'Campo Requerido']"></v-text-field>
          </v-col>
          <v-col cols="12" lg="6">
            <v-text-field v-model="equipo.ancho" label="Ancho (cm)" class="centered-input" required
              :rules="[(v) => !!v || 'Campo Requerido']"></v-text-field>
          </v-col>
          <v-col cols="12" lg="6">
            <v-text-field v-model="equipo.profundo" label="Profundidad (cm)" class="centered-input" required
              :rules="[(v) => !!v || 'Campo Requerido']"></v-text-field>
          </v-col>
          <v-col cols="12" lg="6">
            <v-text-field v-model="equipo.peso" label="Peso (kg)" class="centered-input" required
              :rules="[(v) => !!v || 'Campo Requerido']"></v-text-field>
          </v-col>
        </v-row>
        <v-divider class="mb-5 mt-5"></v-divider>
        <v-row>
          <v-col cols="12" align-self="center">
            <div class="gridtitulo">Especificaciones técnicas :</div>
          </v-col>
        </v-row>
        <v-row justify="space-around">
          <v-col cols="12" lg="3">
            <v-text-field v-model="equipo.voltaje" label="Voltade de entrada (VAC)" class="centered-input" required
              :rules="[(v) => !!v || 'Campo Requerido']"></v-text-field>
          </v-col>
          <v-col cols="12" lg="3">
            <v-text-field v-model="equipo.corriente" label="Corriente de entrada (A)" class="centered-input" required
              :rules="[(v) => !!v || 'Campo Requerido']"></v-text-field>
          </v-col>
          <v-col cols="12" lg="3">
            <v-text-field v-model="equipo.potencia" label="Potencia (VA)" class="centered-input" required
              :rules="[(v) => !!v || 'Campo Requerido']"></v-text-field>
          </v-col>

          <v-col cols="12" lg="3">
            <v-text-field v-model="equipo.principiodemedicion" label="Principio de medición" class="centered-input"
              required :rules="[(v) => !!v || 'Campo Requerido']"></v-text-field>
          </v-col>
          <v-col cols="12" lg="3">
            <v-text-field v-model="equipo.pruebasporhora" label="Pruebas por hora" class="centered-input" required
              :rules="[(v) => !!v || 'Campo Requerido']"></v-text-field>
          </v-col>
        </v-row>
        <v-divider class="mb-5 mt-5"></v-divider>
        <v-row>
          <v-col cols="12" align-self="center">
            <div class="gridtitulo">Condiciones Ambientales :</div>
          </v-col>
        </v-row>
        <v-row justify="space-around">
          <v-col cols="12" lg="3">
            <v-text-field v-model="equipo.temperatura" label="Temperatura (°C)" class="centered-input" required
              :rules="[(v) => !!v || 'Campo Requerido']"></v-text-field>
          </v-col>
          <v-col cols="12" lg="3">
            <v-text-field v-model="equipo.humedad" label="Humedad Relativa (%)" class="centered-input" required
              :rules="[(v) => !!v || 'Campo Requerido']"></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-select v-model="equipo.agua" :items="sino" label="Requiere toma de agua desionizada" required
              :rules="[(v) => !!v || 'Campo Requerido']"></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select v-model="equipo.desague" :items="sino" label="Requiere desagüe" required
              :rules="[(v) => !!v || 'Campo Requerido']"></v-select>
          </v-col>
        </v-row>
        <v-divider class="mb-5 mt-5"></v-divider>
        <v-row>
          <v-col cols="12" align-self="center">
            <div class="gridtitulo">Recomendaciones del fabricante :</div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" align-self="center">
            <v-textarea v-model="equipo.recomendaciones" counter clearable autocomplete
              placeholder="Describa las recomendaciones dadas por el fabricante" rows="3" row-height="30" auto-grow
              :maxlength="250" :rules="[(v) => !!v || 'Campo Requerido']"></v-textarea>
          </v-col>
        </v-row>
        <v-row>
          <v-spacer> </v-spacer>
          <v-btn v-if="nuevareferencia" :disabled="!(
            equipo.nombre &&
            equipo.marca &&
            equipo.fabricante &&
            equipo.servicio &&
            equipo.clasificacionriesgo &&
            equipo.periodicidadmantenimiento &&
            equipo.alto &&
            equipo.ancho &&
            equipo.profundo &&
            equipo.peso &&
            equipo.voltaje &&
            equipo.corriente &&
            equipo.potencia &&
            equipo.principiodemedicion &&
            equipo.pruebasporhora &&
            equipo.temperatura &&
            equipo.humedad &&
            equipo.agua &&
            equipo.desague &&
            equipo.recomendaciones
          )
            " class="c6" x-large @click="GuardarFinalizar()">
            Guardar nueva referencia
          </v-btn>
          <v-btn v-else :disabled="!(
            equipo.nombre &&
            equipo.marca &&
            equipo.fabricante &&
            equipo.servicio &&
            equipo.clasificacionriesgo &&
            equipo.periodicidadmantenimiento &&
            equipo.alto &&
            equipo.ancho &&
            equipo.profundo &&
            equipo.peso &&
            equipo.voltaje &&
            equipo.corriente &&
            equipo.potencia &&
            equipo.principiodemedicion &&
            equipo.pruebasporhora &&
            equipo.temperatura &&
            equipo.humedad &&
            equipo.agua &&
            equipo.desague &&
            equipo.recomendaciones
          )
            " v-permission="['administrador', 'calidad']" class="c6" x-large @click="ActualizarFinalizar()">
            Actualizar referencia
          </v-btn>
          <v-spacer> </v-spacer>
        </v-row>

        <v-dialog v-model="esperarguardar" persistent width="500">
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
      </v-container>

      <!--          <pre>
      
       {{ equipo }}
      </pre> -->
    </form>
  </v-card>
</template>
<script>
import axios from "axios";
export default {
  name: "FormularioRefEquiposComponent",

  data: () => ({
    esperaguardar: false,
    confirmacionguardado: false,
    ventanaGuardarDocumento: false,
    files: null,
    nombredocumentoseleccionado: null,
    listaNombresDocumentos: [
      "Registro INVIMA",
      "Manual de usuario",
      "Guía rápida",
      "Brochure",
    ],
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
    name: "",
    email: "",

    esperarguardar: false,
    confirmacionguardado: false,
    nuevareferencia: 0,
    equipo: {
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
    clasificacionriesgo: ["I", "IIa", "IIb", "III"],
    periodicidadmantenimiento: [
      "Libre de mantenimiento",
      "Trimestral",
      "Semestral",
      "Anual",
    ],
    sino: ["Si", "No"],
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
    formTitle() {
      if (this.ventanaGuardarDocumento) {
        return "Nuevo documento";
      }
    },
  },
  created() {
    this.equipo = this.$store.state.referenciaequipo;
    this.nuevareferencia = this.$store.state.nuevareferencia;
    this.documentosLegales = this.equipo.documentosLegales;
  },
  beforeCreate() {
    this.$store.dispatch("autoLogin");
    if (this.$store.state.existe === 0) {
      this.$router.push({ name: "Login" });
    }
    this.$store.dispatch("guardarUbicacion", {
      ubicacion: "Nueva referencia de equipo",
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
    cancelarGuardarDocumento() {
      this.ventanaGuardarDocumento = false;
      this.$nextTick(() => {
        this.nombredocumentoseleccionado = null;
        this.files = null;
      });
    },
    onFileChange(files) {
      // Si no hay archivos seleccionados, establecer 'files' como null
      this.files = files && files.length > 0 ? files[0] : null;
      console.log('Archivo seleccionado:', this.files);
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
    GuardarFinalizar() {
      this.esperaguardar = true;
      axios
        .post(
          this.$store.state.ruta + "api/refequipo/registrar/",
          {
            nombre: this.equipo.nombre,
            marca: this.equipo.marca,
            fabricante: this.equipo.fabricante,
            servicio: this.equipo.servicio,
            clasificacionriesgo: this.equipo.clasificacionriesgo,
            periodicidadmantenimiento: this.equipo.periodicidadmantenimiento,
            alto: this.equipo.alto,
            ancho: this.equipo.ancho,
            profundo: this.equipo.profundo,
            peso: this.equipo.peso,
            voltaje: this.equipo.voltaje,
            corriente: this.equipo.corriente,
            potencia: this.equipo.potencia,
            principiodemedicion: this.equipo.principiodemedicion,
            pruebasporhora: this.equipo.pruebasporhora,
            temperatura: this.equipo.temperatura,
            humedad: this.equipo.humedad,
            agua: this.equipo.agua,
            desague: this.equipo.desague,
            recomendaciones: this.equipo.recomendaciones,
          },
          {
            headers: {
              token: this.$store.state.token,
            },
          }
        )
        .then((response) => {
          this.esperaguardar = false;
          this.confirmacionguardado = true;
          console.log(response);
        })
        .catch((error) => {
          this.esperaguardar = true;
          console.log(error);
          return error;
        });
    },
    ActualizarFinalizar() {
      //Editar categoria
      this.esperaguardar = true;

      axios
        .patch(
          this.$store.state.ruta +
          "api/refequipo/actualizar/" +
          this.equipo.id,
          {
            nombre: this.equipo.nombre,
            marca: this.equipo.marca,
            fabricante: this.equipo.fabricante,
            servicio: this.equipo.servicio,
            clasificacionriesgo: this.equipo.clasificacionriesgo,
            periodicidadmantenimiento: this.equipo.periodicidadmantenimiento,
            alto: this.equipo.alto,
            ancho: this.equipo.ancho,
            profundo: this.equipo.profundo,
            peso: this.equipo.peso,
            voltaje: this.equipo.voltaje,
            corriente: this.equipo.corriente,
            potencia: this.equipo.potencia,
            principiodemedicion: this.equipo.principiodemedicion,
            pruebasporhora: this.equipo.pruebasporhora,
            temperatura: this.equipo.temperatura,
            humedad: this.equipo.humedad,
            agua: this.equipo.agua,
            desague: this.equipo.desague,
            recomendaciones: this.equipo.recomendaciones,
          },
          {
            headers: {
              token: this.$store.state.token,
            },
          }
        )
        .then((response) => {
          this.esperaguardar = false;
          this.confirmacionguardado = true;
          console.log(response);
        })
        .catch((error) => {
          this.esperaguardar = true;
          console.log(error);
          return error;
        });


    },
    AceptarConfirmacionGuardado() {
      this.confirmacionguardado = false;

    },
    imprimirVCard() {
  const equipo = this.equipo;
  const contenidoCompacto = `
    <h3 style="text-align:center;">Ficha técnica</h3>
    <table border="1" cellspacing="0" cellpadding="8" style="width:100%; border-collapse: collapse; text-align:left;">
      <tr><th colspan="2" style="background:#f0f0f0; font-size:15px; text-align:center;">Información General</th></tr>
      <tr><td><strong>Nombre:</strong></td><td>${equipo.nombre}</td></tr>
      <tr><td><strong>Marca:</strong></td><td>${equipo.marca}</td></tr>
      <tr><td><strong>Fabricante:</strong></td><td>${equipo.fabricante}</td></tr>
      <tr><td><strong>Servicio:</strong></td><td>${equipo.servicio}</td></tr>
      <tr><td><strong>Clasificación de Riesgo:</strong></td><td>${equipo.clasificacionriesgo}</td></tr>
      <tr><td><strong>Periodicidad Mantenimiento:</strong></td><td>${equipo.periodicidadmantenimiento}</td></tr>

      <tr><th colspan="2" style="background:#f0f0f0; font-size:15px; text-align:center;">Dimensiones</th></tr>
      <tr><td><strong>Alto (cm):</strong></td><td>${equipo.alto}</td></tr>
      <tr><td><strong>Ancho (cm):</strong></td><td>${equipo.ancho}</td></tr>
      <tr><td><strong>Profundidad (cm):</strong></td><td>${equipo.profundo}</td></tr>
      <tr><td><strong>Peso (kg):</strong></td><td>${equipo.peso}</td></tr>

      <tr><th colspan="2" style="background:#f0f0f0; font-size:15px; text-align:center;">Especificaciones Técnicas</th></tr>
      <tr><td><strong>Voltaje de Entrada (VAC):</strong></td><td>${equipo.voltaje}</td></tr>
      <tr><td><strong>Corriente de Entrada (A):</strong></td><td>${equipo.corriente}</td></tr>
      <tr><td><strong>Potencia (VA):</strong></td><td>${equipo.potencia}</td></tr>
      <tr><td><strong>Principio de Medición:</strong></td><td>${equipo.principiodemedicion}</td></tr>
      <tr><td><strong>Pruebas por Hora:</strong></td><td>${equipo.pruebasporhora}</td></tr>

      <tr><th colspan="2" style="background:#f0f0f0; font-size:15px; text-align:center;">Condiciones Ambientales</th></tr>
      <tr><td><strong>Temperatura (°C):</strong></td><td>${equipo.temperatura}</td></tr>
      <tr><td><strong>Humedad Relativa (%):</strong></td><td>${equipo.humedad}</td></tr>
      <tr><td><strong>Requiere Agua Desionizada:</strong></td><td>${equipo.agua}</td></tr>
      <tr><td><strong>Requiere Desagüe:</strong></td><td>${equipo.desague}</td></tr>

      <tr><th colspan="2" style="background:#f0f0f0; font-size:15px; text-align:center;">Recomendaciones del Fabricante</th></tr>
      <tr><td colspan="2" style="white-space: pre-wrap;">${equipo.recomendaciones}</td></tr>
    </table>
  `;

  // Detectar móvil/tablet (incluye Xiaomi)
  const esMovil = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || "ontouchstart" in window;

  const estiloCSS = `
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 5px; border: 1px solid #ddd; }
      th { background: #f0f0f0; text-align: left; }

      .logo-centrado {
        display: block;
        margin: 0 auto 5px auto;
        width: 200px;
        height: auto;
      }

      .mensaje-movil { font-size:14px; text-align:center; margin:15px; color:#555; }
      button { padding:8px 16px; border-radius:6px; border:1px solid #555; margin-top:15px; cursor:pointer; }

      @media print {
        .mensaje-movil, button { display:none !important; } /* 🔹 No imprimir el botón */
        body { font-size: 12px; }
        table { font-size: 12px; }
        th, td { font-size: 12px; padding: 6px; }
        h2 { font-size: 16px; }
      }
    </style>
  `;

  const ventana = window.open("", "_blank", "width=800,height=600");

  ventana.document.write(`
    <html>
      <head><title>Imprimir Información</title>${estiloCSS}</head>
      <body>
        <img src="/biosystems.jpg" class="logo-centrado" />
        ${contenidoCompacto}
        ${esMovil ? '<div class="mensaje-movil"><button onclick="window.print()">🖨️ Imprimir</button></div>' : ''}
      </body>
    </html>
  `);
  ventana.document.close();

  if (!esMovil) {
    // En PC: imprimir automáticamente y cerrar al terminar
    ventana.onload = () => {
      ventana.focus();
      ventana.print();

      ventana.addEventListener("afterprint", () => ventana.close());

      const mql = ventana.matchMedia("print");
      mql.addListener(e => { if (!e.matches) ventana.close(); });
    };
  }
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
        formData.append('serie', JSON.stringify(this.equipo.nombre));
        formData.append('nombredocumento', JSON.stringify(this.nombredocumentoseleccionado));

        const response = await axios.post(
          `${this.$store.state.ruta}api/s3/guardardocumentoreferencia`,
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
          .get(this.$store.state.ruta + `api/refequipo/listaruno/${this.equipo.id}`,
            {
              headers: {
                token: this.$store.state.token,
              },
            })
          /*.get(`http://localhost:3001/api/reporte/listaruno/${id}`)*/
          .then((response) => {
            this.equipo = response.data;
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
.centered-input :deep(input) {
  text-align: center;
  font-family: Roboto, sans-serif;
}

.gridtitulo {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1px;
  text-align: center;
  font-weight: bold;
  background-color: white;
}

.lafirma {
  height: 200px;
  width: 350px;
}

#signature {
  border: double 3px transparent;
  border-radius: 5px;
  background-image: linear-gradient(white, white),
    radial-gradient(circle at top left, #000000, #000000);
  background-origin: border-box;
  background-clip: content-box, border-box;
}

button.disabled {
  cursor: not-allowed;
  opacity: 0.5;
  pointer-events: none;
  /* Evita cualquier interacción del usuario */
}
</style>
