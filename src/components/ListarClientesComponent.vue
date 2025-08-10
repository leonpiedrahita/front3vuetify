<template>
  <v-card class="pa-2 ">
    <!-- se crea la data table prinecipal para listar los clientes -->
    <v-data-table :headers="headersfiltrados" :items="equipos" :expanded.sync="expanded" show-expand single-expand
      :search="search" class="elevation-1" item-value="nit" :loading="cargando"
      loading-text="Cargando ... por favor espere"><!-- Se crea la data table secundaria para listar las sedes -->
      <template v-slot:expanded-row="{ columns, item }">
        <td :colspan="columns.length">
          <div class="sp-details" justify="center">
            <div class="col-xs-5 col-md-8 text-center">
              <v-data-table v-if="item.sedes && item.sedes.length" :headers="encabezadofiltrado" :items="item.sedes"
                hide-default-footer>
                <template v-slot:[`item.eliminarsede`]="{ item }">
                  <v-icon medium @click="deleteItem(item)">
                    mdi-delete-empty
                  </v-icon>
                </template>
              </v-data-table>
              <div v-else class="text-subtitle-1 pa-4 grey--text">
                Este cliente no tiene sedes registradas.
              </div>
            </div>
          </div>
        </td>
      </template>
      <!-- Encabledazo de la página -->
      <template v-slot:top>
        <v-toolbar flat>
          <v-row justify="space-around">

            <v-col cols="6" sm="5">
              <v-text-field v-model="search" append-icon="mdi-magnify"
                label="Buscar: Cliente / NIT / Ciudad Ppal / Dirección Ppal" single-line hide-details></v-text-field>
            </v-col>

            <v-col cols="6" sm="2">
              <v-btn v-permission="['administrador', 'cotizaciones']" color="c6" min-width="228" size="large"
                variant="flat" large @click="nuevoCliente()"> Nuevo Cliente
              </v-btn>
            </v-col>

          </v-row>
          <!-- Dialogo para editar Cliente -->
          <v-dialog v-model="dialog" max-width="500px">
            <v-card>
              <v-card-title>
                <span class="headline">{{ titulocliente }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field v-model="editedItem.nombre" label="Nombre/Razón Social"
                        :rules="[(v) => !!v || 'Campo Requerido']" required class="centered-input"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field v-model="editedItem.nit" label="NIT" :rules="[(v) => !!v || 'Campo Requerido']"
                        required class="centered-input"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-autocomplete label="Ciudad" v-model="editedItem.sedePrincipal.ciudad" :items="municipios"
                        clearable :rules="[(v) => !!v || 'Campo Requerido']" required class="centered-input" />
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field v-model="editedItem.sedePrincipal.direccion" label="Direccion"
                        :rules="[(v) => !!v || 'Campo Requerido']" required class="centered-input"></v-text-field>
                    </v-col>

                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error darken-1" text @click="cerrareditar">
                  Cancelar
                </v-btn>
                <v-btn :disabled="!(
                  /* editedItem.contactoprincipal[0].telefono &&
                  editedItem.contactoprincipal[0].nombre && */
                  editedItem.nit &&
                  editedItem.nombre && editedItem.sedePrincipal.ciudad &&
                  editedItem.sedePrincipal.direccion
                )
                  " color="primary darken-1" text @click="editar" v-if="Editarcliente">
                  Editar
                </v-btn>
                <v-btn :disabled="!(
                  /* editedItem.contactoprincipal[0].telefono &&
                  editedItem.contactoprincipal[0].nombre && */
                  editedItem.nit &&
                  editedItem.nombre && editedItem.sedePrincipal.ciudad &&
                  editedItem.sedePrincipal.direccion

                )
                  " color="primary darken-1" text @click="agregarCliente" v-if="Agregarcliente">
                  Agregar
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <!-- Dialogo para agregar Sede -->
          <v-dialog v-model="dialog2" max-width="700px">
            <v-card>
              <v-card-title>
                <span class="headline">{{ titulosede }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>

                    <v-col cols="12" sm="12" md="12">
                      <v-autocomplete label="Ciudad" v-model="editedItem2.sedePrincipal.ciudad" :items="municipios"
                        clearable :rules="[(v) => !!v || 'Campo Requerido']" required class="centered-input" />
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field v-model="editedItem2.sedePrincipal.direccion" label="Direccion"
                        :rules="[(v) => !!v || 'Campo Requerido']" required class="centered-input"></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error darken-1" text @click="cerraragregarsede">
                  Cancelar
                </v-btn>
                <v-btn :disabled="!(editedItem2.sedePrincipal.ciudad && editedItem2.sedePrincipal.direccion)"
                  color="primary darken-1" text @click="agregarnuevasede">
                  Agregar
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <!-- Diálogo para eliminar sede -->
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="text-h5">¿Desea eliminar la sede?</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error darken-1" text @click="cerrareliminarsede">Cancelar</v-btn>
                <v-btn color="primary darken-1" text @click="save3">Aceptar</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>

      <template v-slot:[`item.editarsede`]="{ item }">
        <div>
          <v-icon style="margin-right: 10px" medium @click="editItem(item)">
            mdi-pencil
          </v-icon>
        </div>
      </template>
      <template v-slot:[`item.agregarsede`]="{ item }">
        <div>
          <v-icon style="margin-left: 10px" medium @click="editItem2(item)">
            mdi-map-marker-plus
          </v-icon>
        </div>
      </template>
    </v-data-table>

    <v-col cols="auto">
      <v-dialog transition="dialog-top-transition" max-width="500" v-model="dialogo">

        <v-card>
          <v-toolbar color="error" dark class="text-h3 d-flex justify-center">Aviso!!!</v-toolbar>
          <v-card-text>
            <div class="text-h3 pa-1 ma-1 aviso">
              {{ $data.textodialogo }}
            </div>
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn text @click="(dialogo = false), (textodialogo = '')">Cerrar</v-btn>
          </v-card-actions>
        </v-card>

      </v-dialog>
    </v-col>
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
            {{ mensajeDialogo }}
          </div>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn class="c6" @click="AceptarConfirmacionGuardado">Aceptar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- <p>{{ this.equipos }}</p> -->
  </v-card>
</template>
<script>
import axios from "axios";
import municipiosData from "@/data/municipios.json";
export default {
  name: "ListarClientesComponent",
  data: () => ({
    confirmacionguardado: false,
    mensajeDialogo: "",
    ciudadSeleccionada: null,
    municipios: municipiosData.map(m => m.label), // ya viene como array de objetos con la clave "label"
    expanded: [],
    input1: "",
    Editarcliente: false,
    Agregarcliente: false,
    dialogo: false,
    textodialogo: "",
    dialog: false,
    dialog2: false,
    dialogDelete: false,
    search: "",
    cargando: true,
    esperarguardar: false,
    encabezado: [
      {
        title: "Ciudad",
        value: "ciudad",
        align: "center",
        class: "titulo--text font-weight-bold",
        width: "50%",
      },
      {
        title: "Dirección",
        value: "direccion",
        align: "center",
        class: "titulo--text font-weight-bold",
        width: "50%",
      },
      {
        title: "Eliminar sede",
        value: "eliminarsede",
        sortable: false,
        class: "titulo--text font-weight-bold ",
        width: "50%",
        roles: ["administrador", "cotizaciones"],
      },
    ],
    headers: [
      {
        title: "Nombre/Razón social",
        align: "center",
        key: "nombre",
        class: "titulo--text font-weight-bold",
      },
      {
        title: "NIT",
        key: "nit",
        align: "center",
        class: "titulo--text font-weight-bold",
      },
      {
        title: "Ciudad Ppal",
        key: "sedePrincipal.ciudad",
        align: "center",
        class: "titulo--text font-weight-bold",
      },
      {
        title: "Dirección Ppal",
        value: "sedePrincipal.direccion",
        align: "center",
        divider: true,
        class: "titulo--text font-weight-bold",
      },
      {
        title: "Editar cliente",
        value: "editarsede",
        sortable: false,
        align: "center",
        class: "titulo--text font-weight-bold",
        roles: ["administrador", "cotizaciones"],
      },
      {
        title: "Agregar Sede",
        value: "agregarsede",
        sortable: false,
        align: "center",
        class: "titulo--text font-weight-bold",
        roles: ["administrador", "cotizaciones"],
      },
    ],

    editedIndex: -1,
    equipos: [],
    prueba: {},
    editedItem: {
      nit: "",
      nombre: "",
      sedePrincipal: {
        ciudad: "",
        direccion: "",
        // Puedes hacerlo dinámico si es necesario
      },
      /* contactoprincipal: [{}], */
    },
    editedItem2: {
      ciudad: "",
      direccion: "",
      sedePrincipal: {
        ciudad: "",
        direccion: "",
        // Puedes hacerlo dinámico si es necesario
      },
    },
    defaultItem: {
      nit: "",
      nombre: "",
      sedePrincipal: {
        ciudad: "",
        direccion: "",
        // Puedes hacerlo dinámico si es necesario
      },
      /* contactoprincipal: [
        {
          nombre: "",
          telefono: "",
        },
      ], */
    },
    defaultItem2: {
      nombre: "",
      direccion: "",
      sedePrincipal: {
        ciudad: "",
        direccion: "",
        // Puedes hacerlo dinámico si es necesario
      },
    },
  }),


  computed: {
    titulocliente() {
      return "Editar cliente";
    },
    titulosede() {
      return "Agregar sede";
    },
    headersfiltrados() {
      // Filtra las columnas según los permisos
      return this.headers.filter(column => {
        // Si la columna no tiene roles, se muestra para todos
        if (!column.roles) return true;

        // Si tiene roles, verifica si el rol del usuario está permitido
        return column.roles.includes(this.$store.state.user.rol);
      });
    },
    encabezadofiltrado() {
      // Filtra las columnas según los permisos
      return this.encabezado.filter(column => {
        // Si la columna no tiene roles, se muestra para todos
        if (!column.roles) return true;

        // Si tiene roles, verifica si el rol del usuario está permitido
        return column.roles.includes(this.$store.state.user.rol);
      });
    }

  },

  watch: {
    dialog(val) {
      val || this.cerrareditar();
    },
    dialog2(val) {
      val || this.cerraragregarsede();
    },
    dialogDelete(val) {
      val || this.cerrareliminarsede();
    },
  },
  beforeCreate() {
    this.$store.dispatch("autoLogin");
    if (this.$store.state.existe === 0) {
      this.$router.push({ name: "Login" });
    }
    this.$store.dispatch("guardarUbicacion", {
      ubicacion: "Clientes",
      icono: "mdi-account-box-multiple",
      color: "c6",
    });
  },
  created() {
    if (this.$store.state.existe === 0) {
      this.$router.push({ name: "Login" });
    } else {
      this.listar();
    }
  },

  methods: {
    listar() {
      //va a ir a mi backend y me traerá las peticiones de la base de datos
      axios
        .get(this.$store.state.ruta + "api/cliente/listar", {
          headers: {
            token: this.$store.state.token,

          },

        })
        .then((response) => {
          this.equipos = response.data; //el this es porque no es propia de la funcion sino de l componente

          this.cargando = false;
          /* this.equipos.contactoprincipal =
            this.equipos.contactoprincipal[this.equipos.contactoprincipal.length - 1]; */
          //console.log(error);
        })
        .catch((error) => {
          console.log(error);
          return error;
        });
    },
    nuevoCliente() {
      this.$store.dispatch("autoLogin");

      if (this.$store.state.existe === 0) {
        this.$router.push({ name: 'Login' });
      } else {
        this.Agregarcliente = true;
        this.dialog = true;
      }
    },
    editItem(item) {

      this.editedItem = Object.assign({}, item);
      this.dialog = true;
      this.Editarcliente = true;
    },
    editItem2(item) {

      this.editedItem = Object.assign({}, item);
      this.dialog2 = true;
    },
    deleteItem(item) {

      this.editedItem2 = Object.assign({}, item);
      this.dialogDelete = true;
    },

    cerrareliminarsede() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem2 = Object.assign({}, this.defaultItem2);
        this.editedIndex = -1;
      });
    },
    cerrareditar() {
      this.dialog = false;
      this.$nextTick(() => {
        /* this.editedItem.contactoprincipal[0].telefono = "";
        this.editedItem.contactoprincipal[0].nombre = ""; */
        this.editedItem.nit = "";
        this.editedItem.nombre = "";
        this.editedItem.sedePrincipal.ciudad = "";
        this.editedItem.sedePrincipal.direccion = "";
        this.Editarcliente = false;
        this.Agregarcliente = false;

        this.editedIndex = -1;
      });
      /* this.listar(); */
    },
    cerraragregarsede() {
      this.dialog2 = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedItem2 = Object.assign({}, this.defaultItem2);
        this.editedIndex = -1;
      });
      /* this.listar(); */
    },

    editar() {

      this.esperarguardar = true;
      const encontrarnit = this.equipos.find(
        (registro) => registro.nit === this.editedItem.nit
      );
      if (encontrarnit) {
        this.textodialogo = "El NIT ya se encuentra registrado";
        this.cerrareditar();
        this.esperarguardar = false;
        this.dialogo = true;
      } else {
        this.Editarcliente = false;
        axios
          .patch(
            this.$store.state.ruta + "api/cliente/actualizar/" + this.editedItem.id,
            {
              nombre: this.editedItem.nombre,
              nit: this.editedItem.nit,
              sedePrincipal: {
                ciudad: this.editedItem.sedePrincipal.ciudad,
                direccion: this.editedItem.sedePrincipal.direccion,
                activa: true, // Puedes hacerlo dinámico si es necesario
              },
            },
            {
              headers: {
                token: this.$store.state.token,
              },
            }
          )
          .then((response) => {
            console.log(response);
            this.cerrareditar();
            this.mensajeDialogo = "Cliente editado correctamente";
            this.confirmacionguardado = true;
            this.listar();
          })
          .catch((error) => {
            console.log(error);
            return error;
          });
      }

    },
    agregarCliente() {
      //Editar categoria
      this.esperarguardar = true;
      const encontrarnit = this.equipos.find(
        (registro) => registro.nit === this.editedItem.nit
      );

      if (encontrarnit) {
        this.textodialogo = "El NIT ya se encuentra registrado";
        this.cerrareditar();
        this.esperarguardar = false;
        this.dialogo = true;
      } else {
        this.Agregarcliente = false;

        axios
          .post(
            this.$store.state.ruta + "api/cliente/registrar/",
            {
              nombre: this.editedItem.nombre,
              nit: this.editedItem.nit,
              sedePrincipal: {
                ciudad: this.editedItem.sedePrincipal.ciudad,
                direccion: this.editedItem.sedePrincipal.direccion,
                activa: true, // O puedes usar: this.editedItem.activa ?? true
              },
            },
            {
              headers: {
                token: this.$store.state.token,
              },
            }
          )
          .then((response) => {
            console.log(response);
            this.cerrareditar();
            this.esperarguardar = false;
            this.mensajeDialogo = "Cliente registrado correctamente";
            this.confirmacionguardado = true;
            this.listar();
          })
          .catch((error) => {
            console.log(error);
            return error;
          });
      }
    },
    agregarnuevasede() {
      axios
        .post(
          this.$store.state.ruta +
          "api/cliente/agregarsede/" +
          this.editedItem.id,
          {
            ciudad: this.editedItem2.sedePrincipal.ciudad,
            direccion: this.editedItem2.sedePrincipal.direccion,
          },
          {
            headers: {
              token: this.$store.state.token,
            },
          }
        )
        .then((response) => {
          console.log(response);
          this.mensajeDialogo = "Sede registrada correctamente";
          this.confirmacionguardado = true;
          this.listar();
        })
        .catch((error) => {
          console.log(error);
          return error;
        });

      this.cerraragregarsede();
    },
    save3() {
      axios
        .patch(
          this.$store.state.ruta + "api/cliente/eliminarsede/",
          {
            sedeId: this.editedItem2.id,  // <-- Aquí está el id de la sede a desactivar
          },
          {
            headers: {
              token: this.$store.state.token,
            },
          }
        )
        .then((response) => {
          console.log(response);
          this.mensajeDialogo = "Sede eliminada correctamente";
          this.confirmacionguardado = true;
          this.listar();
        })
        .catch((error) => {
          console.log(error);
          return error;
        });

      this.cerrareliminarsede();
    },
    AceptarConfirmacionGuardado() {
      this.confirmacionguardado = false;

    },




  },
};
</script>
<style scoped>
.centered-input>>>input {
  text-align: center;
}

.aviso {
  text-align: center;
}

.toolbar {
  flex-wrap: wrap;
}

button.disabled {
  cursor: not-allowed;
  opacity: 0.5;
  pointer-events: none;
  /* Evita cualquier interacción del usuario */
}

@media (max-width: 767px) {
  .tamano {
    display: none;
  }
}
</style>