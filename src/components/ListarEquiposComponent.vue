<template>
  <v-card class="pa-2 mt-15 ">
    <v-data-table :headers="headers" :items="equipos" :search="search" class="elevation-1" :loading="cargando"
      loading-text="Cargando ... por favor espere">
      <template v-slot:top>
        <v-toolbar flat>
          <v-row justify="space-around">
            <v-col cols="6" sm="5">
              <v-text-field v-model="search" append-icon="mdi-magnify" label="Buscar: Cliente / Nombre / Serie"
                single-line hide-details></v-text-field>
            </v-col>

            <v-col cols="6" sm="2">
              <v-btn color="c6" min-width="228" size="large" variant="flat" large @click="nuevoEquipo()">
                Nuevo Equipo
              </v-btn>
            </v-col>
          </v-row>
          <v-dialog v-model="dialog2" max-width="500px">
            <v-card>
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="12" md="12">
                      <v-autocomplete v-model="nuevoequipo.nombre" :items="nombresequipos" label="Equipo" required
                        :rules="[(v) => !!v || 'Campo Requerido']">{{ nuevamarca }}</v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field v-model="nuevoequipo.marca" label="Marca" disabled></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field v-model="nuevoequipo.placaDeInventario" label="Número de placa de inventario"
                        required :rules="[(v) => !!v || 'Campo Requerido']"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field v-model="nuevoequipo.serie" label="Número de Serie" required
                        :rules="[(v) => !!v || 'Campo Requerido']"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-autocomplete v-model="nuevoequipo.propietario.nombre" :items="nombresclientes"
                        label="Propietario" class="vs__search" required :rules="[(v) => !!v || 'Campo Requerido']">{{
                        nuevopropietario }}</v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-autocomplete v-model="nuevoequipo.cliente.nombre" :items="nombresclientes" label="Cliente"
                        required :rules="[(v) => !!v || 'Campo Requerido']">{{ nuevocliente }}</v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-autocomplete v-model="nuevoequipo.ubicacion.nombre" :items="nombreUbicacionesCliente"
                        label="Sede" :rules="[(v) => !!v || 'Campo Requerido']" required>
                      </v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-autocomplete v-model="nuevoequipo.tipoDeContrato" :items="listacontratos"
                        label="Tipo de contrato" class="vs__search" required
                        :rules="[(v) => !!v || 'Campo Requerido']"></v-autocomplete>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" text @click="close2"> Cancelar </v-btn>
                <v-btn :disabled="!(
                  nuevoequipo.nombre &&
                  nuevoequipo.serie &&
                  nuevoequipo.placaDeInventario &&
                  nuevoequipo.tipoDeContrato &&
                  nuevoequipo.propietario &&
                  nuevoequipo.cliente &&
                  nuevoequipo.ubicacion.nombre
                )
                  " color="primary darken-1" text @click="save2">
                  Crear
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogomodificarequipocliente" max-width="500px">
            <v-card>
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field v-model="equipomodificado.nombre" label="Equipo" disabled
                        :rules="[(v) => !!v || 'Campo Requerido']"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field v-model="equipomodificado.marca" label="Marca" disabled></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field v-model="equipomodificado.placaDeInventario" label="Número de placa de inventario"
                        required :rules="[(v) => !!v || 'Campo Requerido']"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field v-model="equipomodificado.serie" label="Número de Serie" disabled
                        :rules="[(v) => !!v || 'Campo Requerido']"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-autocomplete v-model="equipomodificado.propietario.nombre" :items="nombresclientes"
                        label="Propietario" class="vs__search" required :rules="[(v) => !!v || 'Campo Requerido']">{{
                        nuevopropietariomodificado }}</v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-autocomplete v-model="equipomodificado.cliente.nombre" :items="nombresclientes" label="Cliente"
                        required :rules="[(v) => !!v || 'Campo Requerido']">{{ nuevoclientemodificado
                        }}</v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-autocomplete v-model="equipomodificado.ubicacionNombre"
                        :items="nombreUbicacionesClienteModificado" item-text="nombre" label="Sede"
                        :rules="[(v) => !!v || 'Campo Requerido']" required>
                      </v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-autocomplete v-model="equipomodificado.tipoDeContrato" :items="listacontratos"
                        label="Tipo de contrato" class="vs__search" required
                        :rules="[(v) => !!v || 'Campo Requerido']"></v-autocomplete>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error darken-1" text @click="close2">
                  Cancelar
                </v-btn>
                <v-btn :disabled="!(
                  equipomodificado.nombre &&
                  equipomodificado.serie &&
                  equipomodificado.placaDeInventario &&
                  equipomodificado.tipoDeContrato &&
                  equipomodificado.propietario &&
                  equipomodificado.cliente &&
                  equipomodificado.ubicacionNombre
                )
                  " color="primary darken-1" text @click="actualizarequipo">
                  Modificar
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="dialog" max-width="500px">
            <v-card>
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field v-model="editedItem.cliente.nombre" label="Cliente" disabled
                        class="centered-input"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field v-model="editedItem.nombre" label="Nombre" disabled
                        class="centered-input"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field v-model="editedItem.serie" label="Serie" disabled
                        class="centered-input"></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" text @click="close"> Cancelar </v-btn>
                <v-btn color="primary darken-1" text @click="save" v-if="generarreporteseleccionado">
                  Crear reporte
                </v-btn>
                <v-btn color="primary darken-1" text @click="guardarGenerarOrden" v-if="generarordenseleccionado">
                  Generar Orden
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
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
          <v-dialog v-model="dialogoetapa" max-width="500px">
            <v-col cols="12">
              <v-card class="pa-5"><v-select v-model="etapaautorizada" :items="listadeetapas" label="Siguiente paso"
                  required :rules="[(v) => !!v || 'Campo Requerido']"></v-select>
                <v-textarea v-model="observaciones"></v-textarea>
                <v-card-actions><v-btn class="primary darken-1" text @click="confirmarEtapa(0)">Confirmar
                    Etapa</v-btn></v-card-actions>
              </v-card>
            </v-col>
          </v-dialog>
          <v-dialog v-model="esperaguardar" persistent width="500">
            <v-card color="c6" dark>
              <v-card-text>
                Por favor espere...
                <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
              </v-card-text>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:[`item.detalles`]="{ item }">
        <v-icon medium @click="detallesEquipo(item)">
          mdi-archive-eye-outline
        </v-icon>
      </template>

      <template v-slot:[`item.editar`]="{ item }">
        <v-icon medium @click="modificarEquipo(item)"> mdi-pencil </v-icon>
      </template>
      <template v-slot:[`item.generarorden`]="{ item }">
        <v-icon medium @click="generarOrden(item)">
          mdi-vector-polyline-plus
        </v-icon>
      </template>

      <template v-slot:[`item.crear`]="{ item }">
        <v-icon medium @click="editItem(item)">
          mdi-text-box-plus-outline
        </v-icon>
      </template>
    </v-data-table>
    <!--     <pre> {{ this.nombreUbicacionesClienteModificado}} </pre>
 --> </v-card>
  <pre> {{ equipos }} </pre>
  <h1>Equipomodificado</h1>
  <pre> {{ equipomodificado }} </pre>
</template>
<script>
import axios from "axios";
export default {
  name: "ListarEquipos",
  data: () => ({
    dialog: false,
    generarordenseleccionado: false,
    generarreporteseleccionado: false,
    dialog2: false,
    dialogomodificarequipocliente: false,
    dialogo: false,
    dialogoetapa: false,
    textodialogo: "",
    search: "",
    cargando: true,
    esperaguardar: false,
    etapaautorizada: "",
    observaciones: "",
    listadeetapas: [],
    listacontratos: ["Sin asignar", "Comodato", "Venta", "Alquiler"],
    nombreUbicacionesCliente: [],
    nombreUbicacionesClienteModificado: [],
    ordenes: [
      {
        etapaactual: 1, // Paso actual
        ultimaetapa: 1, //Cantidad máxima de pasos
        etapas: [],
        equipo: {},
        estado: "Bloqueado",
      },
    ],
    headers: [
      { title: "Serie", value: "serie", align: "center" },
      { title: "Inventario", value: "placaDeInventario", align: "center" },
      {
        title: "Propietario",
        align: "center",
        key: "propietario.nombre",
      },
      { title: "Nombre", value: "nombre", align: "center" },
      {
        title: "Cliente asignado",
        align: "center",
        key: "cliente.nombre",
      },
      {
        title: "Ubicacion",
        align: "center",
        value: "ubicacionNombre",
      },
      { title: "Contrato", key: "tipoDeContrato", align: "center" },
      {
        title: "Detalles",
        value: "detalles",
        sortable: false,
        align: "center",
      },
      {
        title: "Editar",
        value: "editar",
        sortable: false,
        align: "center",
      },
      {
        title: "Generar orden",
        value: "generarorden",
        sortable: false,
        align: "center",
      },
      {
        title: "Crear Reporte",
        value: "crear",
        sortable: false,
        align: "center",
      },
    ],
    desserts: [],
    editedIndex: -1,
    equipos: [],
    refequipos: [],
    nombresequipos: [],
    clientes: [],
    nombresclientes: [],
    ubicacionclientes: [],
    ubicacionclientesmodificado: [],
    direccionclientes: [],
    sedeseleccionada: "",
    sedeactualizada: "",
    inventarioactual: "",
    prueba: {},
    editedItem: {
      cliente: {
        nombre: "",
      },
      nombre: "",
      serie: "",
    },
    defaultItem: {
      cliente: {
        nombre: "",
      },
      nombre: "",
      serie: "",
    },
    nuevoequipo: {
      nombre: "",
      marca: null,
      id: "",
      serie: "",
      placaDeInventario: "",
      tipoDeContrato: "",
      propietario: {
        nombre: "",
        id: "",
      },
      cliente: {
        nombre: "",
        id: "",
      },
      ubicacion: {
        nombre: "",
        direccion: "",
      },
    },
    equipomodificado: {
      nombre: "",
      marca: "",
      serie: "",
      placaDeInventario: "",
      tipoDeContrato: "",
      clienteId: null,
      propietarioId:null,
      propietario: {
        nombre: "",
        id: "",
      },
      cliente: {
        nombre: "",
        id: "",
      },
      ubicacion: {
        nombre: "",
        direccion: "",
      },
    },
    nuevoequipopordefecto: {
      nombre: "",
      marca: {},
      id: "",
      serie: "",
      placaDeInventario: "",
      tipoDeContrato: "",
      propietario: {
        nombre: "",
        id: "",
      },
      cliente: {
        nombre: "",
        id: "",
      },
      ubicacion: {
        nombre: "",
        direccion: "",
      },
    },
  }),

  computed: {
    formTitle() {
      if (this.dialog2) {
        return "Nuevo equipo";
      }
      if (this.dialogomodificarequipocliente) {
        return "Modificar equipo";
      }
    },

    titulocliente() {
      return "Agregar Equipo";
    },
    ejercicio: function () {
      // `this` apunta a la instancia vm
      this.sedeactualizada = this.clientes.filter((cliente) => {
        if (cliente.nombre === "nombre6actualizado") {
          return cliente;
        }
      });
    },


  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    'nuevoequipo.nombre': function (newValue) {
      // Este watcher se ejecutará cuando nuevoequipo.nombre cambie
      this.nuevamarca();
    },
    'nuevoequipo.propietario.nombre': function (newValue) {
      // Este watcher se ejecutará cuando nuevoequipo.propietario.nombre cambie
      this.nuevopropietario();
    },
    'nuevoequipo.cliente.nombre': function (newValue) {
      // Este watcher se ejecutará cuando nuevoequipo.cliente.nombre cambie
      this.nuevocliente();
    },
    'equipomodificado.cliente.nombre': function (newValue) {
      // Este watcher se ejecutará cuando 'equipomodificado.cliente.nombre' cambie
      this.nuevopropietariomodificado();
      this.nuevoclientemodificado();
    },
    'equipomodificado.propietario.nombre': function (newValue) {
      // Este watcher se ejecutará cuando 'equipomodificado.cliente.nombre' cambie
      this.nuevoclientemodificado();
      this.nuevopropietariomodificado();
    }
  },
  beforeCreate() {
    this.$store.dispatch("autoLogin");
    if (this.$store.state.existe === 0) {
      this.$router.push({ name: "Login" });
    }
    this.$store.dispatch("guardarUbicacion", {
      ubicacion: "Equipos existentes",
      icono: "mdi-amplifier",
      color: "c6",
    });
  },
  created() {
    this.$store.dispatch("autoLogin");
    if (this.$store.state.existe === 0) {
      this.$router.push({ name: "Login" });
    } else {
      this.asignarLista();
      this.listar();
    }
  },

  methods: {
    listar() {
      //va a ir a mi backend y me traerá las peticiones de la base de datos
      axios
        .get(this.$store.state.ruta + "api/equipo/listar", {


        })
        .then((response) => {
          this.equipos = response.data; //el this es porque no es propia de la funcion sino de l componente
          this.cargando = false;
        })
        .catch((error) => {
          //console.log(error);
          return error;
        });
    },

    editItem(item) {
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.generarreporteseleccionado = true;
      this.dialog = true;
    },
    generarOrden(item) {
      this.editedIndex = this.desserts.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.generarordenseleccionado = true;
      this.dialog = true;
    },

    close() {
      this.dialog = false;
      this.generarreporteseleccionado = false;
      this.generarordenseleccionado = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    close2() {
      this.dialog2 = false;
      this.dialogomodificarequipocliente = false;
      this.$nextTick(() => {
        this.nuevoequipo = this.nuevoequipopordefecto;
      });
    },

    save() {
      localStorage.setItem("equipo", JSON.stringify(this.editedItem));
      this.close();
      this.generarreporteseleccionado = false;
      this.$router.push({ name: "FormularioGenerarOrden" });
    },
    guardarGenerarOrden() {
      this.dialogoetapa = true;
      this.generarordenseleccionado = false;
    },

    save2() {
      this.nuevoequipo.ubicacion.direccion = this.ubicacionclientes.map(
        (equipo) => {
          if (equipo.nombre === this.nuevoequipo.ubicacion.nombre) {
            return equipo.direccion;
          }
        }
      );
      var filtered = this.nuevoequipo.ubicacion.direccion.filter(function (el) {
        return el != null;
      });
      this.nuevoequipo.ubicacion.direccion = filtered[0];

      const encontrarserie = this.equipos.find(
        (registro) => registro.serie === this.nuevoequipo.serie
      );
      const encontrarinventario = this.equipos.find(
        (registro) =>
          registro.placaDeInventario === this.nuevoequipo.placaDeInventario
      );

      if (encontrarserie) {
        this.textodialogo = "El número de serie ya se encuentra registrado";
        this.dialogo = true;
      } else if (encontrarinventario) {
        this.textodialogo =
          "El número de inventario ya se encuentra registrado";
        this.dialogo = true;
      } else {
        axios
          .post(
            this.$store.state.ruta + "api/equipo/registrar/",
            {
              nuevoequipo: this.nuevoequipo,
            },
            {
              headers: {
                token: this.$store.state.token,
              },
            }
          )
          .then((response) => {
            console.log(response);
            this.$nextTick(() => {
              this.nuevoequipo = this.nuevoequipopordefecto;
            });
            this.listar();
          })
          .catch((error) => {
            console.log(error);
            return error;
          });
      }
      this.dialog2 = false;
      this.close();
    },
    actualizarequipo() {
      if (this.inventarioactual === this.equipomodificado.placaDeInventario) {
        console.log("equipoenviado", this.equipomodificado);
        axios
          .patch(
            this.$store.state.ruta +
            "api/equipo/actualizar/" +
            this.equipomodificado.id,
            {
              ubicacionNombre: this.equipomodificado.ubicacionNombre,
              ubicacionDireccion: this.equipomodificado.ubicacionDireccion,
              cliente: this.equipomodificado.cliente,
              propietario: this.equipomodificado.propietario,
              placaDeInventario: this.equipomodificado.placaDeInventario,
              tipoDeContrato: this.equipomodificado.tipoDeContrato,
            },
            {
              headers: {
                token: this.$store.state.token,
              },
            }
          )
          .then((response) => {
            console.log(response);
            this.$nextTick(() => {
              this.nuevoequipo = this.nuevoequipopordefecto;
            });
            this.dialogomodificarequipocliente = false;
            this.listar();
          })
          .catch((error) => {
            console.log(error);
            return error;
          });
      } else {
        const encontrarinventario = this.equipos.find(
          (registro) =>
            registro.placaDeInventario ===
            this.equipomodificado.placaDeInventario
        );
        if (encontrarinventario) {
          this.textodialogo =
            "El número de inventario ya se encuentra registrado";
          this.dialogo = true;
        } else {
          axios
            .patch(
              this.$store.state.ruta +
              "api/equipo/actualizar/" +
              this.equipomodificado.id,
              {
                ubicacionNombre: this.equipomodificado.ubicacionNombre,
                ubicacionDireccion: this.equipomodificado.ubicacionDireccion,
                cliente: this.equipomodificado.clienteId,
                propietario: this.equipomodificado.propietarioId,
                placaDeInventario: this.equipomodificado.placaDeInventario,
                tipoDeContrato: this.equipomodificado.tipoDeContrato,
              },
              {
                headers: {
                  token: this.$store.state.token,
                },
              }
            )
            .then((response) => {
              console.log(response);
              this.$nextTick(() => {
                this.nuevoequipo = this.nuevoequipopordefecto;
              });
              this.dialogomodificarequipocliente = false;
              this.listar();
            })
            .catch((error) => {
              console.log(error);
              return error;
            });
        }
      }

      /* this.close(); */
    },
    nuevoEquipo() {
      this.$store.dispatch("autoLogin");

      if (this.$store.state.existe === 0) {
        this.$router.push({ name: "Login" });
      } else {
        this.dialog2 = true;
        axios
          .get(this.$store.state.ruta + "api/cliente/listar", {
            headers: {
              token: this.$store.state.token,
            },
          })
          .then((response) => {
            this.clientes = response.data; //el this es porque no es propia de la funcion sino de l componente
              /*           this.nombresclientes = this.clientes.map((cliente)=>({nombre:cliente.nombre,id:cliente._id,sede:cliente.sede}));
               */ this.nombresclientes = this.clientes.map(
              (cliente) => cliente.nombre
            );
          })
          .catch((error) => {
            //console.log(error);
            return error;
          });
        axios
          .get(this.$store.state.ruta + "api/refequipo/listar")
          .then((response) => {
            this.refequipos = response.data; //el this es porque no es propia de la funcion sino de l componente
            this.refequipos = this.refequipos.map((equipo) => ({
              nombre: equipo.nombre,
              marca: equipo.marca,
              id: equipo.id,
            }));
            this.nombresequipos = this.refequipos.map(
              (nombres) => nombres.nombre
            );
          })
          .catch((error) => {
            //console.log(error);
            return error;
          });
      }
    },
    modificarEquipo(item) {
      this.$store.dispatch("autoLogin");

      if (this.$store.state.existe === 0) {
        this.$router.push({ name: "Login" });
      } else {
        this.equipomodificado = Object.assign({}, item);
        this.inventarioactual = this.equipomodificado.placaDeInventario;

        this.dialogomodificarequipocliente = true;
        axios
          .get(this.$store.state.ruta + "api/cliente/listar", {
            headers: {
              token: this.$store.state.token,
            },
          })
          .then((response) => {
            this.clientes = response.data; //el this es porque no es propia de la funcion sino de l componente
              /*           this.nombresclientes = this.clientes.map((cliente)=>({nombre:cliente.nombre,id:cliente._id,sede:cliente.sede}));
               */ this.nombresclientes = this.clientes.map(
              (cliente) => cliente.nombre
            );
          })
          .catch((error) => {
            //console.log(error);
            return error;
          });
      }
    },
    detallesEquipo(item) {
      this.$store.dispatch("guardarDetallesEquipo", {
        detallesequipo: Object.assign({}, item),
      });
      this.$router.push({ name: "DetallesEquipo" });
    },
    asignarLista() {
      if (this.$store.state.user.rol === "administrador") {
        this.listadeetapas = [
          "Llegada de equipo",
                    "Equipo desinfectado",
                    "Cuarentena",
                    "Soporte ingeniería",
                    "Soporte aplicaciones",    
                    "Pendiente de repuestos",
                    "Listo para despacho",
                    "Despachado",
        ];
      } else if (this.$store.state.user.rol === "soporte") {
        this.listadeetapas = [
          "Cotización solicitada",
          "Repuestos solicitados",
          "Soporte realizado",
          "Equipo despachado",
          "Entrenamiento realizado",
        ];
      } else if (this.$store.state.user.rol === "bodega") {
        this.listadeetapas = [
          "Llegada de equipo",
          "Repuestos entregados",
          "Equipo despachado",
        ];
      } else if (this.$store.state.user.rol === "cotizaciones") {
        this.listadeetapas = ["Cotización aprobada"];
      } else if (this.$store.state.user.rol === "facturación") {
        this.listadeetapas = ["Repuestos aprobados para entrega"];
      } else if (this.$store.state.user.rol === "asesor") {
        this.listadeetapas = [
          "Cotización solicitada",
          "Entrenamiento realizado",
        ];
      } else if (this.$store.state.user.rol === "cartera") {
        this.listadeetapas = [];
      }
    },
    confirmarEtapa(m) {
      this.$store.dispatch("autoLogin");
      if (this.$store.state.existe === 0) {
        this.$router.push({ name: "Login" });
      } else {
        var today = new Date();
        var date =
          "(" +
          today.getDate() +
          "-" +
          (today.getMonth() + 1) +
          "-" +
          today.getFullYear() +
          ")";

        this.ordenes[m].etapas.push({
          nombre: this.etapaautorizada,
          comentario: this.observaciones,
          responsable: this.$store.state.user.nombre,
          hora: date,
        });
        this.ordenes[m].etapaactual++;
        this.ordenes[m].ultimaetapa++;

        this.esperaguardar = true;
        axios
          .post(
            this.$store.state.ruta + "api/orden/registrar/",
            {
              equipo: this.editedItem,
              etapas: this.ordenes[0].etapas,
            },
            {
              headers: {
                token: this.$store.state.token,
              },
            }
          )
          .then((response) => {
            this.esperaguardar = false;
            this.dialogoetapa = false;
            this.dialog = false;
            this.$store.dispatch("guardarOrdenesEquipo", {
              ordenes: this.ordenes[0],
              equipo: this.editedItem,
              idorden: response.data.result.id,
            });

            this.close();
            console.log(response);
            this.$router.push({ name: "Pasos" });
          })
          .catch((error) => {
            this.esperaguardar = false;
            console.log(error);
            return error;
          });
      }
    },
    guardarReporte() {
      this.esperaguardar = true;
      axios
        .post(
          this.$store.state.ruta + "api/reporte/registrar/",
          {
            reporte: this.reporte,
          },
          {
            headers: {
              token: this.$store.state.token,
            },
          }
        )
        .then((response) => {
          this.esperaguardar = false;

          const identificacion = response.data.identificacion;
          console.log(response);
          this.$store.dispatch("guardarIdentificacion", {
            id: identificacion,
          });
          this.$router.push({ name: "Home" });
        })
        .catch((error) => {
          this.esperaguardar = false;
          console.log(error);
          return error;
        });
    },
    nuevamarca: function () {
      // `this` apunta a la instancia vm
      this.nuevoequipo.marca = this.refequipos.map((equipo) => {
        if (equipo.nombre === this.nuevoequipo.nombre) {
          return equipo.marca;
        }
      });

      var filtered = this.nuevoequipo.marca.filter(function (el) {
        return el != null;
      });
      this.nuevoequipo.marca = filtered[0];

      this.nuevoequipo.id = this.refequipos.map((equipo) => {
        if (equipo.nombre === this.nuevoequipo.nombre) {
          return equipo.id;
        }
      });
      var filtered = this.nuevoequipo.id.filter(function (el) {
        return el != null;
      });
      this.nuevoequipo.id = filtered[0];
    },

    nuevopropietario: function () {
      // `this` apunta a la instancia vm
      this.nuevoequipo.propietario.id = this.clientes.map((cliente) => {
        if (cliente.nombre === this.nuevoequipo.propietario.nombre) {
          return cliente.id;
        }
      });
      var filtered = this.nuevoequipo.propietario.id.filter(function (el) {
        return el != null;
      });
      this.nuevoequipo.propietario.id = filtered[0];
    },

    nuevopropietariomodificado: function () {
      // `this` apunta a la instancia vm
      this.equipomodificado.propietario.id = this.clientes.map((cliente) => {
        if (cliente.nombre === this.equipomodificado.propietario.nombre) {
          return cliente.id;
        }
      });
      var filtered = this.equipomodificado.propietario.id.filter(function (el) {
        return el != null;
      });
      this.equipomodificado.propietario.id = filtered[0];
    },
    nuevocliente: function () {
      // `this` apunta a la instancia vm
      this.nuevoequipo.cliente.id = this.clientes.map((cliente) => {
        if (cliente.nombre === this.nuevoequipo.cliente.nombre) {
          return cliente.id;
        }
      });
      var filtered = this.nuevoequipo.cliente.id.filter(function (el) {
        return el != null;
      });
      this.nuevoequipo.cliente.id = filtered[0];
      this.ubicacionclientes = this.clientes.map((cliente) => {
        if (cliente.nombre === this.nuevoequipo.cliente.nombre) {
          return cliente.sede;
        }
      });
      var filtered = this.ubicacionclientes.filter(function (el) {
        return el != null;
      });
      this.ubicacionclientes = filtered[0];
      //NombreUbicacionesCliente es un array con nombres de las sedes de los clientes para que pueda ser mostrado en la lista desplegable
      this.nombreUbicacionesCliente = this.ubicacionclientes.map(objeto => Object.values(objeto)[0]);

    },
    nuevoclientemodificado: function () {
      // `this` apunta a la instancia vm
      this.equipomodificado.cliente.id = this.clientes.map((cliente) => {
        if (cliente.nombre === this.equipomodificado.cliente.nombre) {
          return cliente.id;
        }
      });
      var filtered = this.equipomodificado.cliente.id.filter(function (el) {
        return el != null;
      });
      this.equipomodificado.cliente.id = filtered[0];
      this.ubicacionclientesmodificado = this.clientes.map((cliente) => {
        if (cliente.nombre === this.equipomodificado.cliente.nombre) {
          return cliente.sede;
        }
      });
      var filtered = this.ubicacionclientesmodificado.filter(function (el) {
        return el != null;
      });
      this.ubicacionclientesmodificado = filtered[0];
      this.nombreUbicacionesClienteModificado = Array.isArray(this.ubicacionclientesmodificado)
        ? this.ubicacionclientesmodificado.map(objeto => Object.values(objeto)[0])
        : [];
    },

  },
  actualizarsede() {
    this.sedeactualizada = "funciona";
  },
};
</script>
<style scoped>
.centered-input :deep(input) {
  text-align: center;
}

.aviso {
  text-align: center;
}

.toolbar {
  flex-wrap: wrap;
}

.v-select__selection {
  justify-content: center;
}

@media (max-width: 767px) {
  .tamano {
    display: none;
  }
}
</style>