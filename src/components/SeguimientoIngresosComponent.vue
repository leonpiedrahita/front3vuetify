<template>
    <v-card class="pb-4">
        <v-toolbar flat style="background-color: #52B69A; color: white;">

            <!-- Botón cerrar flotando a la derecha -->



            <!-- Título centrado en negrilla -->
            <v-toolbar-title class="text-center font-weight-bold">
                Equipo: {{ ingreso.equipo.nombre }} &nbsp; | &nbsp;
                Serie: {{ ingreso.equipo.serie }}&nbsp; | &nbsp;
                Cliente: {{ ingreso.equipo.cliente.nombre }}
            </v-toolbar-title>

            <!-- Botón cerrar a la derecha -->
        </v-toolbar>
        <div class="d-flex justify-center align-center mb-2 mt-2"
            v-if="ingreso.estado === 'Abierta' && this.$store.state.user.rol !== 'comercial' && this.$store.state.user.rol !== 'calidad'">

            <v-btn color="c6" prepend-icon="mdi-plus" @click="abrirDialogoNuevaEtapa">
                Actualizar estado
            </v-btn>
        </div>
        <v-timeline align="start" density="confortable" truncate-line="both">
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
                        <div><strong class="me-4">{{ etapa.fecha || 'Sin fecha' }}</strong></div>
                        <div><strong>{{ etapa.nombre }}</strong></div>
                    </div>
                </template>
                <div>
                    <div class="text-caption">
                        Comentario: {{ etapa.comentario || 'Sin comentario' }}
                    </div>
                    <div class="text-caption">
                        Ubicación: {{ etapa.ubicacion || 'Sin ubicación' }}
                    </div>
                    <div class="text-caption">
                        Responsable: {{ etapa.responsable || 'No asignado' }}
                    </div>
                </div>
            </v-timeline-item>
        </v-timeline>
    </v-card>
    <v-dialog v-model="dialogoNuevaEtapa" transition="dialog-bottom-transition" persistent max-width="800">
        <v-toolbar flat style="background-color: #52B69A; color: white;">
            <v-toolbar-title class="text-center font-weight-bold">
                Añadir nuevo estado
            </v-toolbar-title>
            <v-spacer></v-spacer>

        </v-toolbar>

        <v-card>
            <v-card-text>
                <v-form ref="formNuevaEtapa" @submit.prevent="guardarNuevaEtapa">
                    <v-container>
                        <v-row>
                            <v-col cols="12">
                                <h2 class="text-h6 text-primary text-center">Etapa actual</h2>
                                <p class="text-center text-body-3 text-black font-weight-bold">
                                    {{ ingreso.etapas[ingreso.etapas.length - 1].nombre }}
                                </p>
                            </v-col>


                            <v-col cols="12">
                                <v-textarea v-model="nuevaEtapa.comentario" label="Comentario/Observaciones"
                                    :rules="[v => !!v || 'El comentario es obligatorio']" required
                                    variant="outlined"></v-textarea>
                            </v-col>
                            <v-col cols="12">
                                <h2 class="text-h6 text-primary text-center">Nueva Etapa</h2>
                                <v-divider class="mt-1 mb-4"></v-divider>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-select v-model="nuevaEtapa.nombre" label="Nombre de la Etapa *" :items=listadeEtapas
                                    :rules="[v => !!v || 'El nombre es obligatorio']" required
                                    variant="outlined"></v-select>
                            </v-col>

                            <v-col cols="12" md="6">
                                <v-select v-model="nuevaEtapa.ubicacion" label="Ubicación *"
                                    :items="['Cuarentena', 'Bodega de equipos usados', 'Taller de ingeniería', 'Cliente', 'Dado de baja']"
                                    :rules="[v => !!v || 'La ubicación es obligatoria']" required
                                    variant="outlined"></v-select>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-form>
            </v-card-text>

            <v-card-actions class="pa-4 bg-grey-lighten-4">
                <v-spacer></v-spacer>
                <v-btn color="red" @click="cerrarDialogoNuevaEtapa">Cancelar</v-btn>
                <v-btn color="success" @click="guardarNuevaEtapa">Guardar Estado</v-btn>
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
    <pre>{{ ingreso.etapas[ingreso.etapas.length - 1].nombre }}</pre>
    <pre>{{ ingreso }}</pre>
</template>

<script>
import { ref } from 'vue'; // ref se usa para simular la reactividad inicial, pero lo moveremos a data()
import axios from "axios";
export default {
    data() {
        // --- Datos Fijos de Ejemplo (Simulación de API) ---
        const ingreso = null;
        const esperarguardar = false;
        const listadeEtapas = [];
        const modeloEtapaInicial = {
            nombre: '',
            comentario: '',
            responsable: '',
            fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            ubicacion: null,
        };

        return {
            ingreso,
            dialogoNuevaEtapa: false, // Reemplaza ref(false)
            modeloEtapaInicial,
            nuevaEtapa: { ...modeloEtapaInicial }, // Reemplaza ref({ ... })
            // formNuevaEtapa necesita una ref en la plantilla, se accede vía this.$refs
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

        async guardarNuevaEtapa() {
            // Accede a la referencia del formulario y llama a validate()
            const { valid } = await this.$refs.formNuevaEtapa.validate();

            if (valid) {
                this.$store.dispatch("autoLogin");
                if (this.$store.state.existe === 0) {
                    this.$router.push({ name: "Login" });
                } else {
                    this.esperarguardar = true;
                    var today = new Date();
                    var date =
                        "(" +
                        today.getDate() +
                        "-" +
                        (today.getMonth() + 1) +
                        "-" +
                        today.getFullYear() +
                        ")";
                    this.ingreso.etapaActual++;
                    this.ingreso.ultimaEtapa++;
                    axios
                        .post(
                            this.$store.state.ruta + "api/ingreso/agregaretapa/" + this.ingreso.id,
                            {
                                nombre: this.nuevaEtapa.nombre,
                                comentario: this.nuevaEtapa.comentario,
                                responsable: this.$store.state.user.nombre,
                                fecha: date,
                                etapaActual: this.ingreso.etapaActual,
                                ultimaEtapa: this.ingreso.ultimaEtapa,
                                ubicacion: this.nuevaEtapa.ubicacion,
                                estado: "Abierta"
                            },
                            {
                                headers: {
                                    token: this.$store.state.token,
                                },
                            }
                        )
                        .then((response) => {
                            console.log(response);
                            this.esperarguardar = false;
                            this.finalizar = true;
                            this.etapaautorizada = "";
                            this.observaciones = "";
                            this.ubicacionseleccionada = "";
                            this.consultarEquipoActualizado();
                        })
                        .catch((error) => {
                            console.log(error);
                            return error;
                        });
                }
                this.cerrarDialogoNuevaEtapa();
                this.esperarguardar = false;
            } else {
                alert('Por favor, complete todos los campos obligatorios.');
            }
        },
        consultarEquipo() {
            this.ingreso = this.$store.state.ingreso.ingreso;
        },
        consultarEquipoActualizado() {


            axios
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
        asignarLista() {
            if (this.$store.state.user.rol === "administrador") {
                this.listadeEtapas = [
                    "Cuarentena",
                    "Soporte ingeniería",
                    "Soporte aplicaciones",
                    "Listo para despacho",
                    "Cotización solicitada",
                    "Pdte. de repuestos",
                    "Pdte. de aprobación de repuestos",
                    "Despachado",

                ];
            } else if (this.$store.state.user.rol === "soporte") {
                this.listadeEtapas = [
                    "Soporte ingeniería",
                    "Soporte aplicaciones",
                    "Cotización solicitada",
                    "Pdte. de repuestos",
                    "Pdte. de aprobación de repuestos",
                    "Listo para despacho",
                ];
            }
            else if (this.$store.state.user.rol === "bodega") {
                this.listadeEtapas = [
                    "Cuarentena",
                    "Despachado",
                    "Soporte ingeniería",
                    "Soporte aplicaciones",
                ];

            }
            else if (this.$store.state.user.rol === "cotizaciones") {
                this.listadeEtapas = [];

            } else if (this.$store.state.user.rol === "comercial") {
                this.listadeEtapas = [];
            } else if (this.$store.state.user.rol === "calidad") {
                this.listadeEtapas = [];
            }
        },
    },
    created() {
        this.$store.dispatch("autoLogin");
        if (this.$store.state.existe === 0) {
            this.$router.push({ name: "Login" });
        } else {
            this.consultarEquipo();
            this.asignarLista();
            this.$store.dispatch("guardarUbicacion", {
                ubicacion: "Estados del ingreso",
                icono: "mdi-vector-polyline",
                color: "c6",
            });
        }

    },
}
</script>
<style></style>