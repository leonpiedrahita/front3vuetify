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
          <v-text-field v-model="buscar.cliente" label="Cliente" variant="outlined" persistent-hint />
        </v-col>
        <v-col cols="12" sm="6" md="2" class="pa-0 d-flex justify-center justify-sm-center justify-md-start">
          <v-btn class="mb-5" color="primary" min-width="228" size="large" variant="flat" @click="buscarEquipos">
            Buscar Equipos
          </v-btn>
        </v-col>
      </v-row>

      <v-row class="mt-2 flex-nowrap" justify="space-around">
        <v-col class="px-1" cols="auto">
          <v-btn v-permission="['administrador', 'calidad', 'cotizaciones']" class="my-1" color="c6" size="large"
            variant="flat" @click="nuevoEquipo()">
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
          <v-dialog v-model="dialog2" max-width="500px" persistent>
            <v-toolbar flat style="background-color: #52B69A; color: white;">
              <v-toolbar-title class="text-center font-weight-bold">
                {{ formTitle }}
              </v-toolbar-title>
            </v-toolbar>
            <v-card>


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
                      <v-autocomplete v-model="nuevoequipo.cliente.id" :items="clientes" item-title="nombreciudad"
                        item-value="id" label="Seleccione un cliente" required
                        :rules="[(v) => !!v || 'Campo Requerido']">{{ nuevocliente }}</v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-autocomplete v-model="nuevoequipo.ubicacion.id" :items="ubicacionclientes"
                        item-title="nombreDireccionCombinados" item-value="id" label="Sede"
                        :rules="[(v) => !!v || 'Campo Requerido']" required></v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-autocomplete v-model="nuevoequipo.tipoDeContrato" :items="listacontratos"
                        label="Tipo de contrato" class="vs__search" required
                        :rules="[(v) => !!v || 'Campo Requerido']"></v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-autocomplete v-model="nuevoequipo.estado" :items="listaestados" label="Estado"
                        class="vs__search" required :rules="[(v) => !!v || 'Campo Requerido']"></v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-menu v-model="menu1" :close-on-content-click="false" min-width="auto">
                        <template v-slot:activator="{ props }">
                          <v-text-field v-model="fechaDeMovimiento" label="Fecha de movimiento"
                            prepend-icon="mdi-calendar" readonly v-bind="props"></v-text-field>
                        </template>
                        <v-locale-provider locale="es">
                          <v-date-picker locale="es" @update:model-value="cambiarEstadoDeMenu1"
                            v-model="fechadecalendario" color="primary" title="Fecha de inicio"
                            header="Seleccionar Fecha">
                          </v-date-picker>
                        </v-locale-provider>
                      </v-menu>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions class="justify-center">

                <v-btn color="error" variant="flat" text @click="close2"> Cancelar </v-btn>
                <v-btn :disabled="!(
                  nuevoequipo.nombre &&
                  nuevoequipo.serie &&
                  nuevoequipo.placaDeInventario &&
                  nuevoequipo.tipoDeContrato &&
                  nuevoequipo.estado &&
                  nuevoequipo.propietario.nombre &&
                  nuevoequipo.proveedor.nombre &&
                  nuevoequipo.cliente.id &&
                  nuevoequipo.ubicacion.id &&
                  fechaDeMovimiento
                )
                  " color="primary darken-1" variant="flat" text @click="save2">
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
                      <v-autocomplete v-model="equipomodificado.clienteId" :items="clientes" item-title="nombreciudad"
                        item-value="id" label="Seleccione un cliente" required
                        :rules="[(v) => !!v || 'Campo Requerido']">{{
                          nuevoclientemodificado }}</v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-autocomplete v-model="equipomodificado.ubicacionId" :items="ubicacionclientesmodificado"
                        item-title="nombreDireccionCombinados" item-value="id" label="Sede"
                        :rules="[(v) => !!v || 'Campo Requerido']" required></v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-autocomplete v-model="equipomodificado.tipoDeContrato" :items="listacontratos"
                        label="Tipo de contrato" class="vs__search" required
                        :rules="[(v) => !!v || 'Campo Requerido']"></v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-autocomplete v-model="equipomodificado.estado" :items="listaestados" label="Estado"
                        class="vs__search" required :rules="[(v) => !!v || 'Campo Requerido']"></v-autocomplete>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="flat" color="error darken-1" text @click="close2">
                  Cancelar
                </v-btn>
                <v-btn :disabled="!(
                  equipomodificado.nombre &&
                  equipomodificado.serie &&
                  equipomodificado.placaDeInventario &&
                  equipomodificado.tipoDeContrato &&
                  equipomodificado.propietario.nombre &&
                  equipomodificado.proveedor.nombre &&
                  equipomodificado.clienteId &&
                  equipomodificado.ubicacionId
                )
                  " color="primary darken-1" text variant="flat" @click="actualizarequipo">
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
                <v-btn color="error" variant="flat" text @click="close"> Cancelar </v-btn>
                <v-btn color="primary darken-1" variant="flat" text @click="save" v-if="generarreporteseleccionado">
                  Crear reporte
                </v-btn>
                <v-btn color="primary darken-1" variant="flat" text @click="guardarGenerarOrden"
                  v-if="generarordenseleccionado">
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
          <v-dialog v-model="dialogoetapa" max-width="500px" persistent>
            <v-toolbar flat style="background-color: #52B69A; color: white;">
              <v-toolbar-title class="text-center font-weight-bold">
                Gestion de Ingreso
              </v-toolbar-title>
            </v-toolbar>
            <v-card>

              <v-card-text style="max-height: 75vh; overflow-y: auto;">
                <v-select v-model="nuevaEtapa.etapaSeleccionada" :items="etapasDisponiblesPorRol"
                  label="Etapa de Ingreso" required></v-select>

                <v-select v-model="nuevaEtapa.ubicacionEtapaSeleccionada" label="Ubicación del equipo *"
                  :items="['Cuarentena', 'Bodega de equipos usados', 'Taller de ingeniería', 'Bodega Prado', 'Cliente']"
                  :rules="[v => !!v || 'La ubicación es obligatoria']" required variant="outlined"></v-select>

                <v-textarea v-model="nuevaEtapa.comentario" label="Comentario/Observaciones"
                  :rules="[v => !!v || 'El comentario es obligatorio']" required variant="outlined"
                  rows="3"></v-textarea>

                <h2 class="text-h6 text-primary text-center">Nueva Etapa</h2>
                <v-divider class="mt-1 mb-4"></v-divider>

                <v-select v-model="nuevaEtapa.nombre" label="Nombre de la Etapa *" :items=listadeetapas
                  :rules="[v => !!v || 'El nombre es obligatorio']" required variant="outlined"></v-select>

                <v-select v-model="nuevaEtapa.ubicacion" label="Ubicación del equipo *"
                  :items="['Cuarentena', 'Bodega de equipos usados', 'Taller de ingeniería', 'Cliente', 'Dado de baja']"
                  :rules="[v => !!v || 'La ubicación es obligatoria']" required variant="outlined"></v-select>

              </v-card-text>

              <v-card-actions class="justify-center">
                <v-btn color="error" variant="flat" large @click="cancelarEtapa()">
                  Cancelar
                </v-btn>
                <v-btn color="c6" variant="flat" large @click="confirmarEtapa(0)"
                  :disabled="!nuevaEtapa.etapaSeleccionada || !nuevaEtapa.ubicacionEtapaSeleccionada || !nuevaEtapa.comentario || !nuevaEtapa.nombre || !nuevaEtapa.ubicacion">
                  Confirmar Ingreso
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
          <v-dialog v-model="dialogoclientes" transition="dialog-bottom-transition" persistent fullscreen>
            <v-card>

              <!-- TOOLBAR CON COLOR Y ESTILO -->
              <v-toolbar flat style="background-color: #52B69A; color: white;">
                <v-spacer></v-spacer>
                <!-- Botón cerrar flotando a la derecha -->



                <!-- Título centrado en negrilla -->
                <v-toolbar-title class="text-center wrap-text">
                  Nombre: {{ historialclientes.nombre }}<br>
                  Serie: {{ historialclientes.serie }}
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <!-- Botón cerrar a la derecha -->
                <v-btn icon="mdi-close" @click="dialogoclientes = false" variant="text" color="white" class="ml-auto" />
              </v-toolbar>

              <!-- CUERPO DEL DIALOGO -->
              <v-card-text>
                <v-data-table :headers="headersHistorialClientes" :items="historialclientes.historialPropietarios"
                  class="elevation-1" :items-per-page="-1">
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
                <v-icon medium @click="detallesEquipo(item)" :color="item.tipoDeContrato === 'Venta Externo' // Condición de más alta prioridad
          ? 'black' // Color negro si el contrato es 'Venta Externo'
          : !item.documentosLegales || item.documentosLegales.length < 1
            ? 'red'
            : item.documentosLegales.length < 3
              ? 'orange'
              : 'green'
          ">
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

    <v-dialog transition="dialog-bottom-transition" max-width="600" persistent v-model="confirmacionguardado">
      <v-card>
        <v-toolbar class="text-h4" color="primary" dark>¡Genial!</v-toolbar>
        <v-card-text>
          <div class="text-h5 pa-5">
            {{ mensajeDialogo }}
          </div>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn class="c6" variant="flat" @click="AceptarConfirmacionGuardado">Aceptar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!--     <pre> {{ this.nombreUbicacionesClienteModificado}} </pre>
         
 --> </v-card>
  <!-- <pre> {{ clientes }} </pre> -->
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
    nuevaEtapa: {
      etapaSeleccionada: "",
      ubicacionEtapaSeleccionada: "",
      comentario: "",
      nombre: "",
      ubicacion: "",
      responsable: "",
      fecha: "",

    }, // Aquí se guardará la opción elegida por el usuario
    confirmacionguardado: false,
    mensajeDialogo: "",
    menu1: false,
    fechadecalendario: null,
    fechaDeMovimiento: null,
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
    listacontratos: ["Sin asignar", "Comodato", "Venta", "Venta Externo", "Alquiler", "Préstamo", "Demostración", "Fuera de Servicio", "Devuelto al Proveedor"],
    listaestados: ["Nuevo","En servicio", "Disponible", "Disponible Pdte. MP", "En Soporte", "Dado de Baja"],
    nombreUbicacionesCliente: [],
    nombreUbicacionesClienteModificado: [],
    buscar: {
      nombreequipo: "",
      serie: "",
      cliente: "",
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
      { title: "Nombre", key: "nombre", align: "center" },
      /*  { title: "Inventario", value: "placaDeInventario", align: "center" }, */
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
        key: "ubicacionNombre",
      },
      { title: "Contrato", key: "tipoDeContrato", align: "center" },
      { title: "Estado", key: "estado", align: "center" },
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
        roles: ["administrador", "cotizaciones", "calidad"],
      },
      {
        title: "Nuevo Ingreso",
        value: "generarorden",
        sortable: false,
        align: "center",
        roles: ["administrador", "bodega", "cotizaciones","soporte"],
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
        title: "Ciudad",
        align: "center",
        key: "ubicacionNombre",
      },
      {
        title: "Dirección",
        align: "center",
        key: "ubicacionDireccion",
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
      placaDeInventario: "N/A",
      tipoDeContrato: "",
      estado: "",
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
        ciudad: "",
      },
      fechaDeMovimiento: null,
    },
    equipomodificado: {
      nombre: "",
      marca: null,
      id: "",
      serie: "",
      placaDeInventario: "N/A",
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
        ciudad: "",
      },
      propietarioId: null,
      clienteId: null,
      proveedorId: null,
      ubicacionId: null,
      fechaDeMovimiento: null,
    },
    nuevoequipopordefecto: {
      nombre: "",
      marca: null,
      id: "",
      serie: "",
      placaDeInventario: "N/A",
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
        ciudad: "",
        id: "",
      },
      fechaDeMovimiento: null,
    },
  }),

  computed: {
    etapasDisponiblesPorRol() {
      const userRol = this.$store.state.user.rol;

      if (userRol === 'bodega') {
        return ['Cuarentena'];
      } else if (userRol === 'cotizaciones') {
        return ['Cotización aprobada', 'Instalación'];
        } else if (userRol === 'soporte') {
        return ['Soporte ingeniería', 'Soporte aplicaciones'];
      } else if (userRol === 'administrador') {
        // Devuelve todas las opciones si es administrador
        return ['Cuarentena', 'Soporte ingeniería', 'Soporte aplicaciones','Cotización aprobada', 'Instalación'];
      }

      return ['Rol no autorizado'];
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
    'nuevoequipo.cliente.id': function (newValue) {
      // Este watcher se ejecutará cuando nuevoequipo.cliente.nombre cambie
      this.nuevocliente();
    },
    'nuevoequipo.proveedor.nombre': function (newValue) {
      // Este watcher se ejecutará cuando nuevoequipo.proveedor.nombre cambie
      this.nuevoproveedor();
    },
    'equipomodificado.clienteId': function (newValue) {
      // Este watcher se ejecutará cuando 'equipomodificado.cliente.nombre' cambie

      this.nuevoclientemodificado();

    },
    'equipomodificado.propietario.nombre': function (newValue) {
      // Este watcher se ejecutará cuando 'equipomodificado.cliente.nombre' cambie
      this.nuevopropietariomodificado();

    },
    'equipomodificado.proveedor.nombre': function (newValue) {
      // Este watcher se ejecutará cuando 'equipomodificado.cliente.nombre' cambie

      this.nuevoproveedormodificado();

    },
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
    cancelarEtapa() {
      this.dialogoetapa = false; // Cierra el diálogo
      this.dialog = false;
      this.limpiarNuevaEtapa();  // Llama a la función de limpieza
    },

    // Función auxiliar para restablecer los datos
    limpiarNuevaEtapa() {
      this.nuevaEtapa = {
        etapaSeleccionada: null,
        ubicacionEtapaSeleccionada: null,
        comentario: '',
        nombre: null,
        ubicacion: null,
      };
    },
    cambiarEstadoDeMenu1(fechaseleccionadaincio) {

      this.fechaDeMovimiento = fechaseleccionadaincio.getDate() + '-' + (fechaseleccionadaincio.getMonth() + 1) + '-' + fechaseleccionadaincio.getFullYear(); // Los meses en JavaScript van de 0 a 11
      this.nuevoequipo.fechaDeMovimiento = this.formatearSinZona(fechaseleccionadaincio);

      this.menu1 = !this.menu1;
    },
    formatearSinZona(date) {
      const pad = (n, z = 2) => n.toString().padStart(z, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
        ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.` +
        `${pad(date.getMilliseconds(), 3)}`;
    },
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
          clienteNombre: this.buscar.cliente // Por ejemplo, un filtro basado en el nombre del propietario

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
      this.buscarEquipos()
      this.$nextTick(() => {
        this.nuevoequipo.nombre = "";
        this.nuevoequipo.marca = null;
        this.nuevoequipo.id = "";
        this.nuevoequipo.serie = "";
        this.nuevoequipo.placaDeInventario = "N/A";
        this.nuevoequipo.tipoDeContrato = "";
        this.nuevoequipo.propietario.nombre = "";
        this.nuevoequipo.propietario.id = "";
        this.nuevoequipo.cliente.nombre = "";
        this.nuevoequipo.cliente.id = "";
        this.nuevoequipo.proveedor.nombre = "";
        this.nuevoequipo.proveedor.id = "";
        this.nuevoequipo.ubicacion.nombre = "";
        this.nuevoequipo.ubicacion.direccion = "";
        this.nuevoequipo.ubicacion.ciudad = "";
        this.nuevoequipo.ubicacion.id = "";

        this.fechaDeMovimiento = null;
        this.fechadecalendario = null;
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

      // Buscar cliente por ID
      const clienteEncontrado = this.clientes.find(
        (cliente) => cliente.id === this.nuevoequipo.cliente.id
      );
      console.log("clienteEncontrado", clienteEncontrado);

      if (clienteEncontrado) {
        // Buscar sede por ID
        const sedeEncontrada = clienteEncontrado.sedes?.find(
          (sede) => sede.id === this.nuevoequipo.ubicacion.id
        );
        console.log("sedeEncontrada", sedeEncontrada);

        if (sedeEncontrada) {
          this.nuevoequipo.ubicacion.ciudad = sedeEncontrada.ciudad;
          this.nuevoequipo.ubicacion.direccion = sedeEncontrada.direccion;
        } else {
          console.warn("No se encontró la sede con ID:", this.nuevoequipo.ubicacion.id);
          this.nuevoequipo.ubicacion.ciudad = "";
          this.nuevoequipo.ubicacion.direccion = "";
        }
      } else {
        console.warn("No se encontró el cliente con ID:", this.nuevoequipo.cliente.id);
        this.nuevoequipo.ubicacion.ciudad = "";
        this.nuevoequipo.ubicacion.direccion = "";
      }

      // Verificar duplicados: serie e inventario
      const encontrarserie = this.equipos.find(
        (registro) => registro.serie === this.nuevoequipo.serie
      );

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
        this.textodialogo = "El número de inventario ya se encuentra registrado";
        this.dialogo = true;
      } else {
        // Convertir fecha a ISO antes de enviar
        const fechaISO = this.fechadecalendario
          ? new Date(this.fechadecalendario).toISOString()
          : new Date().toISOString();

        console.log("equipo nuevo", this.nuevoequipo);
        console.log("ciudad", this.nuevoequipo.ubicacion.ciudad);
        console.log("direccion", this.nuevoequipo.ubicacion.direccion);


        axios
          .post(
            this.$store.state.ruta + "api/equipo/registrar/",
            {
              nuevoequipo: {
                ...this.nuevoequipo,
                fechaDeMovimiento: fechaISO,
                ubicacionNombre: this.nuevoequipo.ubicacion.ciudad,
                ubicacionDireccion: this.nuevoequipo.ubicacion.direccion,
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
            this.$nextTick(() => {
              this.nuevoequipo.nombre = "";
              this.nuevoequipo.marca = null;
              this.nuevoequipo.id = "";
              this.nuevoequipo.serie = "";
              this.nuevoequipo.placaDeInventario = "N/A";
              this.nuevoequipo.tipoDeContrato = "";
              this.nuevoequipo.propietario.nombre = "";
              this.nuevoequipo.propietario.id = "";
              this.nuevoequipo.cliente.nombre = "";
              this.nuevoequipo.cliente.id = "";
              this.nuevoequipo.proveedor.nombre = "";
              this.nuevoequipo.proveedor.id = "";
              this.nuevoequipo.ubicacion.nombre = "";
              this.nuevoequipo.ubicacion.direccion = "";
              this.nuevoequipo.ubicacion.ciudad = "";
              this.nuevoequipo.ubicacion.id = "";

              this.fechaDeMovimiento = null;
              this.fechadecalendario = null;
            })
            this.mensajeDialogo = "Equipo registrado correctamente";
            this.confirmacionguardado = true;
            this.buscarEquipos();
          })
          .catch((error) => {
            console.log(error);
            return error;
          });

      }

      this.dialog2 = false;
      this.close();
    }
    ,
    actualizarequipo() {
      const clienteEncontrado = this.clientes.find(
        (cliente) => cliente.id === this.equipomodificado.clienteId
      );

      if (clienteEncontrado) {
        // Buscar sede por ID
        const sedeEncontrada = clienteEncontrado.sedes?.find(
          (sede) => sede.id === this.equipomodificado.ubicacionId
        );
        console.log("sedeEncontrada", sedeEncontrada);

        if (sedeEncontrada) {
          this.equipomodificado.ubicacionNombre = sedeEncontrada.ciudad;
          this.equipomodificado.ubicacionDireccion = sedeEncontrada.direccion;

        } else {
          console.warn(
            "No se encontró la sede con ID:",
            this.equipomodificado.ubicacionId
          );
          this.equipomodificado.ubicacionNombre = "";
          this.equipomodificado.ubicacionDireccion = "";
        }
      } else {
        console.warn(
          "No se encontró el cliente con ID:",
          this.equipomodificado.clienteId
        );
        this.equipomodificado.ubicacionNombre = "";
        this.equipomodificado.ubicacionDireccion = "";
      }

      // Verificar inventario duplicado solo si cambió
      if (this.inventarioactual !== this.equipomodificado.placaDeInventario) {
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
          return;
        }
      }

      // Payload para el PATCH
      const payload = {
        ubicacionNombre: this.equipomodificado.ubicacionNombre,
        ubicacionDireccion: this.equipomodificado.ubicacionDireccion,
        clienteId: this.equipomodificado.clienteId,
        propietarioId: this.equipomodificado.propietario.id,
        proveedorId: this.equipomodificado.proveedor.id,
        placaDeInventario: this.equipomodificado.placaDeInventario,
        tipoDeContrato: this.equipomodificado.tipoDeContrato,
        estado: this.equipomodificado.estado,
      };
      console.log("payload", payload);
      // Llamada PATCH
      axios
        .patch(
          `${this.$store.state.ruta}api/equipo/actualizar/${this.equipomodificado.id}`,
          payload,
          {
            headers: {
              token: this.$store.state.token,
            },
          }
        )
        .then((response) => {
          console.log(response);
          /* this.$nextTick(() => {
            this.equipomodificado = this.nuevoequipopordefecto;
          }); */
          this.dialogomodificarequipocliente = false;
          this.mensajeDialogo = "Equipo actualizado correctamente";
          this.confirmacionguardado = true;
          this.buscarEquipos();

        })
        .catch((error) => {
          console.log(error);
          return error;
        });
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
            this.clientes = response.data.map((cliente) => {
              cliente.nombreciudad = `${cliente.nombre} - ${cliente.sedePrincipal?.ciudad || 'Sin ciudad'}`;
              return cliente;
            });

            this.nombresclientes = this.clientes.map((cliente) => cliente.nombreciudad);
          })
          .catch((error) => {
            console.error("Error al obtener clientes:", error);
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


        console.log("equipomodificado2", this.equipomodificado);
        axios
          .get(this.$store.state.ruta + "api/cliente/listar", {
            headers: {
              token: this.$store.state.token,
            },
          })
          .then((response) => {
            this.clientes = response.data.map((cliente) => {
              cliente.nombreciudad = `${cliente.nombre} - ${cliente.sedePrincipal?.ciudad || 'Sin ciudad'}`;
              return cliente;
            }

            );
            this.equipomodificado = Object.assign({}, item);
            console.log("equipomodificado1", this.equipomodificado);
            this.inventarioactual = this.equipomodificado.placaDeInventario;


            this.equipomodificado.cliente = {
              ...this.equipomodificado.cliente,
              nombreciudad: `${this.equipomodificado.ubicacionNombre} - ${this.equipomodificado.ubicacionDireccion || 'Sin ciudad'}`
            };
            this.dialogomodificarequipocliente = true;
            console.log("clientes", this.clientes);

            this.nombresclientes = this.clientes.map((cliente) => cliente.nombreciudad);
            const propietario = this.clientes.find(
              (cliente) => cliente.id === this.equipomodificado.propietarioId
            );

            if (propietario) {
              this.equipomodificado.propietario.id = propietario.id;
              this.equipomodificado.propietario.nombre = propietario.nombreciudad;
            } else {
              this.nuevoequipo.propietario.id = null;
            }
            const proveedor = this.clientes.find(
              (cliente) => cliente.id === this.equipomodificado.proveedorId
            );

            if (proveedor) {
              this.equipomodificado.proveedor.id = proveedor.id;
              this.equipomodificado.proveedor.nombre = proveedor.nombreciudad;
            } else {
              this.nuevoequipo.proveedor.id = null;
            }
          })
          .catch((error) => {
            //console.log(error);
            console.error("Error al obtener clientes:", error);
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
      console.log("historialclientes", this.historialclientes.historialPropietarios);
      this.dialogoclientes = true;
    },
    asignarLista() {
      if (this.$store.state.user.rol === "administrador") {
        this.listadeetapas = [
          "Desinfección","Soporte ingeniería",
          "Soporte aplicaciones"
        ];
      } else if (this.$store.state.user.rol === "soporte") {
        this.listadeetapas = [
          "Soporte ingeniería",
          "Soporte aplicaciones"
        ];
      } else if (this.$store.state.user.rol === "bodega") {
        this.listadeetapas = [
          "Desinfección",

        ];
      } else if (this.$store.state.user.rol === "cotizaciones") {
        this.listadeetapas = ["Soporte ingeniería",
          "Soporte aplicaciones"];
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
    async confirmarEtapa(m) {
      // 1. Verificación de Autenticación (se mantiene igual)
      this.$store.dispatch("autoLogin");
      if (this.$store.state.existe === 0) {
        this.$router.push({ name: "Login" });
        return; // Usamos 'return' para salir de la función, eliminando el gran 'else'
      }

      // 2. Preparación de Datos (Mejora en la legibilidad de la fecha)
      const today = new Date();
      // Formato: (DD-MM-YYYY) usando padStart para 2 dígitos
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      const date = `(${day}-${month}-${year})`;

      this.nuevaEtapa.responsable = this.$store.state.user.nombre;
      this.nuevaEtapa.fecha = date;

      // 3. Inicio del Proceso y Lógica Asíncrona con Try/Catch
      this.esperaguardar = true;

      try {
        const token = this.$store.state.token;
        const rutaBase = this.$store.state.ruta;
        console.log("equipo", this.editedItem.id);
        console.log("nuevaetapa", this.nuevaEtapa);
        // A. API Call 1: Registrar la Etapa
        // Usamos 'await' para esperar la respuesta antes de continuar.
        await axios.post(
          rutaBase + "api/ingreso/registrar",
          {
            equipo: { id: this.editedItem.id },
            etapa: this.nuevaEtapa,
          },
          {
            headers: { token },
          }
        );

        // B. Lógica Condicional: Actualizar Estado del Equipo (Solo para rol 'bodega')
        if (this.$store.state.user.rol === "bodega"|| this.$store.state.user.rol === "soporte"|| this.$store.state.user.rol === "administrador") {
          // Usamos el método PUT o PATCH que es más semántico para actualizaciones parciales
          const responseUpdate = await axios.patch( // Cambiado de POST a PATCH (semántica REST)
            rutaBase + "api/equipo/actualizarestado/" + this.editedItem.id,
            {
              nuevoEstado: "En soporte", // Cambiado 'estado' a 'nuevoEstado' para mayor claridad
            },
            {
              headers: { token },
            }
          );
          console.log('Estado del equipo actualizado:', responseUpdate.data);
        }

        // C. Finalización Exitosa (Fuera de los condicionales)
        this.esperaguardar = false;
        this.dialogoetapa = false;
        this.dialog = false;
        this.limpiarNuevaEtapa();
        this.close();
        this.$router.push({ name: "ListarOrdenes" });

      } catch (error) {
        // D. Manejo de Errores
        this.esperaguardar = false;

        // Uso de encadenamiento opcional (?.) para prevenir errores si 'response' o 'data' no existen
        if (error.response?.data?.error === `El equipo ya tiene un ingreso en estado "Abierto".`) {
          this.textodialogo = error.response.data.error;
          this.dialogoetapa = false;
          this.dialog = false;
          this.limpiarNuevaEtapa();
          this.dialogo = true; // Muestra el diálogo de advertencia específica
        } else {
          // Manejar otros errores (p. ej., error de red, 404, 500 genérico)
          console.error("Error al confirmar etapa:", error);
          // Opcional: mostrar un mensaje de error genérico al usuario
          // this.textodialogo = "Ocurrió un error desconocido. Intente de nuevo.";
          // this.dialogo = true; 
        }
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
        if (cliente.nombreciudad === this.nuevoequipo.propietario.nombre) {
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
        (cliente) => cliente.nombreciudad === this.nuevoequipo.proveedor.nombre
      );

      if (proveedor) {
        this.nuevoequipo.proveedor.id = proveedor.id;
      } else {
        this.nuevoequipo.proveedor.id = null;
      }
    },
    nuevocliente: function () {
      // Buscar cliente por ID
      const clienteSeleccionado = this.clientes.find(
        (cliente) => cliente.id === this.nuevoequipo.cliente.id
      );
      console.log("clienteSeleccionado", this.nuevoequipo.cliente.id);
      if (clienteSeleccionado) {
        // Asignar sedes activas con campo nombreDireccionCombinados
        this.ubicacionclientes = clienteSeleccionado.sedes?.filter(s => s.activa).map(
          (sede) => ({
            ...sede,
            nombreDireccionCombinados: `${sede.ciudad} - ${sede.direccion}`
          })
        ) || [];

        // Extraer solo los nombres combinados (array de strings)
        this.nombreUbicacionesCliente = this.ubicacionclientes.map(
          (s) => s.nombreDireccionCombinados
        );

      } else {
        console.warn("No se encontró el cliente con ID:", this.nuevoequipo.cliente.id);
        this.nuevoequipo.cliente.id = null;
        this.ubicacionclientes = [];
        this.nombreUbicacionesCliente = [];
      }
    },

    nuevopropietariomodificado: function () {
      // `this` apunta a la instancia vm
      this.equipomodificado.propietario.id = this.clientes.map((cliente) => {
        if (cliente.nombreciudad === this.equipomodificado.propietario.nombre) {
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
        if (cliente.nombreciudad === this.equipomodificado.proveedor.nombre) {
          return cliente.id;
        }
      });
      var filtered = this.equipomodificado.proveedor.id.filter(function (el) {
        return el != null;
      });
      this.equipomodificado.proveedor.id = filtered[0];
    },


    nuevoclientemodificado() {
      // Buscar cliente por nombre
      const clienteSeleccionado = this.clientes.find(
        (cliente) => cliente.id === this.equipomodificado.clienteId
      );
      console.log("equipomodificado.clienteId", this.equipomodificado.clienteId)
      console.log("clienteSeleccionado", clienteSeleccionado);

      if (clienteSeleccionado) {
        // Asignar sedes activas con campo nombreDireccionCombinados
        this.ubicacionclientesmodificado = clienteSeleccionado.sedes?.filter(s => s.activa).map(
          (sede) => ({
            ...sede,
            nombreDireccionCombinados: `${sede.ciudad} - ${sede.direccion}`
          })
        ) || [];
        console.log("ubicacionclientesmodificado", this.ubicacionclientesmodificado);



      } else {
        console.warn("No se encontró el cliente con ID:", this.equipomodificado.cliente.id);
        this.equipomodificado.cliente.id = null;
        this.ubicacionclientesmodificado = [];

      }
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
        'Tipo de Contrato': item.tipoDeContrato,
        'Estado': item.estado,

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
    AceptarConfirmacionGuardado() {
      this.confirmacionguardado = false;

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
