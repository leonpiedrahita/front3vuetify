<template>
  <v-card class="pa-2">
  <!-- se crea la data table prinecipal para listar los clientes -->
  <v-data-table
      :headers="headers"
      :items="equipos"
      :expanded.sync="expanded"
      show-expand
      single-expand
      :search="search"
      class="elevation-1"
      item-value="nit"
      :loading="cargando"
      loading-text="Cargando ... por favor espere"
      ><!-- Se crea la data table secundaria para listar las sedes -->
      <template v-slot:expanded-row="{ columns, item }">
        <td :colspan="columns.length">
          <div class="sp-details" justify="center">
            <div class="col-xs-5 col-md-8 text-center">
              <v-data-table :headers="encabezado" :items="item.sede">
                <template v-slot:[`item.eliminarsede`]="{ item }">
                  <!-- Botón de basura para eliminar la sede -->
                  <v-icon medium @click="deleteItem(item)">
                    mdi-delete-empty
                  </v-icon>
                </template>
              </v-data-table>
            </div>
          </div>
        </td>
      </template>
      <!-- Encabledazo de la página -->
      <template v-slot:top>
        <v-toolbar flat>
          <v-row justify="space-around">
        
        <v-col cols="6" sm="5">
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Buscar: Cliente / NIT / Nombre / Teléfono"
            single-line
            hide-details
          ></v-text-field>
           </v-col>
        
        <v-col cols="6" sm="2" >
          <v-btn class="c6" large @click="nuevoCliente()"> Nuevo Cliente </v-btn>
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
                      <v-text-field
                        v-model="editedItem.nombre"
                        label="Nombre/Razón Social"
                        :rules="[(v) => !!v || 'Campo Requerido']"
                        required
                        class="centered-input"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field
                        v-model="editedItem.nit"
                        label="NIT"
                        :rules="[(v) => !!v || 'Campo Requerido']"
                        required
                        class="centered-input"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field
                        v-model="editedItem.contactoprincipal[0].nombre"
                        label="Nombre de contacto principal"
                        :rules="[(v) => !!v || 'Campo Requerido']"
                        required
                        class="centered-input"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field
                        v-model="editedItem.contactoprincipal[0].telefono"
                        label="Teléfono de contacto principal"
                        :rules="[(v) => !!v || 'Campo Requerido']"
                        required
                        class="centered-input"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error darken-1" text @click="cerrareditar">
                  Cancelar
                </v-btn>
                <v-btn
                  :disabled="
                    !(
                      editedItem.contactoprincipal[0].telefono &&
                      editedItem.contactoprincipal[0].nombre &&
                      editedItem.nit &&
                      editedItem.nombre
                    )
                  "
                  color="primary darken-1"
                  text
                  @click="editar"
                  v-if="Editarcliente"
                >
                  Editar
                </v-btn>
                <v-btn
                  :disabled="
                    !(
                      editedItem.contactoprincipal[0].telefono &&
                      editedItem.contactoprincipal[0].nombre &&
                      editedItem.nit &&
                      editedItem.nombre
                    )
                  "
                  color="primary darken-1"
                  text
                  @click="agregarCliente"
                  v-if="Agregarcliente"
                >
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
                      <v-text-field
                        v-model="editedItem2.nombre"
                        label="Sede"
                        :rules="[(v) => !!v || 'Campo Requerido']"
                        required
                        class="centered-input"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field
                        v-model="editedItem2.direccion"
                        label="Direccion"
                        :rules="[(v) => !!v || 'Campo Requerido']"
                        required
                        class="centered-input"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error darken-1" text @click="cerraragregarsede">
                  Cancelar
                </v-btn>
                <v-btn
                  :disabled="!(editedItem2.nombre && editedItem2.direccion)"
                  color="primary darken-1"
                  text
                  @click="agregarnuevasede"
                >
                  Agregar
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <!-- Diálogo para eliminar sede -->
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="text-h5"
                >¿Desea eliminar la sede?</v-card-title
              >
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error darken-1" text @click="cerrareliminarsede"
                  >Cancelar</v-btn
                >
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
      <v-dialog
        transition="dialog-top-transition"
        max-width="500"
        v-model="dialogo"
      >
        <template>
          <v-card>
            <v-toolbar color="error" dark class="text-h3 d-flex justify-center"
              >Aviso!!!</v-toolbar
            >
            <v-card-text>
              <div class="text-h2 pa-1 ma-1 aviso">
                {{ $data.textodialogo }}
              </div>
            </v-card-text>
            <v-card-actions class="justify-center">
              <v-btn text @click="(dialogo = false), (textodialogo = '')"
                >Cerrar</v-btn
              >
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>
    </v-col>
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
    <p>{{this.equipos}}</p> 
  </v-card>
</template>
<script>
 import axios from "axios";
export default {
  name: "ListarClientesComponent",
  data: () => ({
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
        title: "Sede",
        value: "nombre",
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
      },
    ],
    headers: [
      {
        title: "Nombre/Razón social",
        align: "center",
        value: "nombre",
        class: "titulo--text font-weight-bold",
      },
      {
        title: "NIT",
        value: "nit",
        align: "center",
        class: "titulo--text font-weight-bold",
      },
      {
        title: "Nombre de contacto principal",
        value: "contactoprincipal[0].nombre",
        align: "center",
        class: "titulo--text font-weight-bold",
      },
      {
        title: "Teléfono de contacto principal",
        value: "contactoprincipal[0].telefono",
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
      },
      {
        title: "Agregar Sede",
        value: "agregarsede",
        sortable: false,
        align: "center",
        class: "titulo--text font-weight-bold",
      },
    ],
  
    editedIndex: -1,
    equipos: [],
    prueba: {},
    editedItem: {
      nit: "",
      nombre: "",
      contactoprincipal: [{}],
    },
    editedItem2: {
      nombre: "",
      direccion: "",
    },
    defaultItem: {
      nit: "",
      nombre: "",
      contactoprincipal: [
        {
          nombre: "",
          telefono: "",
        },
      ],
    },
    defaultItem2: {
      nombre: "",
      direccion: "",
    },
  }),

  computed: {
    titulocliente() {
      return "Editar cliente";
    },
    titulosede() {
      return "Agregar sede";
    },
    
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
        this.$router.push({ name: "Login" });
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
        this.editedItem.contactoprincipal[0].telefono="";
          this.editedItem.contactoprincipal[0].nombre="";
          this.editedItem.nit="";
          this.editedItem.nombre="";
        this.Editarcliente = false;
        this.Agregarcliente = false;

        this.editedIndex = -1;
      });
      this.listar();
    },
    cerraragregarsede() {
      this.dialog2 = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedItem2 = Object.assign({}, this.defaultItem2);
        this.editedIndex = -1;
      });
      this.listar();
    },

    editar() {
      //Editar categoria
      this.Editarcliente = false;
      
      axios
        .patch(
          this.$store.state.ruta +
            "api/cliente/actualizar/" +
            this.editedItem._id,
          {
            nombre: this.editedItem.nombre,
            nit: this.editedItem.nit,
            contactoprincipal: this.editedItem.contactoprincipal,
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
          this.listar();
        })
        .catch((error) => {
          console.log(error);
          return error;
        });

     
    },
    agregarCliente() {
      //Editar categoria
      this.esperarguardar = true;
      const encontrarnit = this.equipos.find(
        (registro) => registro.nit === this.editedItem.nit
      );

      if (encontrarnit) {
        this.textodialogo = "El NIT ya se encuentra registrado";
        this.Agregarcliente = false;
        this.cerrareditar();
        this.dialogo = true;
      } else {
        this.Agregarcliente = false;
        
        axios
          .post(
            this.$store.state.ruta + "api/cliente/registrar/",
            {
              nombre: this.editedItem.nombre,
              nit: this.editedItem.nit,
              contactoprincipal: this.editedItem.contactoprincipal,
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
            this.listar();
          })
          .catch((error) => {
            console.log(error);
            return error;
          });
      }
    },
    agregarnuevasede() {
      //Editar categoria
      axios
        .patch(
          this.$store.state.ruta +
            "api/cliente/agregarsede/" +
            this.editedItem._id,
          {
            nombre: this.editedItem2.nombre,
            direccion: this.editedItem2.direccion,
          },
          {
            headers: {
              token: this.$store.state.token,
            },
          }
        )
        .then((response) => {
          console.log(response);
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
            nombre: this.editedItem2.nombre,
            direccion: this.editedItem2.direccion,
            idcliente: this.editedItem2.idcliente,
          },
          {
            headers: {
              token: this.$store.state.token,
            },
          }
        )
        .then((response) => {
          console.log(response);
          this.listar();
        })
        .catch((error) => {
          console.log(error);
          return error;
        });

      this.cerrareliminarsede();
    },
  },
};
</script>
<style scoped>
.centered-input >>> input {
  text-align: center;
}
.aviso {
  text-align: center;
}
.toolbar {
  flex-wrap: wrap;
}
@media (max-width: 767px) {
  .tamano {
    display: none;
  }
}
</style>