<template>
  <form >
    <v-row class="pa-2 mt-16"  >
      
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
          <v-text-field v-model="equipo.nombre" label="Nombre" disabled class="centered-input"></v-text-field>
        </v-col>
        <v-col cols="12" lg="6">
          <v-text-field v-model="equipo.marca" label="Marca" disabled class="centered-input"></v-text-field>
        </v-col>
        <v-col cols="12" lg="6">
          <v-text-field v-model="equipo.serie" label="Serie" disabled class="centered-input"></v-text-field>
        </v-col>
        <v-col cols="12" lg="6">
          <v-text-field v-model="equipo.propietario.nombre" label="Propietario" disabled
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
          <v-text-field v-model="equipo.cliente.nombre" label="Nombre / Razón social" disabled
            class="centered-input"></v-text-field>
        </v-col>
        <v-col cols="12" lg="6">
          <v-text-field v-model="equipo.cliente.nit" label="NIT" disabled class="centered-input"></v-text-field>
        </v-col>
        <v-col cols="12" lg="6">
          <v-text-field v-model="equipo.ubicacionnombre" label="Sede" disabled class="centered-input"></v-text-field>
        </v-col>
        <v-col cols="12" lg="6">
          <v-text-field v-model="equipo.ubicaciondireccion" label="Dirección" disabled
            class="centered-input"></v-text-field>
        </v-col>
        <v-col cols="12" lg="6">
          <v-text-field v-model="reporte.profesionalcliente" label="Nombre del profesional" required
            :rules="[(v) => !!v || 'Campo Requerido']"></v-text-field>
        </v-col>
        <v-col cols="12" lg="6">
          <v-text-field v-model="reporte.telefonocliente" :rules="[(v) => !!v || 'Campo Requerido']"
            label="Telefono del Profesional" required></v-text-field>
        </v-col>
      </v-row>
      <v-divider class="mb-5 mt-5"></v-divider>
      <v-row>
        <v-col cols="12" align-self="center">
          <div class="gridtitulo">Detalles de la asistencia :</div>
        </v-col>
      </v-row>
      <v-row justify="space-around">
        <v-col cols="12" md="3">
          <v-select v-model="reporte.tipodeasistencia" :items="tipodeasistencia" label="Tipo de asistencia" required
            :rules="[(v) => !!v || 'Campo Requerido']"></v-select>
        </v-col>

        <v-col cols="12" md="3" class="mt-5">
          <v-slider color="c6" label="Duración (Horas)" v-model="reporte.duracion" thumb-label="always" max="15" min="0.5"
            step="0.25"></v-slider>
        </v-col>
        <v-col cols="12" md="3">
          <v-menu
            v-model="menu1"
            :close-on-content-click="false"         
            min-width="auto"
          >
            <template v-slot:activator="{props}">
              <v-text-field
                v-model="reporte.fechadeinicio"
                label="Fecha de inicio"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="props"
               
              ></v-text-field>
            </template>
            <v-locale-provider locale="es">
            <v-date-picker
            locale="es"
            @update:model-value="cambiarEstadoDeMenu1"
              v-model="fechadeiniciocalendario"
              
              color="primary"
              title="Fecha de inicio"
        header="Seleccionar Fecha"
            ></v-date-picker></v-locale-provider>
          </v-menu>
        </v-col>
        <v-col cols="12" md="3" >
          <v-menu
            v-model="menu2"
            :close-on-content-click="false"            
            transition="scale-transition"            
            min-width="auto"           
          >
            <template v-slot:activator="{ props }">
              <v-text-field
                v-model="reporte.fechadefinalizacion"
                label="Fecha de finalización"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="props"
                
              ></v-text-field>
            </template>
            <v-locale-provider locale="es">
            <v-date-picker
            locale="es"
            @update:model-value="cambiarEstadoDeMenu2"
              v-model="fechadefinalizacioncalendario"
              color="primary"
              title="Fecha de finalización"
        header="Seleccionar Fecha"
            ></v-date-picker></v-locale-provider>
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
            placeholder="Describa las fallas reportadas por el usuario y los hallazgos" rows="3" row-height="30" auto-grow
            :maxlength="250" :rules="[(v) => !!v || 'Campo Requerido']"></v-textarea>
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
            :maxlength="250" :rules="[(v) => !!v || 'Campo Requerido']"></v-textarea>
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
            placeholder="Liste las pruevas realizadas para verificar el adecuado funcionamiento del equipo" rows="3"
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
            placeholder="Código - Descripción - Cantidad" rows="3" row-height="30" auto-grow :maxlength="250"
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
            rows="3" row-height="30" auto-grow :maxlength="250" :rules="[(v) => !!v || 'Campo Requerido']"></v-textarea>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" lg="6" align="center">
          <div class="lafirma">
            <VueSignaturePad id="signature" height="200px" width="350px" ref="signaturePad" :options="options" />
          </div>
          <v-text-field v-model="reporte.profesionalcliente" disabled class="centered-input"></v-text-field>
          <p disabled class="centered-input">Recibe a satisfacción</p>
          <v-col cols="6" lg="5" align="center">
            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn color="c6" 
          
          min-width="228"
          
          size="large"
          
          variant="flat"
        large @click="undo">
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
          <v-text-field v-model="reporte.ingeniero" disabled class="centered-input"></v-text-field>
          <p disabled class="centered-input">Responsable del soporte</p>
          <v-card-actions>
            <v-col cols="12" lg="12" align="center">
              <v-btn color="c6" 
          
          min-width="228"
          
          size="large"
          
          variant="flat"
        large @click="guardarReporte" :disabled="!(
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
          <v-select v-model="reporte.tipodeasistencia" :items="tipodeasistencia" label="Tipo de asistencia" required
            :rules="[(v) => !!v || 'Campo Requerido']"></v-select>
        </v-col>


        <v-col cols="12" md="4">
          <v-menu v-model="menu1" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y
            min-width="auto">
            <template v-slot:activator="{ on, attrs }">
              <v-text-field v-model="reporte.fechadeinicio" label="Fecha de inicio" prepend-icon="mdi-calendar" readonly
                v-bind="attrs" v-on="on"></v-text-field>
            </template>
            <v-date-picker v-model="reporte.fechadeinicio" @input="menu1 = false"></v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="12" md="4">
          <v-menu v-model="menu2" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y
            min-width="auto">
            <template v-slot:activator="{ on, attrs }">
              <v-text-field v-model="reporte.fechadefinalizacion" label="Fecha de finalización"
                prepend-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"></v-text-field>
            </template>
            <v-date-picker v-model="reporte.fechadefinalizacion" @input="menu2 = false"></v-date-picker>
          </v-menu>
        </v-col>
      </v-row>
      <v-divider class="mb-5 mt-5"></v-divider>
      <v-row justify="space-around">
        <v-col cols="12" md="6">
          <v-file-input v-model="files" placeholder="Seleccione el reporte" label="Reporte" multiple
            prepend-icon="mdi-paperclip" accept="image/png, image/jpeg, image/bmp">
            <template v-slot:selection="{ text }">
              <v-chip small label color="primary">
                {{ text }}
              </v-chip>
            </template>
          </v-file-input>
        </v-col>
      </v-row>
      <v-row>





        <v-spacer> </v-spacer>
        <v-btn class="blue darken-1 ma-1" @click="guardarReporte" :disabled="!(
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
    </v-container>

    <!-- <pre>
      
       {{reporte}}
      </pre> -->
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
    files: [],
    slider: null,
    dialogofirma: false,
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
      "Mantenimiento preventivo",
      "Mantenimiento correctivo",
      "Mantenimiento preventivo y correctivo",
      "Desinstalación",
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
    cambiarEstadoDeMenu1(fechaseleccionadaincio) {
      
      this.reporte.fechadeinicio=fechaseleccionadaincio.getDate()+'-'+(fechaseleccionadaincio.getMonth() + 1 )+'-'+fechaseleccionadaincio.getFullYear(); // Los meses en JavaScript van de 0 a 11
      
    this.menu1 = !this.menu1;
    },
    cambiarEstadoDeMenu2(fechaseleccionadafinalizacion) {
      this.reporte.fechadefinalizacion=fechaseleccionadafinalizacion.getDate()+'-'+(fechaseleccionadafinalizacion.getMonth() + 1 )+'-'+fechaseleccionadafinalizacion.getFullYear(); // Los meses en JavaScript van de 0 a 11
      this.menu2 = !this.menu2;
    },
    submit() {
      this.dialogofirma = true;
    },

    consultarequipo() {
      this.equipo = JSON.parse(localStorage.getItem("equipo"));
      this.reporte.infoequipo.nombre = this.equipo.nombre;
      this.reporte.infoequipo.serie = this.equipo.serie;
      this.reporte.infoequipo.marca = this.equipo.marca;
      this.reporte.propietario = this.equipo.propietario.nombre;
      this.reporte.nombrecliente = this.equipo.cliente.nombre;
      this.reporte.nitcliente = this.equipo.cliente.nit;
      this.reporte.sedecliente = this.equipo.ubicacionnombre;
      this.reporte.direccioncliente = this.equipo.ubicaciondireccion;

      //localStorage.removeItem('equipo')
    },
    buscarfirma() {
      //va a ir a mi backend y me traerá las peticiones de la base de datos
      axios
        .get(this.$store.state.ruta + "api/firma/buscar", {
          headers: {
            token: this.$store.state.token,
          },
        })
        .then((response) => {
          this.reporte.firmaingeniero = response.data[0].firma; //el this es porque no es propia de la funcion sino de l componente
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
      this.dialogofirma = false;
    },
    guardarReporte() {
      this.save();
      this.esperaguardar = true;
      axios
        .post(
          this.$store.state.ruta + "api/reporte/registrar/",
          {
            reporte: this.reporte,
            id_equipo: this.equipo._id
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
          const nuevaVentanaURL = this.$router.resolve({ name: 'ImprimirReporte', params:{idreporte:identificacion.toString()} }).href;
          window.open(nuevaVentanaURL, '_blank',"width=800,height=600");
          this.$router.push({ name: "ListarEquipos" });
        })
        .catch((error) => {
          this.esperaguardar = false;
          console.log(error);
          return error;
        });
    },
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