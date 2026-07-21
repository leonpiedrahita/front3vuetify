<template>

  <v-card class="pa-2">
    <v-data-table-server :headers="headersfiltrados" :items="equipos" :items-length="totalEquipos"
      v-model:page="paginaActual" v-model:items-per-page="elementosPorPagina"
      :items-per-page-options="[{value:10,title:'10'},{value:25,title:'25'},{value:50,title:'50'}]"
      class="elevation-1" :loading="cargando" loading-text="Cargando ... por favor espere"
      @update:options="cargarEquipos">
      <template v-slot:top>
        <div class="pa-3">
          <v-row align="center">
            <v-col cols="12" sm="6">
              <v-text-field v-model="search" append-icon="mdi-magnify" label="Buscar: Cliente / Nombre / Serie"
                single-line hide-details></v-text-field>
            </v-col>

            <v-col cols="12" sm="6" class="d-flex flex-column flex-sm-row justify-sm-space-around ga-2">
              <v-btn v-permission="['administrador', 'calidad', 'cotizaciones', 'ventas', 'ingresos']" color="c6" size="large"
                variant="flat" @click="nuevoEquipo()">
                Nuevo Equipo
              </v-btn>
              <v-btn color="primary" size="large" @click="abrirCronograma">
                Cronograma
              </v-btn>
              <v-btn v-if="this.$store.state.user.rol !== 'lumira'" color="primary" size="large" @click="exportToExcel">
                Exportar a Excel
              </v-btn>
            </v-col>
          </v-row>
        </div>
        <v-dialog v-model="dialog2" max-width="500px" persistent>
            <v-toolbar flat color="primary">
              <v-toolbar-title class="text-center font-weight-bold">
                {{ formTitle }}
              </v-toolbar-title>
            </v-toolbar>
            <v-card>


              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="12" md="12">
                      <v-autocomplete v-model="nuevoequipo.id" :items="nombresequipos" item-title="title"
                        item-value="id" label="Equipo" required
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
                  " color="success" variant="flat" text @click="save2">
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
                        :disabled="esAplicaciones" required :rules="[(v) => !!v || 'Campo Requerido']"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field v-model="equipomodificado.serie" label="Número de Serie" disabled
                        :rules="[(v) => !!v || 'Campo Requerido']"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-autocomplete v-model="equipomodificado.propietario.nombre" :items="nombresclientes"
                        label="Propietario" class="vs__search" :disabled="esAplicaciones" required
                        :rules="[(v) => !!v || 'Campo Requerido']">{{ nuevopropietariomodificado }}</v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-autocomplete v-model="equipomodificado.proveedor.nombre" :items="nombresclientes"
                        label="Proveedor" class="vs__search" :disabled="esAplicaciones" required
                        :rules="[(v) => !!v || 'Campo Requerido']">{{ nuevoproveedormodificado }}</v-autocomplete>
                    </v-col>

                    <v-col cols="12" sm="12" md="12">
                      <v-autocomplete v-model="equipomodificado.clienteId" :items="clientes" item-title="nombreciudad"
                        item-value="id" label="Seleccione un cliente" required
                        :rules="[(v) => !!v || 'Campo Requerido']">{{ nuevoclientemodificado }}</v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-autocomplete v-model="equipomodificado.ubicacionId" :items="ubicacionclientesmodificado"
                        item-title="nombreDireccionCombinados" item-value="id" label="Sede"
                        :rules="[(v) => !!v || 'Campo Requerido']" required></v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-autocomplete v-model="equipomodificado.tipoDeContrato" :items="listacontratos"
                        label="Tipo de contrato" class="vs__search" :disabled="esAplicaciones" required
                        :rules="[(v) => !!v || 'Campo Requerido']"></v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-autocomplete v-model="equipomodificado.estado" :items="listaestados" label="Estado"
                        class="vs__search" :disabled="esAplicaciones" required
                        :rules="[(v) => !!v || 'Campo Requerido']"></v-autocomplete>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="flat" color="error" text @click="close2">
                  Cancelar
                </v-btn>
                <v-btn :disabled="esAplicaciones
                    ? !(equipomodificado.clienteId && equipomodificado.ubicacionId)
                    : !(
                        equipomodificado.nombre &&
                        equipomodificado.serie &&
                        equipomodificado.placaDeInventario &&
                        equipomodificado.tipoDeContrato &&
                        equipomodificado.propietario.nombre &&
                        equipomodificado.proveedor.nombre &&
                        equipomodificado.clienteId &&
                        equipomodificado.ubicacionId
                      )
                  " color="success" text variant="flat" @click="actualizarequipo">
                  Modificar
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="dialog" max-width="500px">
            <v-card>
              <v-toolbar color="primary" dark flat>
                <v-icon class="ml-3 mr-2">mdi-file-document-plus-outline</v-icon>
                <v-toolbar-title class="font-weight-bold">Se creará un reporte del siguiente equipo</v-toolbar-title>
              </v-toolbar>

              <v-card-text class="pt-4">
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field v-model="editedItem.cliente.nombre" label="Cliente" readonly
                        class="centered-input"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field v-model="editedItem.nombre" label="Nombre" readonly
                        class="centered-input"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <v-text-field v-model="editedItem.serie" label="Serie" readonly
                        class="centered-input"></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="error" variant="flat" text @click="close"> Cancelar </v-btn>
                <v-btn color="success" variant="flat" text @click="save" v-if="generarreporteseleccionado">
                  Crear reporte
                </v-btn>
                <v-btn color="success" variant="flat" text @click="guardarGenerarOrden"
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
                <v-btn color="error" text @click="(dialogo = false), (textodialogo = '')">Cerrar</v-btn>
              </v-card-actions>
            </v-card>

          </v-dialog>
          <v-dialog v-model="dialogoetapa" max-width="500px" persistent>
            <v-toolbar flat color="primary">
              <v-toolbar-title class="text-center font-weight-bold">
                Gestion de Ingreso
              </v-toolbar-title>
            </v-toolbar>
            <v-card>

              <v-card-text style="max-height: 75vh; overflow-y: auto;">
                <v-select v-model="nuevaEtapa.etapaSeleccionada"
                  :items="esIngresoNuevoEquipo ? ['Equipo nuevo'] : etapasDisponiblesPorRol"
                  label="Etapa de Ingreso" required></v-select>

                <v-select v-model="nuevaEtapa.ubicacionEtapaSeleccionada" label="Ubicación del equipo *"
                  :items="ubicacionesEtapaInicial"
                  :rules="[v => !!v || 'La ubicación es obligatoria']" required variant="outlined"></v-select>

                <v-textarea v-model="nuevaEtapa.comentario" label="Comentario/Observaciones"
                  :rules="[v => !!v || 'El comentario es obligatorio']" required variant="outlined"
                  rows="3"></v-textarea>

                <h2 class="text-h6 text-primary text-center">Nueva Etapa</h2>
                <v-divider class="mt-1 mb-4"></v-divider>

                <v-select v-model="nuevaEtapa.nombre" label="Nombre de la Etapa *"
                  :items="esIngresoNuevoEquipo ? ['Listo para despacho'] : etapasParaNuevoIngreso"
                  :rules="[v => !!v || 'El nombre es obligatorio']" required variant="outlined"></v-select>

                <v-select v-model="nuevaEtapa.ubicacion" label="Ubicación del equipo *"
                  :items="ubicacionesNuevaEtapa"
                  :rules="[v => !!v || 'La ubicación es obligatoria']" required variant="outlined"></v-select>

              </v-card-text>

              <v-card-actions class="justify-center">
                <v-btn color="error" variant="flat" large @click="cancelarEtapa()">
                  Cancelar
                </v-btn>
                <v-btn color="success" variant="flat" large @click="consultarEstadoIngreso()"
                  :disabled="!nuevaEtapa.etapaSeleccionada || !nuevaEtapa.ubicacionEtapaSeleccionada || !nuevaEtapa.comentario || !nuevaEtapa.nombre || !nuevaEtapa.ubicacion">
                  Confirmar Ingreso
                </v-btn>
              </v-card-actions>
            </v-card>

          </v-dialog>
          <!-- Diálogo de estado del equipo: se abre al confirmar un ingreso de equipo
               existente cuya etapa requiere definir el estado (Listo para despacho, etc.) -->
          <v-dialog v-model="cambiarestado" persistent width="500">
            <v-card>
              <v-toolbar flat color="primary">
                <v-toolbar-title class="text-center font-weight-bold">
                  Nuevo estado del equipo
                </v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <v-select v-model="nuevoestadoequipo" label="Nuevo estado *" :items="listadeestadosequipo"
                  :rules="[v => !!v || 'El estado es obligatorio']" required></v-select>
              </v-card-text>
              <v-card-actions class="pa-4 bg-grey-lighten-4">
                <v-spacer></v-spacer>
                <v-btn color="error" variant="flat" @click="cancelarCambioEstadoIngreso">Cancelar</v-btn>
                <v-btn :disabled="!nuevoestadoequipo" color="success" variant="flat" @click="confirmarEtapa(0)">
                  Aceptar
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
          <v-dialog v-model="errorGuardar" persistent width="500">
            <v-card>
              <v-toolbar color="error" dark flat>
                <v-icon class="ml-3 mr-2">mdi-alert-circle</v-icon>
                <v-toolbar-title class="font-weight-bold">Error</v-toolbar-title>
              </v-toolbar>
              <v-card-text class="text-body-1 pt-5 pb-3">
                {{ mensajeErrorGuardar }}
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn color="error" variant="flat" class="mb-2 mr-2" @click="errorGuardar = false">Entendido</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogoclientes" transition="dialog-bottom-transition" persistent fullscreen>
            <v-card>

              <!-- TOOLBAR CON COLOR Y ESTILO -->
              <v-toolbar flat color="primary">
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
              <v-toolbar flat color="primary">
                <v-spacer></v-spacer>
                <v-toolbar-title class="pa-0" style="flex: 1;">
                  <div class="text-center font-weight-bold text-body-1 text-md-h6"
                    style="white-space: normal; word-break: break-word; line-height: 1.2;">
                    Cronograma de Mantenimientos Preventivos
                  </div>
                </v-toolbar-title>
                <v-spacer></v-spacer>
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

                  <!-- Botones -->
                  <v-col cols="12" md="6" class="d-flex justify-space-around">
                    <v-btn v-if="['administrador','calidad'].includes($store.state.user.rol)"
                      color="primary" size="large"
                      @click="dialogImprimirCronograma = true; destinatarioSeleccionado = null; equiposSeleccionados = []">
                      <v-icon start>mdi-file-pdf-box</v-icon>
                      Imprimir carta
                    </v-btn>
                    <v-btn color="primary" size="large" @click="exportarAExcel">
                      <v-icon start>mdi-file-excel</v-icon>
                      Exportar a Excel
                    </v-btn>
                  </v-col>
                </v-row>


                <!-- Tabla -->
                <v-data-table :headers="headersCronograma" :items="equiposCronogramaConDias" :search="search" class="elevation-1" :sort-by="[{ key: 'diasRestantesNum', order: 'asc' }]">
                  <!-- PRÓXIMO MANTENIMIENTO -->
                  <template #item.proximoMantenimiento="{ item }">
                    <span v-if="calcularFechaVencimiento(item)">
                      {{ calcularFechaVencimiento(item) }}
                    </span>
                    <span v-else>-</span>
                  </template>

                  <!-- DÍAS RESTANTES -->
                  <template #item.diasRestantesNum="{ item }">
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

              <!-- Diálogo selector para imprimir carta de cronograma -->
              <v-dialog v-model="dialogImprimirCronograma" max-width="700" persistent>
                <v-card>
                  <v-toolbar flat style="background-color:#52B69A; color:white;">
                    <v-icon class="ml-3 mr-2">mdi-file-pdf-box</v-icon>
                    <v-toolbar-title class="font-weight-bold">Generar carta de cronograma</v-toolbar-title>
                  </v-toolbar>
                  <v-card-text class="pt-5 pb-2">
                    <v-autocomplete
                      v-model="destinatarioSeleccionado"
                      :items="opcionesDestinatario"
                      item-title="label"
                      return-object
                      label="Cliente asignado / Propietario / Distribuidor"
                      variant="outlined"
                      clearable
                      @update:modelValue="equiposSeleccionados = []"
                    />
                    <v-autocomplete
                      v-if="destinatarioSeleccionado"
                      v-model="equiposSeleccionados"
                      :items="equiposDisponibles"
                      item-title="title"
                      item-value="value"
                      label="Equipos a incluir en la carta (vacío = todos)"
                      variant="outlined"
                      multiple
                      chips
                      closable-chips
                      clearable
                      class="mt-2"
                    />
                    <div v-if="destinatarioSeleccionado" class="text-caption text-grey mt-2 mb-1">
                      <span v-if="destinatarioCarta.nombre">
                        <strong>Dirigida a:</strong> {{ destinatarioCarta.nombre }}
                        <span v-if="destinatarioCarta.ciudad"> — {{ destinatarioCarta.ciudad }}</span>
                      </span>
                      &nbsp;·&nbsp;
                      <strong>{{ equiposParaCarta.length }}</strong> equipo(s) con MP programado
                    </div>
                  </v-card-text>
                  <v-card-actions class="pa-4 pt-0 justify-end">
                    <v-btn variant="text" @click="dialogImprimirCronograma = false">Cancelar</v-btn>
                    <v-btn color="#52B69A" variant="flat" style="color:white;"
                      :disabled="!destinatarioSeleccionado || equiposParaCarta.length === 0"
                      prepend-icon="mdi-printer"
                      @click="imprimirCronogramaPDF(); dialogImprimirCronograma = false">
                      Imprimir
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>

            </v-card>
          </v-dialog>
          <v-dialog v-model="ventanaDetallesEquipo" transition="dialog-bottom-transition" persistent>
            <v-toolbar flat color="primary">
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
      </template>

      <template v-slot:[`item.atencion`]="{ item }">
        <div class="d-flex flex-column align-center">
          <v-menu v-if="$store.state.user.rol === 'administrador'" offset-y>
            <template v-slot:activator="{ props }">
              <v-chip
                v-if="item.atencion"
                v-bind="props"
                :style="getAtencionStyle(item.atencion)"
                size="small"
                class="font-weight-bold"
                variant="outlined"
                style="cursor:pointer"
              >
                <v-icon :icon="getAtencionStyle(item.atencion).icon" :color="getAtencionStyle(item.atencion).color" start />
                {{ item.atencion }}
              </v-chip>
              <v-btn v-else v-bind="props" icon variant="text" size="small" color="grey">
                <v-icon>mdi-dots-horizontal</v-icon>
              </v-btn>
            </template>
            <v-list density="compact">
              <v-list-item @click="cambiarAtencion(item, 'Autorizado')">
                <v-icon color="green" start>mdi-check-circle</v-icon> Autorizado
              </v-list-item>
              <v-list-item @click="cambiarAtencion(item, 'Cartera')">
                <v-icon color="red" start>mdi-close-circle</v-icon> Cartera
              </v-list-item>
              <v-list-item @click="cambiarAtencion(item, 'MP')">
                <v-icon color="red" start>mdi-alert-circle</v-icon> MP
              </v-list-item>
              <v-divider />
              <v-list-item v-if="item.atencion" @click="cambiarAtencion(item, null)">
                <v-icon color="grey" start>mdi-close</v-icon> Quitar
              </v-list-item>
            </v-list>
          </v-menu>
          <v-chip
            v-else-if="item.atencion"
            :style="getAtencionStyle(item.atencion)"
            size="small"
            class="font-weight-bold"
            variant="outlined"
          >
            <v-icon :icon="getAtencionStyle(item.atencion).icon" :color="getAtencionStyle(item.atencion).color" start />
            {{ item.atencion }}
          </v-chip>
          <span class="text-caption text-medium-emphasis mt-1" style="font-size:0.7rem; line-height:1.2;">
            {{ item.asesor || 'Sin asesor' }}
          </span>
        </div>
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
    </v-data-table-server>

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
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import DetallesEquipoComponent from "./DetallesEquipoComponent.vue";
import biosystemsLogo from '../imagenes/logo/biosystems.jpg';

// Etapas asignables como "Nombre de la Etapa" al crear el primer ingreso de un
// equipo (diálogo "Gestión de Ingreso"), según el rol del usuario.
// Ubicaciones del menú de cambio de etapas (SeguimientoIngresos). El administrador
// usa esta misma lista al crear un ingreso desde un equipo existente.
const UBICACIONES_CAMBIO_ETAPA = ['Cuarentena', 'Bodega de equipos usados', 'Taller de ingeniería', 'Taller Snibe', 'Bodega de despachos', 'Bodega Prado', 'Cliente', 'Dado de baja'];

const ETAPAS_NUEVO_INGRESO_POR_ROL = {
  administrador: ['Equipo nuevo', 'Listo para despacho', 'Desinfección', 'Soporte ingeniería', 'Soporte aplicaciones', 'Repuestos aprobados para entrega', 'Cotización solicitada', 'Entrenamiento realizado'],
  soporte: ['Soporte ingeniería', 'Soporte aplicaciones'],
  aplicaciones: ['Soporte ingeniería', 'Soporte aplicaciones'],
  bodega: ['Desinfección'],
  cotizaciones: ['Soporte ingeniería', 'Soporte aplicaciones', 'Desinfección'],
  ventas: ['Soporte ingeniería', 'Soporte aplicaciones', 'Desinfección'],
  ingresos: ['Soporte ingeniería', 'Soporte aplicaciones', 'Desinfección'],
  comercial: [],
  calidad: [],
  lumira: [],
};

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
    dialogImprimirCronograma: false,
    destinatarioSeleccionado: null,
    equiposSeleccionados: [],
    dialogoclientes: false,
    historialclientes: [],
    dialog: false,
    generarordenseleccionado: false,
    generarreporteseleccionado: false,
    dialog2: false,
    dialogomodificarequipocliente: false,
    dialogo: false,
    dialogoetapa: false,
    cambiarestado: false,
    nuevoestadoequipo: null,
    listadeestadosequipo: ['En soporte', 'En uso', 'Disponible', 'Disponible Pdte. MP.', 'Fuera de servicio', 'Dado de baja'],
    esIngresoNuevoEquipo: false,
    // Id del equipo al que se le registra el ingreso. Propiedad dedicada porque
    // editedItem se resetea en close() (nextTick) y perdería el id antes de confirmar.
    equipoIngresoId: null,
    textodialogo: "",
    errorGuardar: false,
    mensajeErrorGuardar: "",
    search: "",
    cargando: false,
    esperaguardar: false,
    etapaautorizada: "Desinfección",
    observaciones: "",
    totalEquipos: 0,
    paginaActual: 1,
    elementosPorPagina: 20,
    debounceTimer: null,
    _abortController: null,
    equiposCronograma: [],
    etapasParaNuevoIngreso: [],
    listacontratos: ["Sin asignar", "Comodato", "Venta", "Venta Externo", "Alquiler", "Préstamo", "Demostración", "Fuera de Servicio", "Devuelto al Proveedor"],
    listaestados: ["Nuevo","En uso", "Disponible", "Disponible Pdte. MP.","Reservado", "En Soporte", "Fuera de servicio", "Dado de Baja"],
    nombreUbicacionesCliente: [],
    nombreUbicacionesClienteModificado: [],
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
      { title: "Nombre", key: "nombre", align: "center", sortable: false },
      { title: "Serie", value: "serie", align: "center", sortable: false },
      /*  { title: "Inventario", value: "placaDeInventario", align: "center" }, */
      {
        title: "Propietario",
        align: "center",
        key: "propietario.nombre",
        sortable: false,
      },
      {
        title: "Proveedor",
        align: "center",
        key: "proveedor.nombre",
        sortable: false,
      },
      {
        title: "Cliente asignado",
        align: "center",
        key: "cliente.nombre",
        sortable: false,
      },
      {
        title: "Municipio, Departamento",
        align: "center",
        key: "ubicacionNombre",
        sortable: false,
      },
      { title: "Contrato", key: "tipoDeContrato", align: "center", sortable: false },
      { title: "Estado", key: "estado", align: "center", sortable: false },
      {
        title: "Atención/Asesor(a)",
        key: "atencion",
        align: "center",
        sortable: false,
      },
      {
        title: "Detalles",
        value: "detalles",
        sortable: false,
        align: "center",
        roles: ["administrador", "soporte", "aplicaciones", "comercial", "Dir. Comercial", "cotizaciones", "ventas", "ingresos", "calidad", "bodega"],
      },
      {
        title: "Editar",
        value: "editar",
        sortable: false,
        align: "center",
        roles: ["administrador", "cotizaciones", "ventas", "ingresos", "calidad", "aplicaciones"],
      },
      {
        title: "Nuevo Ingreso",
        value: "generarorden",
        sortable: false,
        align: "center",
        roles: ["administrador", "bodega", "cotizaciones", "ventas", "ingresos", "soporte", "aplicaciones"],
      },
      {
        title: "Crear Reporte",
        value: "crear",
        sortable: false,
        align: "center",
        roles: ["administrador", "soporte", "aplicaciones", "comercial", "Dir. Comercial"],
      },
      {
        title: "Historial Clientes",
        value: "clientes",
        sortable: false,
        align: "center",

      },
    ],
    headersCronograma: [
      { title: "Nombre", value: "nombre", align: "center" },
      { title: "Serie", value: "serie", align: "center" },
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
      { title: "Días restantes", key: "diasRestantesNum", align: "center" },


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
    equiposCronogramaConDias() {
      return this.equiposCronograma.map(item => {
        const periodicidad = item.referencia?.periodicidadmantenimiento;
        let diasRestantesNum;

        if (periodicidad === 'Libre de mantenimiento') {
          diasRestantesNum = Infinity; // va al final en orden asc
        } else if (!item.fechaDePreventivo) {
          diasRestantesNum = Infinity;
        } else {
          const fechaLimite = new Date(item.fechaDePreventivo);
          switch (periodicidad) {
            case 'Anual':      fechaLimite.setMonth(fechaLimite.getMonth() + 12); break;
            case 'Semestral':  fechaLimite.setMonth(fechaLimite.getMonth() + 6);  break;
            case 'Trimestral': fechaLimite.setMonth(fechaLimite.getMonth() + 3);  break;
            default:           diasRestantesNum = Infinity;
          }
          if (diasRestantesNum === undefined) {
            diasRestantesNum = Math.floor((fechaLimite - new Date()) / (1000 * 60 * 60 * 24));
          }
        }

        return { ...item, diasRestantesNum };
      });
    },
    esAplicaciones() {
      return this.$store.state.user.rol === 'aplicaciones';
    },
    // Ubicación de la etapa inicial. El administrador (en ingreso de equipo
    // existente) usa la misma lista que el menú de cambio de etapas.
    ubicacionesEtapaInicial() {
      if (!this.esIngresoNuevoEquipo && this.$store.state.user.rol === 'administrador') {
        return UBICACIONES_CAMBIO_ETAPA;
      }
      return ['Bodega de equipos nuevos', 'Cuarentena', 'Bodega de equipos usados', 'Taller de ingeniería', 'Taller Snibe', 'Bodega Prado', 'Cliente'];
    },
    // Ubicación de la nueva etapa. Igual criterio para el administrador.
    ubicacionesNuevaEtapa() {
      if (!this.esIngresoNuevoEquipo && this.$store.state.user.rol === 'administrador') {
        return UBICACIONES_CAMBIO_ETAPA;
      }
      return ['Bodega de equipos nuevos', 'Cuarentena', 'Bodega de equipos usados', 'Taller de ingeniería', 'Taller Snibe', 'Cliente', 'Dado de baja'];
    },
    etapasDisponiblesPorRol() {
      const userRol = this.$store.state.user.rol;

      if (userRol === 'bodega') {
        return ['Cuarentena'];
      } else if (['cotizaciones', 'ventas', 'ingresos'].includes(userRol)) {
        return ['Cotización aprobada', 'Instalación','Cuarentena'];
        } else if (userRol === 'soporte' || userRol === 'aplicaciones') {
        return ['Soporte ingeniería', 'Soporte aplicaciones'];
      } else if (userRol === 'administrador') {
        return ['Equipo nuevo', 'Cuarentena', 'Soporte ingeniería', 'Soporte aplicaciones', 'Cotización aprobada', 'Instalación', 'Repuestos aprobados para entrega', 'Cotización solicitada', 'Entrenamiento realizado'];
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
    opcionesDestinatario() {
      const construir = (entidad, tipo) => {
        if (!entidad?.nombre) return null;
        const tipoLabel = tipo === 'propietario' ? 'Propietario' : tipo === 'cliente' ? 'Cliente' : 'Distribuidor';
        const ciudad = entidad.sedePrincipal?.ciudad || '';
        const label = ciudad ? `${entidad.nombre} — ${ciudad} — ${tipoLabel}` : `${entidad.nombre} — ${tipoLabel}`;
        return { label, nombre: entidad.nombre, ciudad, tipo };
      };
      const agregar = (mapa, obj) => {
        if (!obj) return;
        const key = `${obj.tipo}|${obj.nombre}|${obj.ciudad}`;
        if (!mapa.has(key)) mapa.set(key, obj);
      };
      const propMap = new Map(), cliMap = new Map(), disMap = new Map();
      for (const e of this.equiposCronograma) {
        agregar(propMap, construir(e.propietario, 'propietario'));
        agregar(cliMap,  construir(e.cliente,     'cliente'));
        agregar(disMap,  construir(e.proveedor,   'distribuidor'));
      }
      const ordenar = m => [...m.values()].sort((a, b) => a.nombre.localeCompare(b.nombre));
      return [...ordenar(propMap), ...ordenar(cliMap), ...ordenar(disMap)];
    },
    equiposBaseFiltrados() {
      if (!this.destinatarioSeleccionado) return [];
      const { nombre, tipo } = this.destinatarioSeleccionado;
      return this.equiposCronograma.filter(e => {
        if (tipo === 'propietario') return e.propietario?.nombre === nombre;
        if (tipo === 'cliente')     return e.cliente?.nombre === nombre;
        if (tipo === 'distribuidor') return e.proveedor?.nombre === nombre;
        return false;
      }).filter(e => e.referencia?.periodicidadmantenimiento !== 'Libre de mantenimiento');
    },
    equiposDisponibles() {
      return this.equiposBaseFiltrados.map(e => {
        const fecha = this.calcularFechaVencimiento(e) || 'Sin fecha';
        const serie = e.serie ? ` — ${e.serie}` : '';
        return { title: `${e.nombre}${serie} — ${fecha}`, value: e.id };
      });
    },
    equiposParaCarta() {
      if (!this.destinatarioSeleccionado) return [];
      if (!this.equiposSeleccionados.length) return this.equiposBaseFiltrados;
      return this.equiposBaseFiltrados.filter(e => this.equiposSeleccionados.includes(e.id));
    },
    destinatarioCarta() {
      if (!this.destinatarioSeleccionado) return { nombre: '', ciudad: '' };
      const { nombre, tipo } = this.destinatarioSeleccionado;
      if (tipo === 'distribuidor') return { nombre, ciudad: '' };
      const equipo = this.equiposParaCarta[0];
      const esBiosystems = (equipo?.proveedor?.nombre || '').toLowerCase().includes('biosystems');
      if (!esBiosystems && equipo?.proveedor?.nombre) return { nombre: equipo.proveedor.nombre, ciudad: '' };
      return { nombre, ciudad: equipo?.ubicacionNombre || '' };
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
    search(newVal) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.paginaActual = 1;
        this.buscarEquipos();
      }, 500);
    },
    dialog(val) {
      val || this.close();
    },
    'nuevoequipo.id': function (newValue) {
      // Este watcher se ejecutará cuando se seleccione una referencia (por id, siempre único)
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
      this.asignarEtapasNuevoIngreso();
      this.buscarEquipos();
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
      this.esIngresoNuevoEquipo = false;
      this.cambiarestado = false;
      this.nuevoestadoequipo = null;
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
    buscarEquipos() {
      // Cancela la petición anterior si aún está en vuelo
      if (this._abortController) {
        this._abortController.abort();
      }
      this._abortController = new AbortController();

      this.cargando = true;
      this.$axios
        .post(this.$store.state.ruta + "api/equipo/buscarequipos", {
          texto: this.search,
          page: this.paginaActual,
          limit: this.elementosPorPagina,
        }, {
          headers: { token: this.$store.state.token },
          signal: this._abortController.signal,
        })
        .then((response) => {
          this.equipos = response.data.equipos;
          this.totalEquipos = response.data.total;
          this.cargando = false;
        })
        .catch((error) => {
          if (error.code === 'ERR_CANCELED') return; // Ignorar peticiones canceladas (AbortController)
          console.error("Error al buscar equipos:", error);
          this.cargando = false;
        });
    },
    cargarEquipos({ page, itemsPerPage }) {
      this.paginaActual = page;
      this.elementosPorPagina = itemsPerPage;
      this.buscarEquipos();
    },
    abrirCronograma() {
      this.VentanaCronograma = true;
      this.$axios
        .get(this.$store.state.ruta + "api/equipo/listartodos", {
          headers: { token: this.$store.state.token },
        })
        .then((response) => {
          this.equiposCronograma = response.data;
        })
        .catch((error) => {
          console.error("Error al cargar cronograma:", error);
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
      this.equipoIngresoId = this.editedItem.id;
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

      {
        // Convertir fecha a ISO antes de enviar
        const fechaISO = this.fechadecalendario
          ? new Date(this.fechadecalendario).toISOString()
          : new Date().toISOString();

        console.log("equipo nuevo", this.nuevoequipo);
        console.log("ciudad", this.nuevoequipo.ubicacion.ciudad);
        console.log("direccion", this.nuevoequipo.ubicacion.direccion);

        this.esperaguardar = true;
        this.$axios
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
            this.esperaguardar = false;
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
            this.buscarEquipos();
            this.editedItem.id = response.data.equipo.id;
            this.equipoIngresoId = response.data.equipo.id;
            this.esIngresoNuevoEquipo = true;
            this.nuevaEtapa.etapaSeleccionada = 'Equipo nuevo';
            this.nuevaEtapa.ubicacionEtapaSeleccionada = 'Bodega de equipos nuevos';
            this.nuevaEtapa.nombre = 'Listo para despacho';
            this.nuevaEtapa.ubicacion = 'Bodega de equipos nuevos';
            this.dialogoetapa = true;
            this.dialog2 = false;
            this.close();
          })
          .catch((error) => {
            if (error.response?.status === 409) {
              this.esperaguardar = false;
              this.textodialogo = "El número de serie ya se encuentra registrado";
              this.dialogo = true;
            } else {
              this.mostrarErrorGuardar();
            }
          });

      }
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
      this.esperaguardar = true;
      this.$axios
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
          this.esperaguardar = false;
          /* this.$nextTick(() => {
            this.equipomodificado = this.nuevoequipopordefecto;
          }); */
          this.dialogomodificarequipocliente = false;
          this.mensajeDialogo = "Equipo actualizado correctamente";
          this.confirmacionguardado = true;
          this.buscarEquipos();

        })
        .catch((error) => {
          console.error(error);
          this.mostrarErrorGuardar();
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
            this.nombresequipos = this.refequipos.map((equipo) => ({
              title: equipo.marca ? `${equipo.nombre} - ${equipo.marca}` : equipo.nombre,
              id: equipo.id,
            }));
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
    async detallesEquipo(item) {
      try {
        const response = await axios.get(
          this.$store.state.ruta + `api/equipo/listaruno/${item.id}`,
          { headers: { token: this.$store.state.token } }
        );
        this.$store.dispatch("guardarDetallesEquipo", {
          detallesequipo: response.data,
        });
        this.ventanaDetallesEquipo = true;
      } catch (err) {
        console.error("Error al cargar detalles del equipo:", err);
      }
    },
    mostrarHistorialClientes(item) {

      this.historialclientes = Object.assign({}, item)
      console.log("historialclientes", this.historialclientes.historialPropietarios);
      this.dialogoclientes = true;
    },
    asignarEtapasNuevoIngreso() {
      this.etapasParaNuevoIngreso = ETAPAS_NUEVO_INGRESO_POR_ROL[this.$store.state.user.rol] || [];
    },
    // Gate previo a confirmar el ingreso: si es un equipo existente y la etapa
    // requiere definir estado (Listo para despacho, Finalizado, Cancelado), abre
    // el diálogo de estado; en otro caso confirma directamente. El flujo de
    // equipo nuevo conserva su estado automático ("Nuevo").
    consultarEstadoIngreso() {
      const requiereEstado = ["Finalizado", "Cancelado", "Listo para despacho"].includes(this.nuevaEtapa.nombre);
      if (!this.esIngresoNuevoEquipo && requiereEstado) {
        this.cambiarestado = true;
      } else {
        this.confirmarEtapa(0);
      }
    },
    cancelarCambioEstadoIngreso() {
      this.cambiarestado = false;
      this.nuevoestadoequipo = null;
    },
    async confirmarEtapa(m) {
      // Cierra el diálogo de estado si estaba abierto (un solo diálogo a la vez)
      this.cambiarestado = false;
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
        console.log("equipo", this.equipoIngresoId);
        console.log("nuevaetapa", this.nuevaEtapa);
        // A. API Call 1: Registrar la Etapa
        // Usamos 'await' para esperar la respuesta antes de continuar.
        await this.$axios.post(
          rutaBase + "api/ingreso/registrar",
          {
            equipo: { id: this.equipoIngresoId },
            etapa: this.nuevaEtapa,
          },
          {
            headers: { token },
          }
        );

        // C. Finalización Exitosa
        this.esperaguardar = false;
        this.dialogoetapa = false;
        this.dialog = false;
        const eraIngresoNuevoEquipo = this.esIngresoNuevoEquipo;
        const etapaEraEquipoNuevo = this.nuevaEtapa.etapaSeleccionada === 'Equipo nuevo';
        const estadoDefinido = this.nuevoestadoequipo; // estado elegido en el diálogo (si aplica)
        this.limpiarNuevaEtapa();
        this.nuevoestadoequipo = null;
        this.close();

        // B. Actualizar Estado del Equipo (no bloquea el cierre del diálogo)
        const esNuevoEquipo = eraIngresoNuevoEquipo || etapaEraEquipoNuevo;
        const rolActualiza = ["bodega", "soporte", "aplicaciones", "administrador"].includes(this.$store.state.user.rol);
        let nuevoEstado = null;
        if (esNuevoEquipo) {
          nuevoEstado = "Nuevo";
        } else if (estadoDefinido) {
          nuevoEstado = estadoDefinido; // el usuario definió el estado (Listo para despacho, etc.)
        } else if (rolActualiza) {
          nuevoEstado = "En soporte";
        }
        if (nuevoEstado) {
          this.$axios.patch(
            rutaBase + "api/equipo/actualizarestado/" + this.equipoIngresoId,
            { nuevoEstado },
            { headers: { token } }
          ).then(r => console.log('Estado del equipo actualizado:', r.data))
           .catch(e => console.warn('No se pudo actualizar el estado del equipo:', e.message));
        }

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
          this.mostrarErrorGuardar();
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
    mostrarErrorGuardar(mensaje) {
      this.esperaguardar = false;
      this.mensajeErrorGuardar = mensaje || 'No se pudo completar la acción. Por favor verifique su conexión e intente nuevamente.';
      this.errorGuardar = true;
    },
    nuevamarca: function () {
      // `this` apunta a la instancia vm
      // Resuelve por id (siempre único) en vez de por nombre, ya que dos referencias
      // distintas pueden compartir el mismo nombre si son de marcas diferentes.
      const referencia = this.refequipos.find((equipo) => equipo.id === this.nuevoequipo.id);
      this.nuevoequipo.nombre = referencia ? referencia.nombre : "";
      this.nuevoequipo.marca = referencia ? referencia.marca : null;
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
    async exportToExcel() {
      try {
        const response = await axios.get(
          this.$store.state.ruta + "api/equipo/listartodos",
          { headers: { token: this.$store.state.token } }
        );
        const exportData = response.data.map(item => ({
          Nombre: item.nombre,
          Serie: item.serie,
          Marca: item.marca,
          Cliente: item.cliente.nombre,
          Proveedor: item.proveedor.nombre,
          Propietario: item.propietario.nombre,
          'Ubicación': item.ubicacionNombre,
          'Dirección Ubicación': item.ubicacionDireccion,
          Estado: item.estado,
          'Tipo de Contrato': item.tipoDeContrato,
        }));
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Equipos');
        if (exportData.length) ws.columns = Object.keys(exportData[0]).map(k => ({ header: k, key: k, width: 22 }));
        ws.addRows(exportData);
        const buffer = await wb.xlsx.writeBuffer();
        saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'Equipos.xlsx');
      } catch (err) {
        console.error("Error al exportar a Excel:", err);
      }
    },
    async exportarAExcel() {
      try {
        const exportData = this.equiposCronograma.map(item => ({
          Nombre: item.nombre,
          Serie: item.serie,
          Propietario: item.propietario?.nombre ?? '',
          Proveedor: item.proveedor?.nombre ?? '',
          Cliente: item.cliente?.nombre ?? '',
          Ubicacion: item.ubicacionNombre,
          Contrato: item.tipoDeContrato,
          ProximoMantenimiento: this.calcularFechaVencimiento(item),
          DiasRestantes: this.calcularDiferencia(item),
        }));
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Equipos');
        if (exportData.length) ws.columns = Object.keys(exportData[0]).map(k => ({ header: k, key: k, width: 22 }));
        ws.addRows(exportData);
        const buffer = await wb.xlsx.writeBuffer();
        saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'Cronograma MP.xlsx');
      } catch (err) {
        console.error('Error al exportar cronograma a Excel:', err);
      }
    },

    async imprimirCronogramaPDF() {
      const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const hoy = new Date();
      const dia = hoy.getDate();
      const mesNombre = hoy.toLocaleDateString('es-CO', { month: 'long' });
      const anio = hoy.getFullYear();
      const fechaStr = `Medellín ${dia} de ${mesNombre} de ${anio}`;

      const dest = this.destinatarioCarta;
      const usuario = this.$store.state.user;

      let firma = null;
      try {
        const { data } = await this.$axios.get(
          this.$store.state.ruta + 'api/usuario/buscarfirma',
          { headers: { token: this.$store.state.token } }
        );
        firma = data.firma;
      } catch { /* sin firma registrada */ }

      const filas = this.equiposParaCarta.map(item => {
        const fv = this.obtenerFechaVencimiento(item);
        const mesMP = fv
          ? fv.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
          : '-';
        const mesCap = mesMP.charAt(0).toUpperCase() + mesMP.slice(1);
        return `<tr>
          <td>${esc(item.nombre)}</td>
          <td>${esc(item.serie)}</td>
          <td>${mesCap}</td>
        </tr>`;
      }).join('');

      const firmaHtml = firma && /^data:image\/(png|jpeg|webp|gif);base64,/.test(firma)
        ? `<img src="${firma}" style="height:75px;display:block;margin-bottom:2px;" />`
        : '';

      const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Cronograma MP - ${esc(dest.nombre)} - ${this.equiposSeleccionados.length ? `${this.equiposSeleccionados.length} equipo(s)` : 'Todos los equipos'}</title>
<style>
  @page { margin: 1.8cm 2cm 2.5cm; }
  body { font-family: Arial, sans-serif; font-size: 11pt; color: #111; margin: 0; padding: 1.8cm 2cm 2.5cm; box-sizing: border-box; }
  @media print {
    body { padding: 0; }
  }
  .header-wrap { text-align: right; margin-bottom: 28px; }
  p { margin: 0 0 14px; }
  .destinatario { margin-bottom: 20px; line-height: 1.9; }
  .cuerpo { text-align: justify; line-height: 1.65; }
  table.cronograma { border-collapse: collapse; margin: 22px auto; min-width: 55%; }
  table.cronograma th { background: #fff; color: #000; padding: 7px 18px; text-align: center; font-weight: bold; border: 1px solid #000; }
  table.cronograma td { border: 1px solid #000; padding: 6px 18px; text-align: center; }
  .firma { margin-top: 40px; }
  .footer-bar { position: fixed; bottom: 0; left: 0; right: 0;
                border-top: 1px solid #bbb; text-align: center;
                font-size: 8pt; color: #555; padding: 6px 2cm; box-sizing: border-box; background: white; }
</style>
</head>
<body>
<div class="header-wrap">
  <img src="${biosystemsLogo}" style="max-height:65px;" />
</div>

<p>${fechaStr}</p>

<div class="destinatario">
  <strong>Dirigido a:</strong><br>
  <strong>${esc(dest.nombre)}</strong>${dest.ciudad ? `<br>${esc(dest.ciudad)}` : ''}
</div>

<p>Reciban un cordial saludo,</p>

<p class="cuerpo">Por medio de la presente les informamos el cronograma de mantenimiento preventivo de los analizadores instalados en su laboratorio.</p>

<table class="cronograma">
  <thead><tr><th>Equipo</th><th>Número de Serie</th><th>Mes</th></tr></thead>
  <tbody>${filas}</tbody>
</table>

<p class="cuerpo">La fecha exacta de la visita será programada de manera anticipada, con el fin de no afectar el normal desarrollo de las actividades del laboratorio.</p>

<p class="cuerpo">En el caso de los equipos propiedad del usuario, dicha programación se llevará a cabo conforme a los términos establecidos en un contrato de servicio vigente o, en su defecto, previa aceptación de la cotización correspondiente para la prestación del servicio de mantenimiento.</p>

<div class="firma">
  <p>Atentamente,</p>
  ${firmaHtml}
  <p><strong>${esc(usuario.nombre)}</strong><br>Biosystems S.A.S.</p>
</div>

<div class="footer-bar">
  Transversal 5A No. 45-139, Patio Bonito – El Poblado - Teléfono 312 07 00 - Medellín - Colombia &nbsp;|&nbsp;
  E-mail: ventas@biosystems.com.co - cotizaciones@biosystems.com.co &nbsp;|&nbsp;
  Página web: www.biosystems.com.co
</div>
</body>
</html>`;

      const ventana = window.open('', '_blank', 'width=900,height=700,menubar=no,toolbar=no,location=no,status=no');
      if (!ventana) {
        alert('El navegador bloqueó la ventana emergente. Por favor, permite las ventanas emergentes para este sitio e intenta de nuevo.');
        return;
      }
      ventana.document.write(html);
      ventana.document.close();
      ventana.focus();
      setTimeout(() => { ventana.print(); }, 600);
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
    getAtencionStyle(atencion) {
      const estilos = {
        'Autorizado':  { color: '#4CAF50', icon: 'mdi-check-circle' },
        'Cartera':     { color: '#F44336', icon: 'mdi-close-circle' },
        'MP':          { color: '#F44336', icon: 'mdi-alert-circle' },
        'Cartera - MP':{ color: '#B71C1C', icon: 'mdi-alert-octagon' },
      };
      return estilos[atencion] || { color: '#9E9E9E', icon: 'mdi-help-circle' };
    },

    async cambiarAtencion(item, valor) {
      try {
        const ruta = this.$store.state.ruta;
        const token = this.$store.state.token;
        await this.$axios.patch(
          `${ruta}api/equipo/actualizaratencion/${item.id}`,
          { atencion: valor },
          { headers: { token } }
        );
        item.atencion = valor;
      } catch (err) {
        console.error('Error al actualizar atención:', err);
      }
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
