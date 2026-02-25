<template>
  <form>
    <v-row class="pa-2">

      <v-spacer></v-spacer>
      <v-spacer></v-spacer>
      <v-switch v-model="archivo" color="primary" label="Reporte de servicio externo"></v-switch>
      <v-spacer></v-spacer>


    </v-row>

    <v-container v-if="!archivo">
      <v-divider class="mb-5 mt-5"></v-divider>
      <v-row>
        <v-col cols="12" align-self="center">
          <div class="gridtitulo">Informacion del equipo :</div>
        </v-col>
      </v-row>
      <v-row justify="space-between">
        <v-col cols="12" lg="6">
          <v-text-field v-model="equipo.nombre" label="Nombre" readonly class="centered-input"></v-text-field>
        </v-col>
        <v-col cols="12" lg="6">
          <v-text-field v-model="equipo.marca" label="Marca" readonly class="centered-input"></v-text-field>
        </v-col>
        <v-col cols="12" lg="6">
          <v-text-field v-model="equipo.serie" label="Serie" readonly class="centered-input"></v-text-field>
        </v-col>
        <v-col cols="12" lg="6">
          <v-text-field v-model="equipo.propietario.nombre" label="Propietario" readonly
            class="centered-input"></v-text-field>
        </v-col>
      </v-row>
      <v-divider class="mb-5 mt-5"></v-divider>
      <v-row>
        <v-col cols="12" align-self="center">
          <div class="gridtitulo">Informacion del cliente :</div>
        </v-col>
      </v-row>
      <v-row justify="space-between">
        <v-col cols="12" lg="6">
          <v-text-field v-model="equipo.cliente.nombre" label="Nombre / Razón social" readonly
            class="centered-input"></v-text-field>
        </v-col>
        <v-col cols="12" lg="6">
          <v-text-field v-model="equipo.cliente.nit" label="NIT" readonly class="centered-input"></v-text-field>
        </v-col>
        <v-col cols="12" lg="6">
          <v-text-field v-model="equipo.ubicacionNombre" label="Sede" readonly class="centered-input"></v-text-field>
        </v-col>
        <v-col cols="12" lg="6">
          <v-text-field v-model="equipo.ubicacionDireccion" label="Dirección" readonly
            class="centered-input"></v-text-field>
        </v-col>
        <v-col cols="12" lg="6">
          <v-text-field v-model="reporte.profesionalcliente" label="Nombre del Usuario" required
            :rules="[(v) => !!v || 'Campo Requerido']"></v-text-field>
        </v-col>
        <v-col cols="12" lg="6">
          <v-text-field v-model="reporte.telefonocliente" :rules="[(v) => !!v || 'Campo Requerido']"
            label="Telefono del Usuario" required></v-text-field>
        </v-col>
      </v-row>
      <v-divider class="mb-5 mt-5"></v-divider>
      <v-row>
        <v-col cols="12" align-self="center">
          <div class="gridtitulo">Detalles de la asistencia :</div>
        </v-col>
      </v-row>
      <v-row justify="space-around">
        <v-col cols="12" md="6">
          <v-select v-model="reporte.tipodeasistencia" :items="tipodeasistencia" label="Tipo de asistencia" required
            :rules="[(v) => !!v || 'Campo Requerido']"></v-select>
        </v-col>

        <v-col cols="12" md="6">
          <v-text-field color="c6" label="Duración (Horas)" v-model="reporte.duracion" required outlined dense
            readonly="" hide-details>
            <template v-slot:prepend>
              <v-btn icon @click="changeDuration(-1)" :disabled="reporte.duracion <= 0.5" size="x-small" color="c6"
                variant="flat">
                <v-icon>mdi-chevron-double-left</v-icon>
              </v-btn>
              <v-btn icon @click="changeDuration(-0.25)" :disabled="reporte.duracion <= 0.5" size="x-small" color="c6"
                variant="flat" class="ml-1">
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
            </template>


            <template v-slot:append>
              <v-btn icon @click="changeDuration(0.25)" :disabled="reporte.duracion >= 50" size="x-small" color="c6"
                variant="flat">
                <v-icon>mdi-chevron-right</v-icon>
              </v-btn>
              <v-btn icon @click="changeDuration(1)" :disabled="reporte.duracion >= 50" size="x-small" color="c6"
                variant="flat" class="ml-1">
                <v-icon>mdi-chevron-double-right</v-icon>
              </v-btn>
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-menu v-model="menu1" :close-on-content-click="false" min-width="auto">
            <template v-slot:activator="{ props }">
              <v-text-field v-model="reporte.fechadeinicio" label="Fecha de inicio" prepend-icon="mdi-calendar" readonly
                v-bind="props"></v-text-field>
            </template>
            <v-locale-provider locale="es">
              <v-date-picker locale="es" @update:model-value="cambiarEstadoDeMenu1" v-model="fechadeiniciocalendario"
                color="primary" title="Fecha de inicio" header="Seleccionar Fecha">
              </v-date-picker>
            </v-locale-provider>
          </v-menu>
        </v-col>
        <v-col cols="12" md="6">
          <v-menu v-model="menu2" :close-on-content-click="false" transition="scale-transition" min-width="auto">
            <template v-slot:activator="{ props }">
              <v-text-field v-model="reporte.fechadefinalizacion" label="Fecha de finalización"
                prepend-icon="mdi-calendar" readonly v-bind="props"></v-text-field>
            </template>
            <v-locale-provider locale="es">
              <v-date-picker locale="es" @update:model-value="cambiarEstadoDeMenu2"
                v-model="fechadefinalizacioncalendario" color="primary" title="Fecha de finalización"
                header="Seleccionar Fecha"></v-date-picker></v-locale-provider>
          </v-menu>
        </v-col>
      </v-row>
      <v-divider class="mb-5 mt-5"></v-divider>
      <v-row>
        <v-col cols="12" align-self="center">
          <div class="gridtitulo">Fallas reportada / Hallazgos :</div>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" align-self="center">
          <v-textarea v-model="reporte.hallazgos" counter clearable autocomplete
            placeholder="Describa las fallas reportadas por el usuario y los hallazgos" rows="3" row-height="30"
            auto-grow :maxlength="250" :rules="[(v) => !!v || 'Campo Requerido']"></v-textarea>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" align-self="center">
          <div class="gridtitulo">Actividades realizadas :</div>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" align-self="center">
          <v-textarea v-model="reporte.actividades" counter clearable autocomplete
            placeholder="Describa las actividades relacionadas con el soporte" rows="3" row-height="30" auto-grow
            :maxlength="1000" :rules="[(v) => !!v || 'Campo Requerido']"></v-textarea>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" align-self="center">
          <div class="gridtitulo">Pruebas de aceptación :</div>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" align-self="center">
          <v-textarea v-model="reporte.pruebas" counter clearable autocomplete
            placeholder="Liste las pruebas realizadas para verificar el adecuado funcionamiento del equipo" rows="3"
            row-height="30" auto-grow :maxlength="250" :rules="[(v) => !!v || 'Campo Requerido']"></v-textarea>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" align-self="center">
          <div class="gridtitulo">Repuestos utilizados :</div>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" align-self="center">
          <v-textarea v-model="reporte.repuestos" counter clearable autocomplete
            placeholder="Código - Descripción - Cantidad" rows="3" row-height="30" auto-grow :maxlength="750"
            :rules="[(v) => !!v || 'Campo Requerido']"></v-textarea>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" align-self="center">
          <div class="gridtitulo">Observaciones / Recomendaciones :</div>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" align-self="center">
          <v-textarea v-model="reporte.observaciones" counter clearable autocomplete
            placeholder="Describa las observaciones referentes a la asistencia realizada y/o recomendaciones que se dieron al usuario"
            rows="3" row-height="30" auto-grow :maxlength="500" :rules="[(v) => !!v || 'Campo Requerido']"></v-textarea>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" lg="6" align="center">
          <div class="lafirma">
            <VueSignaturePad id="signature" height="200px" width="350px" ref="signaturePad" :options="options" />
          </div>
          <v-text-field v-model="reporte.profesionalcliente" readonly class="centered-input"></v-text-field>
          <p readonly class="centered-input">Recibe a satisfacción</p>
          <v-col cols="6" lg="5" align="center">
            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn color="c6" min-width="228" size="large" variant="flat" large @click="undo">
                Deshacer Firma
              </v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-col>
        </v-col>
        <v-col cols="12" lg="6" align="center">
          <div class="lafirma">
            <img class="lafirma" :src="reporte.firmaingeniero" />
          </div>
          <v-text-field v-model="reporte.ingeniero" readonly class="centered-input"></v-text-field>
          <p readonly class="centered-input">Responsable del soporte</p>
          <v-card-actions>
            <v-col cols="12" lg="12" align="center">
              <v-btn color="c6" min-width="228" size="large" variant="flat" large @click="iniciarCuestionario"
                :disabled="!(
                  this.reporte.tipodeasistencia &&
                  this.reporte.duracion &&
                  this.reporte.fechadeinicio &&
                  this.reporte.fechadefinalizacion &&
                  this.reporte.profesionalcliente &&
                  this.reporte.telefonocliente &&
                  this.reporte.hallazgos &&
                  this.reporte.actividades &&
                  this.reporte.pruebas &&
                  this.reporte.repuestos &&
                  this.reporte.observaciones &&
                  this.reporte.firmaingeniero &&
                  this.reporte.ingeniero
                )
                  ">
                Guardar y finalizar
              </v-btn>
              <!--               <v-btn class="blue darken-1 ma-1" @click="save">
                  Guardar y Finalizar
                </v-btn> -->
            </v-col>
          </v-card-actions>
        </v-col>
      </v-row>
      <v-dialog transition="dialog-bottom-transition" max-width="600" persistent
        v-model="dialogoPreguntarCronogramaInterno">
        <v-card>
          <!-- Encabezado con color y texto centrado -->
          <v-toolbar color="secondary" dark>
            <v-toolbar-title class="text-h5 text-center w-100">Atencion!</v-toolbar-title>
          </v-toolbar>

          <v-card-text>
            <div class="text-h5 pa-5 text-center">
              ¿Desea actualizar la fecha del Mantenimiento Preventivo?
            </div>
          </v-card-text>

          <v-card-actions class="d-flex justify-space-evenly">
            <!-- Botones con color de fondo y letra blanca -->
            <v-btn color="c6" size="large" variant="flat" @click="guardarReporteInternoCronograma">
              Actualizar
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn color="error" size="large" variant="flat" @click="guardarReporte">
              No Actualizar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="esperaguardar" persistent width="500">
        <v-card color="c6" dark>
          <v-card-text>
            Por favor espere...
            <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-card-actions> </v-card-actions>
    </v-container>
    <v-container v-if="archivo">

      <v-divider class="mb-5 mt-5"></v-divider>
      <v-row>
        <v-col cols="12" align-self="center">
          <div class="gridtitulo">Detalles de la asistencia :</div>
        </v-col>
      </v-row>
      <v-row justify="space-around">
        <v-col cols="12" md="4">
          <v-select v-model="reporte.tipodeasistencia" :items="tipodeasistenciaExtendida" label="Tipo de asistencia"
            required :rules="[(v) => !!v || 'Campo Requerido']"></v-select>
        </v-col>


        <v-col cols="12" md="4">
          <v-menu v-model="menu1" :close-on-content-click="false" min-width="auto">
            <template v-slot:activator="{ props }">
              <v-text-field v-model="reporte.fechadeinicio" label="Fecha de inicio" prepend-icon="mdi-calendar" readonly
                v-bind="props"></v-text-field>
            </template>
            <v-locale-provider locale="es">
              <v-date-picker locale="es" @update:model-value="cambiarEstadoDeMenu1" v-model="fechadeiniciocalendario"
                color="primary" title="Fecha de inicio" header="Seleccionar Fecha">
              </v-date-picker>
            </v-locale-provider>
          </v-menu>
        </v-col>
        <v-col cols="12" md="4">
          <v-menu v-model="menu2" :close-on-content-click="false" transition="scale-transition" min-width="auto">
            <template v-slot:activator="{ props }">
              <v-text-field v-model="reporte.fechadefinalizacion" label="Fecha de finalización"
                prepend-icon="mdi-calendar" readonly v-bind="props"></v-text-field>
            </template>
            <v-locale-provider locale="es">
              <v-date-picker locale="es" @update:model-value="cambiarEstadoDeMenu2"
                v-model="fechadefinalizacioncalendario" color="primary" title="Fecha de finalización"
                header="Seleccionar Fecha"></v-date-picker></v-locale-provider>
          </v-menu>
        </v-col>
      </v-row>
      <v-divider class="mb-5 mt-5"></v-divider>
      <v-row justify="space-around">
        <v-col cols="12" md="6">
          <v-file-input v-model="files" label="Reporte" placeholder="Seleccione el reporte" multiple
            prepend-icon="mdi-paperclip" accept="image/png, image/jpeg, image/bmp, application/pdf" show-size counter
            :rules="fileRules" outlined dense @update:modelValue="onFileChange">
            <template v-slot:selection="{ fileNames }">
              <v-chip v-for="(file, index) in fileNames" :key="index" small label color="primary" class="ma-1">
                {{ file }}
              </v-chip>
            </template>
          </v-file-input>
        </v-col>
      </v-row>
      <v-row>
        <v-spacer> </v-spacer>
        <v-btn color="c6" min-width="228" size="large" variant="flat" :disabled="!(
          reporte.tipodeasistencia &&
          reporte.fechadeinicio &&
          reporte.fechadefinalizacion &&
          files
        )" @click="seleccionGuardarReporteExterno">
          Guardar y finalizar reporte externo
        </v-btn>
        <!--               <v-btn class="blue darken-1 ma-1" @click="save">
                  Guardar y Finalizar
                </v-btn> -->

        <v-spacer> </v-spacer>
      </v-row>

      <v-dialog v-model="esperaguardar" persistent width="500">
        <v-card color="c6" dark>
          <v-card-text>
            Por favor espere...
            <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-card-actions> </v-card-actions>
      <v-dialog transition="dialog-bottom-transition" max-width="600" persistent v-model="confirmacionguardado">
        <v-card>
          <v-toolbar class="text-h4" color="primary" dark>¡Genial!</v-toolbar>
          <v-card-text>
            <div class="text-h5 pa-5">
              El reporte externo ha sido guardado exitosamente.
            </div>
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn class="c6" @click="AceptarConfirmacionGuardado">Aceptar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog transition="dialog-bottom-transition" max-width="600" persistent v-model="dialogoPreguntarCronograma">
        <v-card>
          <!-- Encabezado con color y texto centrado -->
          <v-toolbar color="secondary" dark>
            <v-toolbar-title class="text-h5 text-center w-100">Atencion!</v-toolbar-title>
          </v-toolbar>

          <v-card-text>
            <div class="text-h5 pa-5 text-center">
              ¿Desea actualizar la fecha del Mantenimiento Preventivo?
            </div>
          </v-card-text>

          <v-card-actions class="d-flex justify-space-evenly">
            <!-- Botones con color de fondo y letra blanca -->
            <v-btn color="c6" size="large" variant="flat" @click="guardarReporteExternoCronograma">
              Actualizar
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn color="error" size="large" variant="flat" @click="guardarReporteExterno">
              No Actualizar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </v-container>
    <v-dialog v-model="dialogoAbierto" persistent max-width="450">
      <v-card v-if="preguntaActual">

        <v-card-title class="text-h4 primary text-center">
          Atención
        </v-card-title>

        <v-card-text class="pt-0 text-h5 text-center">
          {{ preguntaActual.texto }}
        </v-card-text>

        <v-card-actions class="justify-center">
          <v-spacer></v-spacer>
          <v-btn color="error" class="mb-5" size="large" variant="flat" text @click="responderPregunta(false)">
            No
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="success" class="mb-5" size="large" variant="flat" text @click="responderPregunta(true)">
            Sí
          </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
   

  </form>
</template>
<script>
import axios from "axios";
import { useVuelidate } from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'
import { ref } from "vue";
import { useRouter } from "vue-router";
export default {
  name: "FormularioGenerarOrdenComponent",
  setup() {
    return { v$: useVuelidate() }
    const router = useRouter();
  },

  validations: {
    name: { required },
    email: { required, email },
    tipodeasistenciaseleccionado: { required },
    checkbox: {
      checked(val) {
        return val;
      },
    },
  },

  data: () => ({
    respuestapreguntas: 0,
    dialogoAbierto: false,
    cuestionarioCompleto: false,
    preguntasPendientes: [], // Cola de preguntas por responder
    preguntaActual: null,    // Pregunta actualmente visible en el diálogo
    // --- Valores y Reglas ---
    valoresPreguntas: {
      remoto: 100,
      campo: 10,
      cronograma: 1,
    },
    // La tabla de reglas: 1 = hacer pregunta, 0 = no hacer.
    reglas: {
      "Instalación": { remoto: 1, campo: 1, cronograma: 1 },
      "Entrenamiento": { remoto: 1, campo: 1, cronograma: 0 },
      "Instalación y entrenamiento": { remoto: 1, campo: 1, cronograma: 1 },
      "Mantenimiento preventivo": { remoto: 0, campo: 1, cronograma: 1 },
      "Mantenimiento correctivo": { remoto: 0, campo: 1, cronograma: 0 },
      "Mantenimiento preventivo y correctivo": { remoto: 0, campo: 1, cronograma: 1 },
      "Soporte remoto": { remoto: 1, campo: 0, cronograma: 0 },
      "Entrenamiento remoto": { remoto: 1, campo: 0, cronograma: 0 },
      "Desinstalación": { remoto: 1, campo: 1, cronograma: 0 },
      "Inspección": { remoto: 0, campo: 1, cronograma: 0 },
      "Actualización": { remoto: 1, campo: 1, cronograma: 0 },
    },

    // Texto que se mostrará en el diálogo para cada pregunta
    textoPreguntas: {
      remoto: '¿Se realizó soporte de forma remota?',
      campo: '¿Se realizó el soporte donde el cliente?',
      cronograma: '¿Desea actualizar la fecha del Mantenimiento Preventivo?',
    },
    dialogoPreguntarCronograma: false,
    dialogoPreguntarCronogramaInterno: false,
    fechacalendariodefinalizacion: null,
    files: null,
    slider: null,

    confirmacionguardado: false,
    options: {
      penColor: "black",
    },
    archivo: false,
    name: "",
    email: "",
    select: null,
    items: ["Item 1", "Item 2", "Item 3", "Item 4"],
    tipodeasistenciaseleccionado: null,
    tipodeasistencia: [
      "Instalación",
      "Entrenamiento",
      "Instalación y entrenamiento",
      "Mantenimiento preventivo",
      "Mantenimiento correctivo",
      "Mantenimiento preventivo y correctivo",
      "Soporte remoto",
      "Entrenamiento remoto",
      "Desinstalación",
      "Inspección",
      "Evaluación de desempeño",
      "Actualización"
    ],
    fechadeiniciocalendario: null,
    menu1: false,
    fechadefinalizacioncalendario: null,
    menu2: false,
    checkbox: false,
    esperaguardar: false,
    equipo: {
      cliente: {
        sede: [
          {
            nombre: "",
            direccion: "",
          },
        ],
        contactoprincipal: [
          {
            nombre: "",
            telefono: "",
          },
        ],
      },
      propietario: {
        sede: [
          {
            nombre: "",
            direccion: "",
          },
        ],
        contactoprincipal: [
          {
            nombre: "",
            telefono: "",
          },
        ],
      },
      nombre: "",
      serie: "",
      marca: "",
    },
    reporte: {
      tipodeasistencia: null,
      duracion: null,
      fechadeinicio: null,
      fechadefinalizacion: null,
      infoequipo: {
        nombre: "",
        serie: "",
        marca: "",
      },
      propietario: "",
      nombrecliente: "",
      nitcliente: "",
      sedecliente: "",
      direccioncliente: "",
      profesionalcliente: "",
      telefonocliente: "",
      hallazgos: "",
      actividades: "",
      pruebas: "",
      repuestos: "",
      observaciones: "",
      firmacliente: "",
      firmaingeniero: "",
      ingeniero: "",
    },
    options: {
      firma: "",
    },
    fileRules: [
      value => !value || value.length <= 1 || 'Máximo 1 archivos permitidos.',
      value =>
        !value || value.every(file => file.size < 25 * 1024 * 1024) || 'Cada archivo debe ser menor a 25MB.',
      value =>
        !value || value.every(file => ['image/png', 'image/jpeg', 'image/bmp', 'application/pdf'].includes(file.type))
        || 'Solo se permiten imágenes y archivos PDF.',
    ],
  }),

  computed: {

    checkboxErrors() {
      const errors = [];
      if (!this.$v.checkbox.$dirty) return errors;
      !this.$v.checkbox.checked && errors.push("You must agree to continue!");
      return errors;
    },
    selectErrors() {
      const errors = [];
      if (!this.$v.tipodeasistenciaseleccionado.$dirty) return errors;
      !this.$v.tipodeasistenciaseleccionado.required &&
        errors.push("Campo requerido");
      return errors;
    },
    nameErrors() {
      const errors = [];
      if (!this.$v.name.$dirty) return errors;

      !this.$v.name.required && errors.push("Campo requerido");
      return errors;
    },
    emailErrors() {
      const errors = [];
      if (!this.$v.email.$dirty) return errors;
      !this.$v.email.email && errors.push("Must be valid e-mail");
      !this.$v.email.required && errors.push("E-mail is required");
      return errors;
    },
    tipodeasistenciaExtendida() {
      return [...this.tipodeasistencia, "Soportes previos"];
    },

  },
  created() {
    this.consultarequipo();
    this.buscarfirma();
    this.reporte.ingeniero = this.$store.state.user.nombre;
    this.reporte.firmaingeniero = this.$store.state.user.firma;
  },
  beforeCreate() {
    this.$store.dispatch("autoLogin");
    if (this.$store.state.existe === 0) {
      this.$router.push({ name: "Login" });
    }
    this.$store.dispatch("guardarUbicacion", {
      ubicacion: "Equipos",
      icono: "mdi-amplifier",
      color: "c6",
    });
  },
  methods: {


    changeDuration(step) {
      // 1. Calcula el nuevo valor
      let newValue = this.reporte.duracion + step;

      // 2. Redondea el nuevo valor para evitar problemas de coma flotante
      // (Multiplicamos y dividimos por 100 para trabajar con enteros y asegurar la precisión de 0.25)
      newValue = Math.round(newValue * 100) / 100;

      // 3. Aplica las restricciones de mínimo y máximo (0.5 y 20)
      if (newValue < 0.5) {
        this.reporte.duracion = 0.5;
      } else if (newValue > 20) {
        this.reporte.duracion = 20;
      } else {
        this.reporte.duracion = newValue;
      }
    },
    cambiarEstadoDeMenu1(fechaseleccionadaincio) {

      this.reporte.fechadeinicio = fechaseleccionadaincio.getDate() + '-' + (fechaseleccionadaincio.getMonth() + 1) + '-' + fechaseleccionadaincio.getFullYear(); // Los meses en JavaScript van de 0 a 11

      this.menu1 = !this.menu1;
    },
    cambiarEstadoDeMenu2(fechaseleccionadafinalizacion) {
      this.reporte.fechadefinalizacion = fechaseleccionadafinalizacion.getDate() + '-' + (fechaseleccionadafinalizacion.getMonth() + 1) + '-' + fechaseleccionadafinalizacion.getFullYear(); // Los meses en JavaScript van de 0 a 11
      this.fechacalendariodefinalizacion = fechaseleccionadafinalizacion;
      this.menu2 = !this.menu2;
    },


    consultarequipo() {
      this.equipo = JSON.parse(localStorage.getItem("equipo"));
      this.reporte.infoequipo.nombre = this.equipo.nombre;
      this.reporte.infoequipo.serie = this.equipo.serie;
      this.reporte.infoequipo.marca = this.equipo.marca;
      this.reporte.propietario = this.equipo.propietario.nombre;
      this.reporte.nombrecliente = this.equipo.cliente.nombre;
      this.reporte.nitcliente = this.equipo.cliente.nit;
      this.reporte.sedecliente = this.equipo.ubicacionNombre;
      this.reporte.direccioncliente = this.equipo.ubicacionDireccion;

      //localStorage.removeItem('equipo')
    },
    buscarfirma() {
      //va a ir a mi backend y me traerá las peticiones de la base de datos
      axios
        .get(this.$store.state.ruta + "api/usuario/buscarfirma", {
          headers: {
            token: this.$store.state.token,
          },
        })
        .then((response) => {

          this.reporte.firmaingeniero = response.data.firma; //el this es porque no es propia de la funcion sino de l componente
        })
        .catch((error) => {
          //console.log(error);
          return error;
        });
    },
    undo() {
      this.$refs.signaturePad.undoSignature();
    },
    save() {
      const { isEmpty, data } =
        this.$refs.signaturePad.saveSignature("image/png");
      console.log(isEmpty);
      console.log(data);
      this.reporte.firmacliente = data;

    },
    guardarReporte() {
      const puntaje = this.respuestapreguntas;
      switch (puntaje) {
        case 0:
          // Caso 0: Si ninguna pregunta fue "Sí" (o no aplicaban preguntas).
          this.guardarReporteInternoTaller();
          break;

        case 1:
          // Caso 1000: Solo Remoto fue "Sí".
          this.guardarReporteInternoTallerCronograma();
          break;

        case 10:
          // Caso 100: Solo Taller fue "Sí".
          this.guardarReporteInternoCampo();
          break;

        case 11:
          // Caso 10: Solo Campo fue "Sí" (Solo posible si Remoto era "No").
          this.guardarReporteInternoCampoCronograma();
          break;

        case 100:
          // Caso 1: Solo Cronograma fue "Sí" (Solo posible si Remoto, Taller y Campo eran "No").
          this.guardarReporteInternoRemoto();
          break;

        case 101:
          // Caso 1001: Remoto (1000) + Cronograma (1)
          this.guardarReporteInternoRemotoCronograma();
          break;

      }
    },
    guardarReporteInternoTaller() {

      this.reporte.firmacliente = "Taller";
      this.esperaguardar = true;
      axios
        .post(
          this.$store.state.ruta + "api/reporte/registrar/",
          {
            reporte: this.reporte,
            id_equipo: this.equipo.id
          },
          {
            headers: {
              token: this.$store.state.token,
            },
          }
        )
        .then((response) => {
          localStorage.setItem("idreporte", response.data.identificacion);

          this.esperaguardar = false;
          const identificacion = response.data.identificacion;
          console.log(response);
          this.$store.dispatch("guardarIdentificacion", {
            id: identificacion
          });
          console.log(identificacion)
          const nuevaVentanaURL = this.$router.resolve({ name: 'ImprimirReporte', params: { idreporte: identificacion.toString() } }).href;
          window.open(nuevaVentanaURL, '_blank', "width=800,height=600");
          this.$router.push({ name: "ListarEquipos" });
        })
        .catch((error) => {
          this.esperaguardar = false;
          console.log(error);
          return error;
        });
    },
    async guardarReporteInternoTallerCronograma() {
      this.reporte.firmacliente = "Taller";
      this.esperaguardar = true;

      try {
        const config = {
          headers: { token: this.$store.state.token }
        };

        // PATCH primero
        const responsePatch = await axios.patch(
          `${this.$store.state.ruta}api/equipo/actualizarcronograma`,
          {
            fechaDePreventivo: this.fechacalendariodefinalizacion,
            id_equipo: this.equipo.id
          },
          config
        );

        // POST después
        const response = await axios.post(
          this.$store.state.ruta + "api/reporte/registrar/",
          {
            reporte: this.reporte,
            id_equipo: this.equipo.id
          },
          config
        );

        const identificacion = response.data.identificacion;
        localStorage.setItem("idreporte", identificacion);
        this.$store.dispatch("guardarIdentificacion", { id: identificacion });

        const nuevaVentanaURL = this.$router.resolve({
          name: 'ImprimirReporte',
          params: { idreporte: identificacion.toString() }
        }).href;

        window.open(nuevaVentanaURL, '_blank', "width=800,height=600");
        this.$router.push({ name: "ListarEquipos" });

        this.confirmacionguardado = true;

      } catch (error) {
        console.error("Error al guardar el reporte:", error.response?.data || error.message);
      } finally {
        this.esperaguardar = false;
      }
    },
    guardarReporteInternoCampo() {

      this.save();
      this.esperaguardar = true;
      axios
        .post(
          this.$store.state.ruta + "api/reporte/registrar/",
          {
            reporte: this.reporte,
            id_equipo: this.equipo.id
          },
          {
            headers: {
              token: this.$store.state.token,
            },
          }
        )
        .then((response) => {
          localStorage.setItem("idreporte", response.data.identificacion);

          this.esperaguardar = false;
          const identificacion = response.data.identificacion;
          console.log(response);
          this.$store.dispatch("guardarIdentificacion", {
            id: identificacion
          });
          console.log(identificacion)
          const nuevaVentanaURL = this.$router.resolve({ name: 'ImprimirReporte', params: { idreporte: identificacion.toString() } }).href;
          window.open(nuevaVentanaURL, '_blank', "width=800,height=600");
          this.$router.push({ name: "ListarEquipos" });
        })
        .catch((error) => {
          this.esperaguardar = false;
          console.log(error);
          return error;
        });
    },
    async guardarReporteInternoCampoCronograma() {
      this.save();
      this.esperaguardar = true;

      try {
        const config = {
          headers: { token: this.$store.state.token }
        };

        // PATCH primero
        const responsePatch = await axios.patch(
          `${this.$store.state.ruta}api/equipo/actualizarcronograma`,
          {
            fechaDePreventivo: this.fechacalendariodefinalizacion,
            id_equipo: this.equipo.id
          },
          config
        );

        // POST después
        const response = await axios.post(
          this.$store.state.ruta + "api/reporte/registrar/",
          {
            reporte: this.reporte,
            id_equipo: this.equipo.id
          },
          config
        );

        const identificacion = response.data.identificacion;
        localStorage.setItem("idreporte", identificacion);
        this.$store.dispatch("guardarIdentificacion", { id: identificacion });

        const nuevaVentanaURL = this.$router.resolve({
          name: 'ImprimirReporte',
          params: { idreporte: identificacion.toString() }
        }).href;

        window.open(nuevaVentanaURL, '_blank', "width=800,height=600");
        this.$router.push({ name: "ListarEquipos" });

        this.confirmacionguardado = true;

      } catch (error) {
        console.error("Error al guardar el reporte:", error.response?.data || error.message);
      } finally {
        this.esperaguardar = false;
      }
    },
    guardarReporteInternoRemoto() {

      this.reporte.firmacliente = "Soporte remoto";
      this.esperaguardar = true;
      axios
        .post(
          this.$store.state.ruta + "api/reporte/registrar/",
          {
            reporte: this.reporte,
            id_equipo: this.equipo.id
          },
          {
            headers: {
              token: this.$store.state.token,
            },
          }
        )
        .then((response) => {
          localStorage.setItem("idreporte", response.data.identificacion);

          this.esperaguardar = false;
          const identificacion = response.data.identificacion;
          console.log(response);
          this.$store.dispatch("guardarIdentificacion", {
            id: identificacion
          });
          console.log(identificacion)
          const nuevaVentanaURL = this.$router.resolve({ name: 'ImprimirReporte', params: { idreporte: identificacion.toString() } }).href;
          window.open(nuevaVentanaURL, '_blank', "width=800,height=600");
          this.$router.push({ name: "ListarEquipos" });
        })
        .catch((error) => {
          this.esperaguardar = false;
          console.log(error);
          return error;
        });
    },
    async guardarReporteInternoRemotoCronograma() {
      this.reporte.firmacliente = "Soporte remoto";
      this.esperaguardar = true;

      try {
        const config = {
          headers: { token: this.$store.state.token }
        };

        // PATCH primero
        const responsePatch = await axios.patch(
          `${this.$store.state.ruta}api/equipo/actualizarcronograma`,
          {
            fechaDePreventivo: this.fechacalendariodefinalizacion,
            id_equipo: this.equipo.id
          },
          config
        );

        // POST después
        const response = await axios.post(
          this.$store.state.ruta + "api/reporte/registrar/",
          {
            reporte: this.reporte,
            id_equipo: this.equipo.id
          },
          config
        );

        const identificacion = response.data.identificacion;
        localStorage.setItem("idreporte", identificacion);
        this.$store.dispatch("guardarIdentificacion", { id: identificacion });

        const nuevaVentanaURL = this.$router.resolve({
          name: 'ImprimirReporte',
          params: { idreporte: identificacion.toString() }
        }).href;

        window.open(nuevaVentanaURL, '_blank', "width=800,height=600");
        this.$router.push({ name: "ListarEquipos" });

        this.confirmacionguardado = true;

      } catch (error) {
        console.error("Error al guardar el reporte:", error.response?.data || error.message);
      } finally {
        this.esperaguardar = false;
      }
    },
    /**
     * Prepara y comienza la secuencia de preguntas al cambiar el tipo de asistencia.
     */
    iniciarCuestionario() {
      // Reiniciar estado
      this.respuestapreguntas = 0;
      this.cuestionarioCompleto = false;
      this.preguntasPendientes = [];
      this.dialogoAbierto = false; // Asegurar que el diálogo esté cerrado al inicio

      const reglasAsistencia = this.reglas[this.reporte.tipodeasistencia];
      if (!reglasAsistencia) {
        console.error("Tipo de asistencia no reconocido:", this.reporte.tipodeasistencia);
        return;
      }

      // 1. Crear la cola de preguntas a realizar (solo las que tienen valor 1)
      for (const clave in reglasAsistencia) {
        if (reglasAsistencia[clave] === 1) {
          this.preguntasPendientes.push({
            clave: clave,
            valor: this.valoresPreguntas[clave],
            texto: this.textoPreguntas[clave],
          });
        }
      }

      // 2. Iniciar el flujo de diálogos
      this.procesarSiguientePregunta();
    },

    /**
     * Muestra la siguiente pregunta pendiente.
     */
    procesarSiguientePregunta() {
      if (this.preguntasPendientes.length > 0) {
        // Extrae la primera pregunta de la cola (funciona como un FIFO)
        this.preguntaActual = this.preguntasPendientes.shift();
        this.dialogoAbierto = true; // Abre el diálogo
      } else {
        // La cola está vacía, finalizar el cuestionario
        this.dialogoAbierto = false;
        this.preguntaActual = null;
        this.guardarReporte();
      }
    },

    /**
     * Maneja la respuesta del usuario (Sí/No) y actualiza la puntuación.
     * @param {boolean} respuesta - true si es 'Sí', false si es 'No'.
     */
    responderPregunta(respuesta) {
      // 1. Puntuación
      if (respuesta) {
        this.respuestapreguntas += this.preguntaActual.valor;
      }

      // 2. REGLA CONDICIONAL: Si la pregunta actual es Remoto y la respuesta es 'Sí'
      if (this.preguntaActual.clave === 'remoto' && respuesta === true) {
        // Buscar el índice de la pregunta 'campo' en la cola de pendientes
        const indiceCampo = this.preguntasPendientes.findIndex(p => p.clave === 'campo');

        if (indiceCampo !== -1) {
          // Si se encuentra, la eliminamos de la cola.
          // Al eliminarla, se omite su pregunta y no se suma su valor (10), 
          // cumpliendo con la regla de "asignarle un cero".
          this.preguntasPendientes.splice(indiceCampo, 1);
          console.log("REGLA APLICADA: Pregunta 'Campo' omitida y asignada a cero, debido a respuesta 'Sí' en 'Remoto'.");
        }
      }

      // 3. Continuar a la siguiente pregunta
      this.dialogoAbierto = false;
      this.$nextTick(() => {
        this.procesarSiguientePregunta();
      });
    },
    async guardarReporteExterno() {
      this.esperaguardar = true;

      try {
        if (!this.files) {
          throw new Error("Debe seleccionar un archivo antes de guardar.");
        }

        if (!this.reporte || !this.equipo || !this.equipo.id) {
          throw new Error("Datos del reporte o equipo incompletos.");
        }
        console.log('Equipo.id', this.equipo.id)
        console.log(typeof (this.equipo.id))
        const formData = new FormData();
        formData.append('file', this.files);
        formData.append('id_equipo', JSON.stringify(this.equipo.id));
        formData.append('reporte', JSON.stringify(this.reporte));

        const response = await axios.post(
          `${this.$store.state.ruta}api/s3/guardar`,
          formData,
          {
            headers: {
              token: this.$store.state.token
            },
          }
        );

        const identificacion = response.data.id;
        localStorage.setItem("idreporte", identificacion);

        console.log("Reporte creado:", response);
        this.esperaguardar = false;
        this.confirmacionguardado = true;
        // Despachar acción al store
        this.$store.dispatch("guardarIdentificacion", { id: identificacion });




      } catch (error) {
        console.error("Error al guardar el reporte:", error.response?.data || error.message);
      } finally {
        this.esperaguardar = false;
      }
    },

    async guardarReporteExternoCronograma() {
      this.esperaguardar = true;

      try {
        if (!this.files) throw new Error("Debe seleccionar un archivo antes de guardar.");
        if (!this.reporte || !this.equipo?.id) throw new Error("Datos del reporte o equipo incompletos.");

        const formData = new FormData();
        formData.append('file', this.files);
        formData.append('id_equipo', this.equipo.id.toString());
        formData.append('reporte', JSON.stringify(this.reporte));
        formData.append('fechaDePreventivo', this.fechacalendariodefinalizacion);

        const config = {
          headers: { token: this.$store.state.token }
        };

        const response = await axios.post(`${this.$store.state.ruta}api/s3/guardar`, formData, config);
        const identificacion = response.data.id;

        localStorage.setItem("idreporte", identificacion);
        this.$store.dispatch("guardarIdentificacion", { id: identificacion });
        console.log('Equipo.id', this.equipo.id)
        console.log('fechacalendariodefinalizacion', this.fechacalendariodefinalizacion)
        const responsePatch = await axios.patch(
          `${this.$store.state.ruta}api/equipo/actualizarcronograma`,
          {
            fechaDePreventivo: this.fechacalendariodefinalizacion,
            id_equipo: this.equipo.id
          },
          config
        );

        console.log("Reporte creado:", response);
        console.log("Fecha actualizada:", responsePatch);
        this.confirmacionguardado = true;

      } catch (error) {
        console.error("Error al guardar el reporte:", error.response?.data || error.message);
      } finally {
        this.esperaguardar = false;
      }
    },
    AceptarConfirmacionGuardado() {
      this.confirmacionguardado = false;
      // Redirigir a la lista de equipos
      this.$router.push({ name: "ListarEquipos" });

    },
    onFileChange(files) {
      // Si no hay archivos seleccionados, establecer 'files' como null
      this.files = files && files.length > 0 ? files[0] : null;
      console.log('Archivo seleccionado:', this.files);
    },
    seleccionGuardarReporteExterno() {
      if (
        this.equipo.referencia.periodicidadmantenimiento !== "Libre de mantenimiento" &&
        [
          "Mantenimiento preventivo",
          "Instalación",
          "Mantenimiento preventivo y correctivo",
          "Alistamiento",
          "Instalación y entrenamiento"
        ].includes(this.reporte.tipodeasistencia)
      ) {
        this.dialogoPreguntarCronograma = true;
      } else {
        this.guardarReporteExterno();
      }
    },
    seleccionGuardarReporteInterno() {
      if (
        this.equipo.referencia.periodicidadmantenimiento !== "Libre de mantenimiento" &&
        [
          "Mantenimiento preventivo",
          "Instalación",
          "Mantenimiento preventivo y correctivo",
          "Alistamiento",
          "Instalación y entrenamiento"
        ].includes(this.reporte.tipodeasistencia)
      ) {
        this.dialogoPreguntarCronogramaInterno = true;
      } else {
        this.guardarReporte();
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
</style>
