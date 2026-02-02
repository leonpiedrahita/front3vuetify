<template>
    <v-card class="pa-2 ">
        <v-card-title class="text-center" id="tamanotitulo">Informacion del equipo</v-card-title>
        <v-row justify="center"><v-spacer></v-spacer>
            <v-card-title>
                <v-card title="Equipo" variant="flat">
                    <v-card-text>
                        <v-toolbar-title >
                            {{ equipo.nombre }}
                        </v-toolbar-title>
                    </v-card-text>
                </v-card>
            </v-card-title><v-spacer></v-spacer>
            <v-card-title>
                <v-card title="Serie" variant="flat">
                    <v-card-text>
                        <v-toolbar-title>
                            {{ equipo.serie }}
                        </v-toolbar-title>
                    </v-card-text>
                </v-card>
            </v-card-title><v-spacer></v-spacer>
            <v-card-title>
                <v-card title="Cliente" variant="flat">
                    <v-card-text>
                        <v-toolbar-title>
                            {{ equipo.cliente.nombre }}
                        </v-toolbar-title>
                    </v-card-text>
                </v-card>
            </v-card-title>



            <v-spacer></v-spacer></v-row>

        <v-row>
            <v-col cols="12" lg="6" xs="12" v-if="ordenes.estado !== 'Finalizado'">
                <v-container class="pa-0">

                    <v-stepper-vertical color="green">

                        <v-stepper-vertical-item v-for="(step, n) in ordenes.etapas" :key="n" :hide-actions="true"
                            :complete="stepComplete(0, n + 1)" :step="n + 1" :color="stepStatus(0, n + 1)"
                            class="pa-5 ">
                            <template v-slot:title>
                                <div class="text-h5">Estado: {{ step.nombre }} - {{ step.fecha }}</div>
                            </template>

                            <template v-slot:subtitle>
                                <div class="text-h6" v-if="step.ubicacion">Ubicación: {{ step.ubicacion }}</div>
                                <div class="text-h6" v-if="step.responsable">Responsable: {{ step.responsable }}</div>
                                <div class="text-h6" v-if="step.comentario">Comentarios: {{ step.comentario }}</div>
                            </template>
                        </v-stepper-vertical-item>

                    </v-stepper-vertical>
                </v-container>
            </v-col>
            <v-col cols="12" lg="12" xs="12" v-if="ordenes.estado === 'Finalizado'">
                <v-container class="pa-0">
                    <v-stepper color="green">
                        <v-stepper-item v-for="(step, n) in ordenes.etapas" :key="n" :complete="stepComplete(0, n + 1)"
                            :step="n + 1" :color="stepStatus(0, n + 1)" class="pa-5">
                            <div class="font-weight-medium">
                                Estado: {{ step.nombre }} {{ step.fecha }}
                            </div>
                            <div class="font-weight-regular" v-if="step.ubicacion">
                                Ubicacion: {{ step.ubicacion }}
                            </div>
                            <div class="font-weight-regular" v-if="step.responsable">
                                Responsable: {{ step.responsable }}
                            </div>
                            <div class="font-weight-regular"  v-if="step.comentario">
                                Comentarios: {{ step.comentario }}
                            </div>

                        </v-stepper-item>
                    </v-stepper>
                </v-container>
            </v-col>
            <v-col cols="12" lg="6" xs="12" v-if="ordenes.estado !== 'Finalizado'">
                <v-card class="pa-5"><v-select v-model="etapaautorizada" :items="listadeetapas" label="Siguiente paso"
                        required :rules="[(v) => !!v || 'Campo requerido para confirmar etapa']"></v-select>
                    <v-select v-model="ubicacionseleccionada" :items="listadeubicaciones" label="Ubicación" required
                        :rules="[(v) => !!v || 'Campo requerido para confirmar etapa']"></v-select>
                    <v-textarea v-model="observaciones"
                        :rules="[(v) => !!v || 'Campo requerido para confirmar etapa, bloquear o desbloquear orden']"
                        placeholder="Información importante como: Estado del equipo, repuestos pendientes, repuestos devueltos, compañía y número de guía con la que se recibe o entrega, nombre de quién recibe o entrega. Motivo de bloqueo o desbloqueo"></v-textarea>
                    <v-card-actions><v-btn class="primary" color="c6" text @click="confirmarEtapa()"
                            :disabled="!(this.observaciones && this.etapaautorizada && this.ubicacionseleccionada)">Confirmar
                            Etapa</v-btn>
                        <!-- <v-btn v-if="bloqueodesbloqueo && ordenes.estado === 'Abierta'" class="error" text
                            @click="bloquear()" :disabled="!this.observaciones">Bloquear orden</v-btn>
                        <v-btn v-if="bloqueodesbloqueo && ordenes.estado === 'Bloqueado'" class="warning" text
                            @click="desbloquear()" :disabled="!this.observaciones">Desbloquear orden</v-btn> -->
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
        <v-dialog v-model="esperarguardar" persistent width="500">
            <v-card color="c6" dark>
                <v-card-text>
                    Por favor espere...
                    <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-dialog v-model="finalizar" max-width="500px" persistent>
            <v-col cols="12">
                <v-card class="pa-5">
                    <v-card-title>
                        <span class="headline">¿Desea finalizar la orden se servicio?</span>
                    </v-card-title>
                    <v-card-actions><v-btn class="primary" text @click="finalizaretapas()">Finalizar</v-btn>
                        <v-btn class="primary" text @click="cancelarFinalizar()">Cancelar</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-dialog>
    </v-card>
</template>

<script>
import axios from "axios";
export default {
    name: "PasosComponent",
    components: {},
    data: () => ({
        etapaautorizada: "",
        ubicacionseleccionada: "",
        observaciones: "",
        listadeetapas: [],
        listadeubicaciones: [
            "Cuarentena",
            "Taller de ingeniería",
            "Bodega de equipos usados",
            "Bodega de despachos",
            "Cliente"
        ],
        equipo: {},
        idorden: "",
        bloqueodesbloqueo: false,
        esperarguardar: false,
        finalizar: false,

        ordenes: [
            {
                etapaActual: 1, // Paso actual
                ultimaEtapa: 1, //Cantidad máxima de pasos
                etapas: [],
                equipo: {},
                estado: "",
                ubicacion: "",
            },
        ],
    }),

    methods: {
        stepComplete(step) {
            return this.ordenes.etapaActual > step;
        },
        stepStatus(step) {
            return this.ordenes.etapaActual > step ? "green" : "blue";
        },

        finalizaretapas() {
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

                this.ordenes.etapas.push({
                    nombre: "Finalizado",
                    comentario: "Seguimiento finalizado",
                    responsable: this.$store.state.user.nombre,
                    fecha: date,
                    ubicacion: "Ubicación final",
                });
                this.ordenes.etapaActual++;
                this.ordenes.ultimaEtapa++;
                this.ordenes.estado = "Finalizado";

                axios
                    .post(
                        this.$store.state.ruta + "api/ingreso/agregaretapa/" + this.idorden,
                        {
                            nombre: "Finalizado",
                            responsable: this.$store.state.user.nombre,
                            fecha: date,
                            estado: "Finalizado",
                            etapaActual: this.ordenes.etapaActual,
                            ultimaEtapa: this.ordenes.ultimaEtapa,
                            comentario: "Seguimiento finalizado",
                            ubicacion: "Ubicación final",

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
                        this.finalizar = false;
                        this.etapaautorizada = "";
                        this.observaciones = "";
                    })
                    .catch((error) => {
                        console.log(error);
                        return error;
                    });
            }
        },
        cancelarFinalizar() {
            this.finalizar = false;
        },
        confirmarEtapa() {
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

                this.ordenes.etapas.push({
                    nombre: this.etapaautorizada,
                    comentario: this.observaciones,
                    responsable: this.$store.state.user.nombre,
                    fecha: date,
                    ubicacion: this.ubicacionseleccionada
                });
                this.ordenes.etapaActual++;
                this.ordenes.ultimaEtapa++;

                axios
                    .post(
                        this.$store.state.ruta + "api/ingreso/agregaretapa/" + this.idorden,
                        {
                            nombre: this.etapaautorizada,
                            comentario: this.observaciones,
                            responsable: this.$store.state.user.nombre,
                            fecha: date,
                            etapaActual: this.ordenes.etapaActual,
                            ultimaEtapa: this.ordenes.ultimaEtapa,
                            ubicacion: this.ubicacionseleccionada,
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
        },
        desbloquear() {
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

                this.ordenes.etapas.push({
                    nombre: "Desbloqueado",
                    comentario: this.observaciones,
                    responsable: this.$store.state.user.nombre,
                    fecha: date,
                });
                this.ordenes.etapaActual++;
                this.ordenes.ultimaEtapa++;
                this.ordenes.estado = "Abierta";

                axios
                    .patch(
                        this.$store.state.ruta + "api/ingreso/agregaretapa/" + this.idorden,
                        {
                            nombre: "Desbloqueado",
                            comentario: this.observaciones,
                            responsable: this.$store.state.user.nombre,
                            fecha: date,
                            estado: "Abierta",
                            etapaActual: this.ordenes.etapaActual,
                            ultimaEtapa: this.ordenes.ultimaEtapa,
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
                        this.etapaautorizada = "";
                        this.observaciones = "";
                    })
                    .catch((error) => {
                        console.log(error);
                        return error;
                    });
            }
        },
        bloquear() {
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

                this.ordenes.etapas.push({
                    nombre: "Bloqueado",
                    comentario: this.observaciones,
                    responsable: this.$store.state.user.nombre,
                    fecha: date,
                });
                this.ordenes.etapaActual++;
                this.ordenes.ultimaEtapa++;
                this.ordenes.estado = "Bloqueado";

                axios
                    .patch(
                        this.$store.state.ruta + "api/ingreso/agregaretapa/" + this.idorden,
                        {
                            nombre: "Bloqueado",
                            comentario: this.observaciones,
                            responsable: this.$store.state.user.nombre,
                            fecha: date,
                            estado: "Bloqueado",
                            etapaActual: this.ordenes.etapaActual,
                            ultimaEtapa: this.ordenes.ultimaEtapa,
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
                        this.etapaautorizada = "";
                        this.observaciones = "";
                    })
                    .catch((error) => {
                        console.log(error);
                        return error;
                    });
            }
        },
        consultarEquipo() {

            this.equipo = this.$store.state.equipo;
            this.ordenes = this.$store.state.ordenes;
            this.idorden = this.$store.state.idorden;


        },
        consultarEquipoActualizado() {


            axios
                .get(this.$store.state.ruta + `api/ingreso/ingresoid/` + this.idorden,
                    {
                        headers: {
                            token: this.$store.state.token,
                        },
                    }
                ) // La URL incluye el ID dinámico del ingreso
                .then((response) => {
                    // Manejar la respuesta exitosa
                    this.ordenes = response.data; // Guardar los datos del ingreso en una variable del componente
                    this.equipo = response.data.equipo;
                    this.idorden = response.data.id;

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
                this.listadeetapas = [
                    "Cuarentena",
                    "Soporte ingeniería",
                    "Soporte aplicaciones",
                    "Listo para despacho",
                    "Disponible",
                    "Disponible - Pdte. M. Preventivo",
                    "Pdte. de repuestos",
                    "Despachado",
                    "Dado de baja",

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
        bloqueoDesbloqueo() {
            if (this.$store.state.user.rol == ("administrador" || "cartera" || "asesor")) {
                this.bloqueodesbloqueo = true;
            }
        },
    },
    beforeCreate() { },
    created() {
        this.$store.dispatch("autoLogin");
        if (this.$store.state.existe === 0) {
            this.$router.push({ name: "Login" });
        } else {
            this.asignarLista();
            this.consultarEquipo();
            this.consultarEquipoActualizado();
            this.bloqueoDesbloqueo();
            this.$store.dispatch("guardarUbicacion", {
                ubicacion: "Etapas de servicio",
                icono: "mdi-vector-polyline",
                color: "c6",
            });
        }

    },
};
</script>

<style>
p {
    white-space: pre;
}
</style>