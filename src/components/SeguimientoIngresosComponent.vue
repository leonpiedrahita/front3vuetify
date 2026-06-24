<template>
    <v-card class="pb-4">
        <v-toolbar flat color="primary">

            <!-- Botón cerrar flotando a la derecha -->



            <!-- Título centrado en negrilla -->
            <v-toolbar-title class="text-center font-weight-bold">
                Equipo: {{ ingreso.equipo.nombre }} &nbsp; | &nbsp;
                Serie: {{ ingreso.equipo.serie }}&nbsp; | &nbsp;
                Cliente: {{ ingreso.equipo.cliente.nombre }} - {{ ingreso.equipo.ubicacionNombre}}
            </v-toolbar-title>

            <!-- Botón cerrar a la derecha -->
        </v-toolbar>
        <div class="d-flex justify-center align-center mb-2 mt-2"
            v-if="ingreso.estado === 'Abierto' && this.$store.state.user.rol !== 'comercial' && this.$store.state.user.rol !== 'calidad'">

            <v-btn color="c6" prepend-icon="mdi-plus" @click="abrirDialogoNuevaEtapa">
                Actualizar etapa
            </v-btn>
        </div>
        <v-container>
        <v-timeline align="start" density="confortable" truncate-line="both" >
            <v-timeline-item v-for="(etapa, index) in ingreso.etapas" :key="etapa.id" dot-color="primary" size="small">
                <!-- Dibuja el número en el dot -->
                <!-- Slot para mostrar el número como ícono -->
                <template v-slot:icon>
                    <div class="d-flex align-center justify-center rounded-circle primary text-white"
                        style="width: 24px; height: 24px; font-size: 12px;">
                        {{ index + 1 }}
                    </div>
                </template>
                <template v-slot:opposite>
                    <div class="d-flex flex-column align-end text-end">
                        <div class="text-subtitle-1"><strong class="me-4">{{ etapa.fecha || 'Sin fecha' }}</strong></div>
                        <div class="text-h6"><strong>{{ etapa.nombre }}</strong></div>
                    </div>
                </template>
                <div>
                    <div class="text-body-1 mb-1">
                <strong>Comentario:</strong> {{ etapa.comentario || 'Sin comentario' }}
            </div>
            <div class="text-body-1 mb-1">
                <strong>Ubicación:</strong> {{ etapa.ubicacion || 'Sin ubicación' }}
            </div>
            <div class="text-body-1">
                <strong>Responsable:</strong> {{ etapa.responsable || 'No asignado' }}
            </div>
            <div v-if="etapa.confirmado === false && etapa.nombre !== 'Despachado'" class="mt-2 d-flex align-center flex-wrap" style="gap: 8px;">
                <v-chip color="warning" variant="tonal" prepend-icon="mdi-truck-delivery-outline" size="small">
                    En tránsito
                </v-chip>
                <v-btn
                    v-if="puedeConfirmarUbicacion(etapa.ubicacion)"
                    color="success"
                    variant="flat"
                    size="small"
                    prepend-icon="mdi-check-circle-outline"
                    :loading="confirmando === etapa.id"
                    @click="confirmarLlegada(etapa)"
                >
                    Confirmar movimiento
                </v-btn>
            </div>
            <div v-if="etapa.confirmadoPor" class="mt-1 text-caption text-grey">
                Ubicación confirmada por: {{ etapa.confirmadoPor }}
            </div>
                </div>
            </v-timeline-item>
        </v-timeline>
        </v-container>
    </v-card>
    <v-dialog v-model="dialogoNuevaEtapa" transition="dialog-bottom-transition" persistent max-width="800">
        <v-toolbar flat color="primary">
            <v-toolbar-title class="text-center font-weight-bold text-h5">
                Añadir nueva etapa
            </v-toolbar-title>
        </v-toolbar>

        <v-card>
            <v-card-text>
                <v-form ref="formNuevaEtapa">
                    <v-container>
                        <v-row>
                            <v-col cols="12" sm="6">
                                <h2 class="text-h6 text-primary text-center">Etapa actual</h2>
                                <p class="text-center text-body-3 text-black font-weight-bold">
                                    {{ ingreso.etapas[ingreso.etapas.length - 1].nombre }}
                                </p>
                            </v-col>
                            <v-col cols="12" sm="6">
                                <h2 class="text-h6 text-primary text-center">Ubicación actual</h2>
                                <p class="text-center text-body-3 text-black font-weight-bold">
                                    {{ ingreso.etapas[ingreso.etapas.length - 1].ubicacion }}
                                </p>
                            </v-col>

                            <v-col cols="12">
                                <v-textarea v-model="nuevaEtapa.comentario" label="Comentario/Observaciones"
                                    :rules="[v => !!v || 'El comentario es obligatorio']" required
                                    variant="outlined"></v-textarea>
                            </v-col>
                            <v-col cols="12">
                                <h2 class="text-h6 text-primary text-center">Nueva Etapa y Ubicación</h2>
                                <v-divider class="mt-1 mb-4"></v-divider>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-select v-model="nuevaEtapa.nombre" label="Nombre de la Etapa *" :items=etapasDisponibles
                                    :rules="[v => !!v || 'El nombre es obligatorio']" required
                                    variant="outlined"></v-select>
                            </v-col>

                            <v-col cols="12" md="6">
                                <v-select v-model="nuevaEtapa.ubicacion" label="Ubicación del equipo *"
                                    :items="['Cuarentena', 'Bodega de equipos usados', 'Taller de ingeniería', 'Taller Snibe', 'Bodega de despachos', 'Bodega Prado', 'Cliente', 'Dado de baja']"
                                    :rules="[v => !!v || 'La ubicación es obligatoria']" required
                                    variant="outlined"></v-select>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-form>
            </v-card-text>

            <v-card-actions class="pa-4 bg-grey-lighten-4">
                <v-spacer></v-spacer>
                <v-btn color="error" variant="flat" @click="cerrarDialogoNuevaEtapa">Cancelar</v-btn>
                <v-btn color="success" variant="flat" @click="consultarEstado">Guardar Etapa</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-dialog v-model="esperarguardar" persistent width="500">
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
    <v-dialog v-model="cambiarestado" persistent width="500">
        <v-card>
            <v-toolbar flat color="primary">
                <v-toolbar-title class="text-center font-weight-bold">
                    Nuevo estado del equipo
                </v-toolbar-title>
                <v-spacer></v-spacer>

            </v-toolbar>
            <v-card-text>
                <v-select v-model="nuevoestadoequipo" label="Nuevo estado *" :items=listadeestadosequipo
                    :rules="[v => !!v || 'El estado es obligatorio']" required>
                </v-select>
            </v-card-text>
            <v-card-actions class="pa-4 bg-grey-lighten-4">
                <v-spacer></v-spacer>
                <v-btn color="error" variant="flat" @click="cancelarCambioEstado">Cancelar</v-btn>
                <v-btn :disabled="!nuevoestadoequipo" color="success" variant="flat" @click="guardarNuevaEtapa">
                    Aceptar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <!-- <pre>{{ ingreso.etapas[ingreso.etapas.length - 1].nombre }}</pre>
    <pre>{{ ingreso }}</pre> -->
</template>

<script>
// Etapas asignables como "Nombre de la Etapa" al añadir una etapa a un
// ingreso ya existente (diálogo "Añadir nueva etapa"), según el rol del usuario.
const ETAPAS_DISPONIBLES_POR_ROL = {
    administrador: ['Cuarentena', 'Soporte ingeniería', 'Soporte aplicaciones', 'Listo para despacho', 'Cotización solicitada', 'Cotización aprobada', 'Pdte. de repuestos', 'Pdte. de aprobación de repuestos', 'Despachado', 'Finalizado', 'Cancelado'],
    soporte: ['Soporte ingeniería', 'Soporte aplicaciones', 'Cotización solicitada', 'Pdte. de repuestos', 'Pdte. de aprobación de repuestos', 'Listo para despacho', 'Finalizado', 'Cancelado'],
    aplicaciones: ['Soporte ingeniería', 'Soporte aplicaciones', 'Cotización solicitada', 'Pdte. de repuestos', 'Pdte. de aprobación de repuestos', 'Listo para despacho', 'Finalizado', 'Cancelado'],
    lumira: ['Soporte ingeniería', 'Soporte aplicaciones', 'Cotización solicitada', 'Pdte. de repuestos', 'Pdte. de aprobación de repuestos', 'Listo para despacho', 'Finalizado', 'Cancelado'],
    bodega: ['Cuarentena', 'Despachado', 'Soporte ingeniería', 'Soporte aplicaciones'],
    cotizaciones: ['Soporte ingeniería', 'Soporte aplicaciones', 'Cotización aprobada', 'Cancelado', 'Cuarentena', 'Despachado'],
    ventas: ['Soporte ingeniería', 'Soporte aplicaciones', 'Cotización aprobada', 'Cancelado', 'Cuarentena', 'Despachado'],
    ingresos: ['Soporte ingeniería', 'Soporte aplicaciones', 'Cotización aprobada', 'Cancelado', 'Cuarentena', 'Despachado'],
    comercial: [],
    calidad: [],
};

export default {
    data() {
        // --- Datos Fijos de Ejemplo (Simulación de API) ---
        const ingreso = null;
        const esperarguardar = false;
        const etapasDisponibles = [];
        const nuevoEstado = null;
        const modeloEtapaInicial = {
            nombre: '',
            comentario: '',
            responsable: '',
            fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            ubicacion: null,
        };

        return {
            confirmando: null,
            cambiarestado: false,
            nuevoestadoequipo: null,
            listadeestadosequipo: ['En soporte', 'En uso', 'Disponible', 'Disponible Pdte. MP.', 'Fuera de servicio', 'Dado de baja'],
            ingreso,
            esperarguardar, // Antes no se incluía aquí: this.esperarguardar nunca era reactivo
            etapasDisponibles,
            nuevoEstado,
            dialogoNuevaEtapa: false, // Reemplaza ref(false)
            modeloEtapaInicial,
            nuevaEtapa: { ...modeloEtapaInicial }, // Reemplaza ref({ ... })
            // formNuevaEtapa necesita una ref en la plantilla, se accede vía this.$refs
            errorGuardar: false,
            mensajeErrorGuardar: "",
        };
    },
    methods: {

        // --- Funciones de Lógica ---
        abrirDialogoNuevaEtapa() {
            // Usa Object.assign para copiar las propiedades
            Object.assign(this.nuevaEtapa, this.modeloEtapaInicial);

            // Accede a la referencia del formulario usando this.$refs
            if (this.$refs.formNuevaEtapa) {
                this.$refs.formNuevaEtapa.resetValidation();
            }
            this.dialogoNuevaEtapa = true;
        },

        cerrarDialogoNuevaEtapa() {
            this.dialogoNuevaEtapa = false;
        },

        cancelarCambioEstado() {
            this.cambiarestado = false;
            this.nuevoestadoequipo = null;
        },

        async guardarNuevaEtapa() {
            // 1. Validación del Formulario (Vuetify)
            // Se extrae 'valid' de la validación asíncrona del formulario
            const { valid } = await this.$refs.formNuevaEtapa.validate();

            if (!valid) {
                alert('Por favor, complete todos los campos obligatorios.');
                return; // Detiene la ejecución si el formulario no es válido
            }

            // 2. Verificación de Autenticación
            this.$store.dispatch("autoLogin");
            if (this.$store.state.existe === 0) {
                this.$router.push({ name: "Login" });
                return; // Detiene la ejecución si no está logueado
            }

            // --- Preparación de Datos ---
            // Se captura antes de cerrar el sub-diálogo "Nuevo estado del equipo", para que
            // solo se vea un diálogo a la vez: o bien "Por favor espere..." directamente
            // (si no hubo cambio de estado), o el sub-diálogo hasta dar Aceptar y ahí "Por favor espere...".
            const habiaCambioEstado = this.cambiarestado;
            this.cambiarestado = false;
            this.esperarguardar = true;

            // Mejora 1: Formato de fecha más limpio con template literals y padStart
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const year = today.getFullYear();
            const date = `(${day}-${month}-${year})`;

            // Actualización de contadores locales
            this.ingreso.etapaActual++;
            this.ingreso.ultimaEtapa++;

            // Lógica para determinar el nuevo estado del ingreso
            let nuevoEstado = "Abierto";
            if (["Despachado", "Finalizado", "Cancelado"].includes(this.nuevaEtapa.nombre)) {
                nuevoEstado = "Cerrado";
            }
            this.nuevoEstado = nuevoEstado; // Asume que 'nuevoEstado' es una propiedad de data

            // Definición del payload para la API (Mejora 2: Uso de constantes para API)
            const token = this.$store.state.token;
            const rutaBase = this.$store.state.ruta;
            const ingresoId = this.ingreso.id;

            const payloadEtapa = {
                nombre: this.nuevaEtapa.nombre,
                comentario: this.nuevaEtapa.comentario,
                responsable: this.$store.state.user.nombre,
                fecha: date,
                etapaActual: this.ingreso.etapaActual,
                ultimaEtapa: this.ingreso.ultimaEtapa,
                ubicacion: this.nuevaEtapa.ubicacion,
                estado: nuevoEstado,
                nuevoestadoequipo: habiaCambioEstado ? this.nuevoestadoequipo : null,
            };

            try {
                // 3. API Call 1: Agregar Etapa
                // Mejora 3: Uso de await para esperar la respuesta de la primera API
                const responseEtapa = await this.$axios.post(
                    `${rutaBase}api/ingreso/agregaretapa/${ingresoId}`,
                    payloadEtapa,
                    { headers: { token } }
                );
                console.log('Respuesta de agregar etapa:', responseEtapa.data);

                // 4. API Call 2: Actualizar Estado del Equipo (Condicional)
                if (habiaCambioEstado) {
                    this.ingreso.equipo.estado = this.nuevoestadoequipo; // Actualiza el estado local

                    // Mejora 4: Uso de await para la segunda llamada sin anidar promesas
                    const responseEquipo = await this.$axios.patch(
                        `${rutaBase}api/equipo/actualizarestado/${this.ingreso.equipo.id}`,
                        { nuevoEstado: this.nuevoestadoequipo },
                        { headers: { token } }
                    );
                    console.log('Respuesta de actualización de equipo:', responseEquipo.data);
                    this.nuevoestadoequipo = null; // Restablecer tras el éxito
                }

                // 5. Limpieza de Estado y UI (Tras Éxito)
                this.etapaautorizada = "";
                this.observaciones = "";
                this.ubicacionseleccionada = "";

                // Cierra el diálogo y consulta datos actualizados solo si todo fue exitoso
                this.consultarEquipoActualizado();
                this.$store.dispatch('fetchMovimientosPendientes');
                this.cerrarDialogoNuevaEtapa();

            } catch (error) {
                // 6. Manejo de Errores
                console.error("Error al guardar la nueva etapa o actualizar el equipo:", error);
                this.mostrarErrorGuardar(error.response?.data?.error);

            } finally {
                // 7. Limpieza Final (Garantizada)
                // Se ejecuta siempre, independientemente del éxito o el error
                this.esperarguardar = false; // Detiene el indicador de carga
            }
        },
        consultarEstado() {
            // Si la etapa no cambia (solo se actualiza la ubicación), el equipo
            // mantiene el estado ya asignado y no se vuelve a preguntar.
            const etapaActual = this.ingreso.etapas[this.ingreso.etapas.length - 1]?.nombre;
            const requiereNuevoEstado = ["Finalizado", "Cancelado", "Listo para despacho"].includes(this.nuevaEtapa.nombre);

            if (requiereNuevoEstado && this.nuevaEtapa.nombre !== etapaActual) {
                this.cambiarestado = true;
            }
            else {
                this.guardarNuevaEtapa();
            }
        },
        consultarEquipo() {
            this.ingreso = this.$store.state.ingreso.ingreso;
        },
        consultarEquipoActualizado() {


            this.$axios
                .get(this.$store.state.ruta + `api/ingreso/ingresoid/` + this.ingreso.id,
                    {
                        headers: {
                            token: this.$store.state.token,
                        },
                    }
                ) // La URL incluye el ID dinámico del ingreso
                .then((response) => {
                    // Manejar la respuesta exitosa
                    this.ingreso = response.data;

                })
                .catch((error) => {
                    // Manejar errores
                    console.error("Error al obtener el ingreso:", error.response ? error.response.data.error : error.message);
                    return error; // Retornar el error para manejarlo si es necesario
                });
            //localStorage.removeItem('equipo')
        },
        puedeConfirmarUbicacion(ubicacion) {
            const rol = this.$store.state.user.rol;
            const ub = (ubicacion || '').toLowerCase();
            if (ub.includes('bodega')) return ['bodega', 'administrador', 'ingresos'].includes(rol);
            if (['cuarentena', 'taller de ingenieria', 'taller de ingeniería', 'snibe'].some(t => ub.includes(t)))
                return ['administrador', 'soporte', 'lumira', 'aplicaciones'].includes(rol);
            return false;
        },
        mostrarErrorGuardar(mensaje) {
            this.esperarguardar = false;
            this.mensajeErrorGuardar = mensaje || 'No se pudo completar la acción. Por favor verifique su conexión e intente nuevamente.';
            this.errorGuardar = true;
        },
        async confirmarLlegada(etapa) {
            this.confirmando = etapa.id;
            try {
                await this.$axios.patch(
                    `${this.$store.state.ruta}api/ingreso/confirmar/${this.ingreso.id}/etapa/${etapa.id}`,
                    {},
                    { headers: { token: this.$store.state.token } }
                );
                this.consultarEquipoActualizado();
                this.$store.dispatch('fetchMovimientosPendientes');
            } catch (err) {
                console.error('Error al confirmar llegada:', err.response?.data || err.message);
                this.mostrarErrorGuardar(err.response?.data?.error);
            } finally {
                this.confirmando = null;
            }
        },
        asignarEtapasDisponibles() {
            this.etapasDisponibles = ETAPAS_DISPONIBLES_POR_ROL[this.$store.state.user.rol] || [];
        },
    },
    created() {
        this.$store.dispatch("autoLogin");
        if (this.$store.state.existe === 0) {
            this.$router.push({ name: "Login" });
        } else {
            this.consultarEquipo();
            this.asignarEtapasDisponibles();
        }

    },
}
</script>
<style></style>
