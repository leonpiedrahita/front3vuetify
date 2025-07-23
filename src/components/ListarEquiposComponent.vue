<template>

  <v-card class="pa-2">
    <!-- Fila de los campos de texto y botón -->
    <v-container fluid>
      <v-row justify="space-around" align="center" dense>
        <v-col cols="12" sm="6" md="2" class="pa-0">
          <v-text-field v-model="buscar.nombreequipo" label="Nombre Equipo" variant="outlined" persistent-hint />
        </v-col>
        <v-col cols="12" sm="6" md="2" class="pa-0">
          <v-text-field v-model="buscar.serie" label="Serie" variant="outlined" persistent-hint />
        </v-col>
        <v-col cols="12" sm="6" md="2" class="pa-0">
          <v-text-field v-model="buscar.propietario" label="Propietario" variant="outlined" persistent-hint />
        </v-col>
        <v-col cols="12" sm="6" md="2" class="pa-0 d-flex justify-center justify-sm-center justify-md-start">
          <v-btn class="mb-5" color="primary" min-width="228" size="large" variant="flat" @click="buscarEquipos">
            Buscar Equipos
          </v-btn>
        </v-col>
      </v-row>

      <v-row class="mt-2 flex-nowrap" justify="space-around">
        <v-col class="px-1" cols="auto">
          <v-btn v-permission="['administrador', 'calidad']" class="my-1" color="c6" size="large" variant="flat"
            @click="nuevoEquipo()">
            Nuevo Equipo
          </v-btn>
        </v-col>

        <v-col class="px-1" cols="auto">
          <v-btn class="my-1" color="primary" size="large" @click="VentanaCronograma = true">
            Cronograma
          </v-btn>
        </v-col>

        <v-col class="px-1" cols="auto">
          <v-btn class="my-1" color="primary" size="large" @click="exportToExcel">
            Exportar a Excel
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <v-data-table :headers="headersfiltrados" :items="equipos" :search="search" class="elevation-1" :loading="cargando"
      loading-text="Cargando ... por favor espere">
      <template v-slot:top>
        <v-toolbar flat>
          <v-row justify="space-around">
            <v-col cols="12" sm="6">
              <v-text-field v-model="search" append-icon="mdi-magnify" label="Buscar: Cliente / Nombre / Serie"
                single-line hide-details></v-text-field>
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
                      <v-autocomplete v-model="nuevoequipo.proveedor.nombre" :items="nombresclientes" label="Proveedor"
                        class="vs__search">{{
                          nuevoproveedor }}</v-autocomplete>
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
                      <v-autocomplete v-model="equipomodificado.proveedor.nombre" :items="nombresclientes"
                        label="Proveedor" class="vs__search" required :rules="[(v) => !!v || 'Campo Requerido']">{{
                          nuevoproveedormodificado }}</v-autocomplete>
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
                  Nuevo ingreso
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
              <v-card class="pa-5"><v-text-field v-model="etapaautorizada" :items="listadeetapas"
                  label="Etapa de Ingreso" required :rules="[(v) => !!v || 'Campo Requerido']"
                  disabled=""></v-text-field>
                <!-- <v-textarea v-model="observaciones"></v-textarea> -->
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
          <v-dialog v-model="dialogoclientes" transition="dialog-bottom-transition" persistent fullscreen>
            <v-card>

              <!-- TOOLBAR CON COLOR Y ESTILO -->
              <v-toolbar flat style="background-color: #52B69A; color: white;">
                <v-spacer></v-spacer>
                <!-- Botón cerrar flotando a la derecha -->



                <!-- Título centrado en negrilla -->
                <v-toolbar-title class="text-center font-weight-bold">
                  Nombre: {{ historialclientes.nombre }} &nbsp; | &nbsp; Serie: {{ historialclientes.serie }}
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <!-- Botón cerrar a la derecha -->
                <v-btn icon="mdi-close" @click="dialogoclientes = false" variant="text" color="white" class="ml-auto" />
              </v-toolbar>

              <!-- CUERPO DEL DIALOGO -->
              <v-card-text>
                <v-data-table :headers="headersHistorialClientes" :items="historialclientes.historialPropietarios || []"
                  :search="search" class="elevation-1">
                  <!-- Formateo de la fecha -->
                  <template #item.fecha="{ item }">
                    {{
                      new Date(item.fecha).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      }).replace(/\//g, '-')
                    }}
                  </template>
                </v-data-table>

                <!-- DEBUG (puedes eliminar esto) -->
                <!-- {{ this.historialclientes }} -->
              </v-card-text>

            </v-card>
          </v-dialog>
          <v-dialog v-model="VentanaCronograma" transition="dialog-bottom-transition" persistent fullscreen>
            <v-card>

              <!-- TOOLBAR CON COLOR Y ESTILO -->
              <v-toolbar flat style="background-color: #52B69A; color: white;">
                <v-spacer></v-spacer>
                <!-- Botón cerrar flotando a la derecha -->



                <!-- Título centrado en negrilla -->
                <v-toolbar-title class="pa-0" style="flex: 1;">
                  <div class="text-center font-weight-bold text-body-1 text-md-h6"
                    style="white-space: normal; word-break: break-word; line-height: 1.2;">
                    Cronograma de Mantenimientos Preventivos
                  </div>
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <!-- Botón cerrar a la derecha -->
                <v-btn icon="mdi-close" @click="VentanaCronograma = false" variant="text" color="white"
                  class="ml-auto" />
              </v-toolbar>

              <!-- CUERPO DEL DIALOGO -->
              <v-card-text>



                <!-- Buscador -->
                <v-row class="mb-4" align="center" justify="center">
                  <!-- Campo de búsqueda -->
                  <v-col cols="12" md="6">
                    <v-text-field v-model="search" append-icon="mdi-magnify" label="Buscar:" single-line
                      hide-details></v-text-field>
                  </v-col>

                  <!-- Botón exportar -->
                  <v-col cols="12" md="4" class="d-flex justify-center">
                    <v-btn color="primary" min-width="228" size="large" @click="exportarAExcel">
                      <v-icon start>mdi-file-excel</v-icon>
                      Exportar a Excel
                    </v-btn>
                  </v-col>
                </v-row>


                <!-- Tabla -->
                <v-data-table :headers="headersCronograma" :items="equipos" :search="search" class="elevation-1">
                  <!-- PRÓXIMO MANTENIMIENTO -->
                  <template #item.proximoMantenimiento="{ item }">
                    <span v-if="calcularFechaVencimiento(item)">
                      {{ calcularFechaVencimiento(item) }}
                    </span>
                    <span v-else>-</span>
                  </template>

                  <!-- FECHA DE PREVENTIVO -->
                  <template #item.fechaDePreventivo="{ item }">
                    <v-chip v-if="calcularDiferencia(item) !== 'Libre'" :style="getChipStyle(item)" size="small"
                      class="font-weight-bold" variant="outlined">
                      <v-icon :icon="getChipStyle(item).icon" :color="getChipStyle(item).color" start />
                      {{ calcularDiferencia(item) }}
                    </v-chip>

                    <v-chip v-else size="small" class="font-weight-bold" color="#2196F3" variant="outlined"
                      :style="{ border: '2px solid #2196F3' }">
                      Libre
                    </v-chip>
                  </template>
                </v-data-table>
              </v-card-text>

            </v-card>
          </v-dialog>
          <v-dialog v-model="ventanaDetallesEquipo" transition="dialog-bottom-transition" persistent>
            <v-toolbar flat style="background-color: #52B69A; color: white;">
              <v-spacer></v-spacer>
              <!-- Botón cerrar flotando a la derecha -->



              <!-- Título centrado en negrilla -->
              <v-toolbar-title class="text-center font-weight-bold">
                Detalles del Equipo
              </v-toolbar-title>
              <v-spacer></v-spacer>
              <!-- Botón cerrar a la derecha -->
              <v-btn icon="mdi-close" @click="ventanaDetallesEquipo = false" variant="text" color="white"
                class="ml-auto" />
            </v-toolbar>
            <DetallesEquipoComponent />
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
      <template v-slot:[`item.clientes`]="{ item }">
        <v-icon medium @click="mostrarHistorialClientes(item)">
          mdi-account-box-multiple-outline
        </v-icon>
      </template>
    </v-data-table>
    <!--     <pre> {{ this.nombreUbicacionesClienteModificado}} </pre>
 --> </v-card>
  <!-- <pre> {{ equipos }} </pre> -->
  <!-- <h1>Equipomodificado</h1>
  <pre> {{ equipomodificado }} </pre> -->
</template>
<script>
import axios from "axios";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import DetallesEquipoComponent from "./DetallesEquipoComponent.vue";
export default {
  components: {

    DetallesEquipoComponent
  },
  name: "ListarEquipos",
  data: () => ({
    ventanaDetallesEquipo: false,
    VentanaCronograma: false,
    dialogoclientes: false,
    historialclientes: [],
    dialog: false,
    generarordenseleccionado: false,
    generarreporteseleccionado: false,
    dialog2: false,
    dialogomodificarequipocliente: false,
    dialogo: false,
    dialogoetapa: false,
    textodialogo: "",
    search: "",
    cargando: false,
    esperaguardar: false,
    etapaautorizada: "Desinfección",
    observaciones: "",
    listadeetapas: [],
    listacontratos: ["Sin asignar", "Comodato", "Venta", "Alquiler"],
    nombreUbicacionesCliente: [],
    nombreUbicacionesClienteModificado: [],
    buscar: {
      nombreequipo: "",
      serie: "",
      propietario: "",
      contrato: "",
    },
    ordenes: [
      {
        etapaactual: 1, // Paso actual
        ultimaetapa: 1, //Cantidad máxima de pasos
        etapas: [],
        /* equipo: {}, */
        estado: "Abierta",
      },
    ],
    headers: [
      { title: "Serie", value: "serie", align: "center" },
      { title: "Nombre", value: "nombre", align: "center" },
      { title: "Inventario", value: "placaDeInventario", align: "center" },
      {
        title: "Propietario",
        align: "center",
        key: "propietario.nombre",
      },
      {
        title: "Proveedor",
        align: "center",
        key: "proveedor.nombre",
      },
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
        roles: ["administrador", "calidad"],
      },
      {
        title: "Nuevo Ingreso",
        value: "generarorden",
        sortable: false,
        align: "center",
      },
      {
        title: "Crear Reporte",
        value: "crear",
        sortable: false,
        align: "center",
        roles: ["administrador", "soporte", "comercial"],
      },
      {
        title: "Historial Clientes",
        value: "clientes",
        sortable: false,
        align: "center",

      },
    ],
    headersCronograma: [
      { title: "Serie", value: "serie", align: "center" },
      { title: "Nombre", value: "nombre", align: "center" },
      {
        title: "Propietario",
        align: "center",
        key: "propietario.nombre",
      },
      {
        title: "Proveedor",
        align: "center",
        key: "proveedor.nombre",
      },
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
      { title: 'Próximo mantenimiento', value: 'proximoMantenimiento', align: "center" },
      { title: "Días restates", key: "fechaDePreventivo", align: "center" },


    ],
    headersHistorialClientes: [
      { title: "Fecha (dd-mm-aaaa)", key: "fecha", align: "center" },
      { title: "Propietario", key: "propietario.nombre", align: "center" },
      { title: "Proveedor", key: "proveedor.nombre", align: "center" },
      {
        title: "Cliente",
        align: "center",
        key: "cliente.nombre",
      },
      {
        title: "Tipo de Contrato",
        align: "center",
        key: "tipoDeContrato",
      }
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
      proveedor: {
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
      propietarioId: null,
      proveedorId: null,
      propietario: {
        nombre: "",
        id: "",
      },
      cliente: {
        nombre: "",
        id: "",
      },
      proveedor: {
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
      proveedor: {
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
    headersfiltrados() {
      // Filtra las columnas según los permisos
      return this.headers.filter(column => {
        // Si la columna no tiene roles, se muestra para todos
        if (!column.roles) return true;

        // Si tiene roles, verifica si el rol del usuario está permitido
        return column.roles.includes(this.$store.state.user.rol);
      });
    },
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
    'nuevoequipo.proveedor.nombre': function (newValue) {
      // Este watcher se ejecutará cuando nuevoequipo.proveedor.nombre cambie
      this.nuevoproveedor();
    },
    'equipomodificado.cliente.nombre': function (newValue) {
      // Este watcher se ejecutará cuando 'equipomodificado.cliente.nombre' cambie
      this.nuevopropietariomodificado();
      this.nuevoclientemodificado();
      this.nuevoproveedormodificado();
    },
    'equipomodificado.propietario.nombre': function (newValue) {
      // Este watcher se ejecutará cuando 'equipomodificado.cliente.nombre' cambie
      this.nuevoclientemodificado();
      this.nuevopropietariomodificado();
      this.nuevoproveedormodificado();
    },
    'equipomodificado.proveedor.nombre': function (newValue) {
      // Este watcher se ejecutará cuando 'equipomodificado.cliente.nombre' cambie
      this.nuevoclientemodificado();
      this.nuevoproveedormodificado();
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

    }
  },

  methods: {
    listar() {
      //va a ir a mi backend y me traerá las peticiones de la base de datos
      axios
        .get(this.$store.state.ruta + "api/equipo/listar", {

          headers: {
            token: this.$store.state.token,
          },


        })
        .then((response) => {
          this.equipos = response.data; //el this es porque no es propia de la funcion sino de l componente

        })
        .catch((error) => {
          //console.log(error);
          return error;
        });
    },
    buscarEquipos() {
      // Va a ir a mi backend y realizará una consulta con filtros dinámicos
      this.cargando = true; // Muestra el spinner de carga
      axios
        .post(this.$store.state.ruta + "api/equipo/buscarequipos", {
          // Aquí defines los filtros que deseas enviar al backend
          nombre: this.buscar.nombreequipo, // Por ejemplo, un filtro basado en el nombre
          serie: this.buscar.serie,   // Por ejemplo, un filtro basado en la serie
          contrato: this.buscar.contrato, // Por ejemplo, un filtro basado en el estado
          propietarioNombre: this.buscar.propietario // Por ejemplo, un filtro basado en el nombre del propietario

        }, {
          headers: {
            token: this.$store.state.token,
          },
        })
        .then((response) => {
          this.equipos = response.data; // El `this` es porque `equipos` pertenece al componente
          this.cargando = false;
        })
        .catch((error) => {
          console.error("Error al buscar equipos:", error);
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
      console.log("nuevoequipo", this.nuevoequipo);
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

      // Validar placaDeInventario solo si no es "N/A"
      const encontrarinventario =
        this.nuevoequipo.placaDeInventario !== "N/A"
          ? this.equipos.find(
            (registro) =>
              registro.placaDeInventario === this.nuevoequipo.placaDeInventario
          )
          : null;

      if (encontrarserie) {
        this.textodialogo = "El número de serie ya se encuentra registrado";
        this.dialogo = true;
      } else if (encontrarinventario) {
        this.textodialogo =
          "El número de inventario ya se encuentra registrado";
        this.dialogo = true;
      } else {
        // Lógica para guardar
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
            this.buscarEquipos();
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
              proveedor: this.equipomodificado.proveedor,
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
            this.buscarEquipos();
          })
          .catch((error) => {
            console.log(error);
            return error;
          });
      } else {
        const encontrarinventario =
          this.equipomodificado.placaDeInventario !== "N/A"
            ? this.equipos.find(
              (registro) =>
                registro.placaDeInventario ===
                this.equipomodificado.placaDeInventario
            )
            : null;

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
              cliente: this.equipomodificado.cliente,
              propietario: this.equipomodificado.propietario,
              proveedor: this.equipomodificado.proveedor,
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
              this.buscarEquipos();
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
          .get(this.$store.state.ruta + "api/refequipo/listar",
            {
              headers: {
                token: this.$store.state.token,
              },
            }
          )
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
      /* this.$router.push({ name: "DetallesEquipo" }); */
      this.ventanaDetallesEquipo = true;
    },
    mostrarHistorialClientes(item) {

      this.historialclientes = Object.assign({}, item)

      this.dialogoclientes = true;
    },
    asignarLista() {
      if (this.$store.state.user.rol === "administrador") {
        this.listadeetapas = [
          "Desinfección"
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
          fecha: date,
          ubicacion: "Cuarentena"
        });
        this.ordenes[m].etapaactual++;
        this.ordenes[m].ultimaetapa++;

        this.esperaguardar = true;

        axios
          .post(
            this.$store.state.ruta + "api/ingreso/registrar",
            {
              equipo: this.editedItem,
              etapa: this.ordenes[0].etapas[0],
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
            console.log('Error', error.response.data.error);
            if (error.response.data.error === `El equipo ya tiene un ingreso en estado "Abierto".`) {
              this.textodialogo = error.response.data.error;
              this.dialogoetapa = false;
              this.dialog = false;
              this.dialogo = true;
            }
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
    nuevoproveedor: function () {
      const proveedor = this.clientes.find(
        (cliente) => cliente.nombre === this.nuevoequipo.proveedor.nombre
      );

      if (proveedor) {
        this.nuevoequipo.proveedor.id = proveedor.id;
      } else {
        this.nuevoequipo.proveedor.id = null;
      }
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
    nuevoproveedormodificado: function () {
      // `this` apunta a la instancia vm
      this.equipomodificado.proveedor.id = this.clientes.map((cliente) => {
        if (cliente.nombre === this.equipomodificado.proveedor.nombre) {
          return cliente.id;
        }
      });
      var filtered = this.equipomodificado.proveedor.id.filter(function (el) {
        return el != null;
      });
      this.equipomodificado.proveedor.id = filtered[0];
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
    exportToExcel() {
      // Campos que quieres exportar (orden y nombres personalizados si deseas)
      const exportData = this.equipos.map(item => ({
        Nombre: item.nombre,
        Marca: item.marca,
        Serie: item.serie,
        Cliente: item.cliente.nombre,
        Propietario: item.propietario.nombre,
        'Ubicación': item.ubicacionNombre,
        'Dirección Ubicación': item.ubicacionDireccion,
        Estado: item.estado,
        'Placa de Inventario': item.placaDeInventario,
        'Tipo de Contrato': item.tipoDeContrato
      }));

      // Crear hoja y libro
      const ws = XLSX.utils.json_to_sheet(exportData, { origin: 'A1' });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Equipos');

      // Escribir y guardar
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, 'Equipos.xlsx');
    },
    exportarAExcel() {
      const encabezados = this.equipos.map(h => h.text);

      const exportData = this.equipos.map(item => ({
        Serie: item.serie,
        Nombre: item.nombre,
        Propietario: item.propietario.nombre,
        Proveedor: item.proveedor.nombre,
        Cliente: item.cliente.nombre,
        Ubicacion: item.ubicacionNombre,
        Contrato: item.tipoDeContrato,
        ProximoMantenimiento: this.calcularFechaVencimiento(item),
        DiasRestantes: this.calcularDiferencia(item),
      }));
      // Crear hoja y libro
      const ws = XLSX.utils.json_to_sheet(exportData, { origin: 'A1' });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Equipos');

      // Escribir y guardar
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

      saveAs(blob, 'Cronograma MP.xlsx');
    },

    calcularDiferencia(item) {
      const periodicidad = item.referencia?.periodicidadmantenimiento;

      if (periodicidad === 'Libre de mantenimiento') {
        return 'Libre';
      }

      if (!item.fechaDePreventivo) return 'Sin fecha';

      const fechaInicial = new Date(item.fechaDePreventivo);
      const fechaLimite = new Date(fechaInicial);

      switch (periodicidad) {
        case 'Anual':
          fechaLimite.setMonth(fechaLimite.getMonth() + 12);
          break;
        case 'Semestral':
          fechaLimite.setMonth(fechaLimite.getMonth() + 6);
          break;
        case 'Trimestral':
          fechaLimite.setMonth(fechaLimite.getMonth() + 3);
          break;
        default:
          return 'Desconocido';
      }

      const hoy = new Date();
      const diferenciaMs = fechaLimite - hoy;
      const diferenciaDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));

      return `${diferenciaDias}`;
    },


    getChipStyle(item) {
      const periodicidad = item.referencia?.periodicidadmantenimiento;
      if (periodicidad === 'Libre de mantenimiento' || !item.fechaDePreventivo) {
        return {};
      }

      const fechaInicial = new Date(item.fechaDePreventivo);
      const fechaLimite = new Date(fechaInicial);

      switch (periodicidad) {
        case 'Anual':
          fechaLimite.setMonth(fechaLimite.getMonth() + 12);
          break;
        case 'Semestral':
          fechaLimite.setMonth(fechaLimite.getMonth() + 6);
          break;
        case 'Trimestral':
          fechaLimite.setMonth(fechaLimite.getMonth() + 3);
          break;
      }

      const hoy = new Date();
      const diferenciaMs = fechaLimite - hoy;
      const diferenciaDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));


      let color = '';
      let borderColor = '';
      let icon = '';

      if (diferenciaDias > 30) {
        color = '#4CAF50'; // verde
        icon = 'mdi-check-circle';
      } else if (diferenciaDias >= 0 && diferenciaDias <= 30) {
        color = '#FF7043'; // naranja
        icon = 'mdi-alert-circle';
      } else {
        color = '#F44336'; // rojo
        icon = 'mdi-close-circle';
      }

      return {
        color,
        icon,
        border: `2px solid ${borderColor}`,
        'background-color': 'transparent'
      };
    },
    calcularFechaVencimiento(item) {
      const periodicidad = item.referencia?.periodicidadmantenimiento;
      if (periodicidad === 'Libre de mantenimiento' || !item.fechaDePreventivo) return null;

      const fecha = this.obtenerFechaVencimiento(item);
      return fecha.toLocaleDateString('es-CO');
    },

    obtenerFechaVencimiento(item) {
      const fechaInicial = new Date(item.fechaDePreventivo);
      const fechaLimite = new Date(fechaInicial);
      switch (item.referencia?.periodicidadmantenimiento) {
        case 'Anual':
          fechaLimite.setMonth(fechaLimite.getMonth() + 12);
          break;
        case 'Semestral':
          fechaLimite.setMonth(fechaLimite.getMonth() + 6);
          break;
        case 'Trimestral':
          fechaLimite.setMonth(fechaLimite.getMonth() + 3);
          break;
      }
      return fechaLimite;
    },


  },
  actualizarsede() {
    this.sedeactualizada = "funciona";
  },


};
</script>
<style scoped>
/* Estilos responsivos */
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

.v-data-table {
  overflow-x: auto;
  /* Para manejar desbordes horizontales en pantallas pequeñas */
}

button.disabled {
  cursor: not-allowed;
  opacity: 0.5;
  pointer-events: none;
  /* Evita cualquier interacción del usuario */
}

/* Ajustes para pantallas pequeñas */
@media (max-width: 600px) {
  .v-btn {
    font-size: 12px;
    /* Tamaño más pequeño para botones */
  }

  .v-text-field {
    font-size: 14px;
    /* Ajustar tamaño de fuente */
  }

  .mt-15 {
    margin-top: 8px !important;
    /* Reducir margen en dispositivos más pequeños */
  }
}

@media (max-width: 960px) {
  .v-toolbar {
    flex-wrap: wrap;
    /* Asegura que los elementos se ajusten en pantallas medianas */
  }
}
</style>