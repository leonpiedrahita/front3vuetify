<template>
    <form>
      <v-container class="pa-10">
        <v-divider class="mb-5 mt-5"></v-divider>
        <v-row>
          <v-col cols="12" align-self="center">
            <div class="gridtitulo">Informacion general del equipo :</div>
          </v-col>
        </v-row>
        <v-row justify="space-between">
          <v-col cols="12" lg="6">
            <v-text-field
              v-model="equipo.nombre"
              label="Nombre"
              class="centered-input"
              required
              :rules="[(v) => !!v || 'Campo Requerido']"
            ></v-text-field>
          </v-col>
          <v-col cols="12" lg="6">
            <v-text-field
              v-model="equipo.marca"
              label="Marca"
              class="centered-input"
              required
              :rules="[(v) => !!v || 'Campo Requerido']"
            ></v-text-field>
          </v-col>
          <v-col cols="12" lg="6">
            <v-text-field
              v-model="equipo.fabricante"
              label="Fabricante"
              class="centered-input"
              required
              :rules="[(v) => !!v || 'Campo Requerido']"
            ></v-text-field>
          </v-col>
          <v-col cols="12" lg="6">
            <v-text-field
              v-model="equipo.servicio"
              label="Servicio"
              class="centered-input"
              required
              :rules="[(v) => !!v || 'Campo Requerido']"
            ></v-text-field>
          </v-col>
  
          <v-col cols="12" md="6">
            <v-select
              v-model="equipo.clasificacionriesgo"
              :items="clasificacionriesgo"
              label="Clasificacion de riesgo"
              required
              :rules="[(v) => !!v || 'Campo Requerido']"
            ></v-select>
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="equipo.periodicidadmantenimiento"
              :items="periodicidadmantenimiento"
              label="Periodicidad de mantenimiento"
              required
              :rules="[(v) => !!v || 'Campo Requerido']"
            ></v-select>
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
            <v-text-field
              v-model="equipo.alto"
              label="Alto (cm)"
              class="centered-input"
              required
              :rules="[(v) => !!v || 'Campo Requerido']"
            ></v-text-field>
          </v-col>
          <v-col cols="12" lg="6">
            <v-text-field
              v-model="equipo.ancho"
              label="Ancho (cm)"
              class="centered-input"
              required
              :rules="[(v) => !!v || 'Campo Requerido']"
            ></v-text-field>
          </v-col>
          <v-col cols="12" lg="6">
            <v-text-field
              v-model="equipo.profundo"
              label="Profundidad (cm)"
              class="centered-input"
              required
              :rules="[(v) => !!v || 'Campo Requerido']"
            ></v-text-field>
          </v-col>
          <v-col cols="12" lg="6">
            <v-text-field
              v-model="equipo.peso"
              label="Peso (kg)"
              class="centered-input"
              required
              :rules="[(v) => !!v || 'Campo Requerido']"
            ></v-text-field>
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
            <v-text-field
              v-model="equipo.voltaje"
              label="Voltade de entrada (VAC)"
              class="centered-input"
              required
              :rules="[(v) => !!v || 'Campo Requerido']"
            ></v-text-field>
          </v-col>
          <v-col cols="12" lg="3">
            <v-text-field
              v-model="equipo.corriente"
              label="Corriente de entrada (A)"
              class="centered-input"
              required
              :rules="[(v) => !!v || 'Campo Requerido']"
            ></v-text-field>
          </v-col>
          <v-col cols="12" lg="3">
            <v-text-field
              v-model="equipo.potencia"
              label="Potencia (VA)"
              class="centered-input"
              required
              :rules="[(v) => !!v || 'Campo Requerido']"
            ></v-text-field>
          </v-col>
  
          <v-col cols="12" lg="3">
            <v-text-field
              v-model="equipo.principiodemedicion"
              label="Principio de medición"
              class="centered-input"
              required
              :rules="[(v) => !!v || 'Campo Requerido']"
            ></v-text-field>
          </v-col>
          <v-col cols="12" lg="3">
            <v-text-field
              v-model="equipo.pruebasporhora"
              label="Pruebas por hora"
              class="centered-input"
              required
              :rules="[(v) => !!v || 'Campo Requerido']"
            ></v-text-field>
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
            <v-text-field
              v-model="equipo.temperatura"
              label="Temperatura (°C)"
              class="centered-input"
              required
              :rules="[(v) => !!v || 'Campo Requerido']"
            ></v-text-field>
          </v-col>
          <v-col cols="12" lg="3">
            <v-text-field
              v-model="equipo.humedad"
              label="Humedad Relativa (%)"
              class="centered-input"
              required
              :rules="[(v) => !!v || 'Campo Requerido']"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="equipo.agua"
              :items="sino"
              label="Requiere toma de agua desionizada"
              required
              :rules="[(v) => !!v || 'Campo Requerido']"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="equipo.desague"
              :items="sino"
              label="Requiere desagüe"
              required
              :rules="[(v) => !!v || 'Campo Requerido']"
            ></v-select>
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
            <v-textarea
              v-model="equipo.recomendaciones"
              counter
              clearable
              autocomplete
              placeholder="Describa las recomendaciones dadas por el fabricante"
              rows="3"
              row-height="30"
              auto-grow
              :maxlength="250"
              :rules="[(v) => !!v || 'Campo Requerido']"
            ></v-textarea>
          </v-col>
        </v-row>
        <v-row>
          <v-spacer> </v-spacer>
          <v-btn
          v-if="nuevareferencia"
            :disabled="
              !(
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
            "
            class="c6"
            x-large
            @click="GuardarFinalizar()"
          >
            Guardar nueva referencia
          </v-btn>
          <v-btn
          v-else
            :disabled="
              !(
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
            "
            class="c6"
            x-large
            @click="ActualizarFinalizar()"
          >
            Actualizar referencia
          </v-btn>
          <v-spacer> </v-spacer>
        </v-row>
  
        <v-dialog v-model="esperarguardar" persistent width="500">
          <v-card color="c6" dark>
            <v-card-text>
              Por favor espere...
              <v-progress-linear
                indeterminate
                color="white"
                class="mb-0"
              ></v-progress-linear>
            </v-card-text>
          </v-card>
        </v-dialog>
  
        <v-dialog
          transition="dialog-bottom-transition"
          max-width="600"
          persistent
          v-model="confirmacionguardado"
        >
          <v-card>
            <v-toolbar class="text-h4" color="primary" dark>¡Genial!</v-toolbar>
            <v-card-text>
              <div class="text-h5 pa-5">
                La nueva referencia de equipo se ha guardado exitosamente.
              </div>
            </v-card-text>
            <v-card-actions class="justify-center">
              <v-btn class="c6" @click="AceptarConfirmacionGuardado"
                >Aceptar</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
  
   <!--    <pre>
      
       {{ this.$store.state.referenciaequipo }}
      </pre> -->
    </form>
  </template>
  <script>
  import axios from "axios";
  export default {
    name: "FormularioRefEquiposComponent",
  
    data: () => ({
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
    }),
  
    computed: {},
    created() {
      this.equipo = this.$store.state.referenciaequipo;
      this.nuevareferencia = this.$store.state.nuevareferencia;
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
              this.equipo._id,
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
        this.$router.push({ name: "ListarRefEquipos" });
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