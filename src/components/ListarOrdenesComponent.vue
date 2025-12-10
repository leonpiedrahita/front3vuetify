<template>
    <v-card class="pa-2 ">
        <v-data-table :headers="encabezado" :items="ordenes" :search="search" class="elevation-1" :loading="cargando"
            loading-text="Cargando ... por favor espere">
            <template v-slot:top>

                <v-toolbar flat>

                    <v-row align="center">
                        <v-col cols="12" sm="6" md="6" lg="6">
                            <v-text-field v-model="search" append-icon="mdi-magnify"
                                label="Buscar: Equipo/Serie/Cliente/Estado" single-line hide-details></v-text-field>
                        </v-col>

                        <v-spacer></v-spacer>

                        <v-col cols="12" sm="6" md="6" lg="6" class="d-flex justify-space-around">

                            <v-btn size="large" color="primary" variant="flat" @click="listarAbiertos()">
                                Listar Abiertos
                            </v-btn>
                            <v-btn size="large" color="primary" variant="flat" @click="listarTodos()">
                                Listar Todos
                            </v-btn>
                            <v-btn size="large" color="primary" variant="flat" @click="exportarAExcel()">
                                Exportar a Excel
                            </v-btn>
                        </v-col>


                    </v-row>
                </v-toolbar>
            </template>
            <template v-slot:item.createdAt="{ item }">
                {{ formatearFecha(item.createdAt) }}
            </template>

            <template v-slot:item.updatedAt="{ item }">
                {{ formatearFecha(item.updatedAt) }}
            </template>
            <template v-slot:item.ubicacion="{ item }">
                <span v-if="item.etapas && item.etapas.length > 0">
                    {{ item.etapas.at(-1)?.ubicacion ?? item.etapas[item.etapas.length - 1].ubicacion }}
                </span>
                <span v-else>
                    N/A
                </span>
            </template>
            <template v-slot:item.nombreEtapaActual="{ item }">
                <span v-if="item.etapas && item.etapas.length > 0">
                    {{ item.etapas.at(-1)?.nombre ?? item.etapas[item.etapas.length - 1].nombre }}
                </span>
                <span v-else>
                    N/A
                </span>
            </template>

            <template v-slot:[`item.crear`]="{ item }">
                <v-icon medium @click="abrirOrden(item)">
                    mdi-vector-polyline-edit
                </v-icon>
            </template>
        </v-data-table>

    </v-card>
    <!-- <pre>{{ ordenes }}</pre> -->
</template>

<script>
import axios from "axios";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
export default {
    name: "ListarOrdenesComponent",
    components: {},
    data: () => ({
        cargando: true,
        ordenes: [],
        search: "",
        ordenseleccionada: {},
        encabezado: [
            {
                title: "Equipo",
                key: "equipo.nombre",
                align: "center",
            },
            { title: "Serie", key: "equipo.serie", align: "center" },
            {
                title: "Cliente",
                align: "center",
                key: "equipo.cliente.nombre",
            },
            {
                title: "Ciudad",
                align: "center",
                key: "equipo.ubicacionNombre",
            },
            {
                title: "Estado",
                align: "center",
                key: "estado",

            },
            {
                title: "Ubicación",
                value: "ubicacion",
                align: "center",
            },
            {
                title: "Ingreso",
                align: "center",
                key: "createdAt",

            },
            {
                title: "Última actualización",
                align: "center",
                key: "updatedAt",

            },

            {
                title: "Etapa Actual",
                value: "nombreEtapaActual",
                align: "center",
                sortable: false,

            },

            {
                title: "Ver / Editar",
                key: "crear",
                sortable: false,
                align: "center",
            },
        ],
    }),

    methods: {
        // --- NUEVA FUNCIÓN para formatear la fecha ---
        formatearFecha(fechaString) {
            if (!fechaString) return 'N/A';

            // Crea un objeto Date a partir de la cadena ISO (ej: "2025-08-05T02:22:54.500Z")
            const date = new Date(fechaString);

            // Retorna la fecha en formato día/mes/año
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        },
        // ---------------------------------------------
        listarTodos() {
            //va a ir a mi backend y me traerá las peticiones de la base de datos
            axios
                .get(this.$store.state.ruta + "api/ingreso/ingresos",
                    {
                        headers: {
                            token: this.$store.state.token,
                        },
                    }
                )
                .then((response) => {
                    this.ordenes = response.data; //el this es porque no es propia de la funcion sino de l componente
                    this.cargando = false
                })
                .catch((error) => {
                    //console.log(error);
                    return error;
                });
        },
        listarAbiertos() {
            axios
                .get(this.$store.state.ruta + "api/ingreso/ingresosabiertos",
                    {
                        headers: {
                            token: this.$store.state.token,
                        },
                    }
                )
                .then((response) => {
                    this.ordenes = response.data; //el this es porque no es propia de la funcion sino de l componente
                    this.cargando = false
                })
                .catch((error) => {
                    //console.log(error);
                    return error;
                });
        },
        abrirOrden(item) {
            this.ordenseleccionada = Object.assign({}, item);
            this.$store.dispatch("guardarOrdenesEquipo", {
                ingreso: this.ordenseleccionada,
            });
            this.$router.push({ name: "SeguimientoIngresos" })
        },
        exportarAExcel() {
            const exportData = this.ordenes.map(item => ({
                Equipo: item.equipo.nombre,
                Serie: item.equipo.serie,
                Cliente: item.equipo.cliente.nombre,
                Ciudad: item.equipo.ubicacionNombre,
                Estado: item.estado,
                ubicacion: item.etapas && item.etapas.length > 0
                    ? (item.etapas.at(-1)?.ubicacion ?? item.etapas[item.etapas.length - 1].ubicacion)
                    : 'N/A',
                FechaIngreso: this.formatearFecha(item.createdAt),
                UltimaActualizacion: this.formatearFecha(item.updatedAt),
                EtapaActual: item.etapas && item.etapas.length > 0
                    ? (item.etapas.at(-1)?.nombre ?? item.etapas[item.etapas.length - 1].nombre)
                    : 'N/A',


            }));
            // Crear hoja y libro
            const ws = XLSX.utils.json_to_sheet(exportData, { origin: 'A1' });
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Ingresos');

            // Escribir y guardar
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

            // 4. GENERAR NOMBRE DE ARCHIVO CON FECHA 📅
            const now = new Date();

            // Formato YYYY-MM-DD (Ejemplo: 2025-11-09)
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0'); // Mese 0-index, por eso + 1
            const day = String(now.getDate()).padStart(2, '0');

            const fechaActual = `${day}-${month}-${year}`;

            // Concatenar el nombre y la fecha
            const nombreArchivo = `Ingresos-${fechaActual}.xlsx`;

            // 5. Guardar el archivo
            saveAs(blob, nombreArchivo);
        },
    },
    beforeCreate() {
        this.$store.dispatch("autoLogin");
        if (this.$store.state.existe === 0) {
            this.$router.push({ name: "Login" });
        }
        this.$store.dispatch("guardarUbicacion", {
            ubicacion: "Lista de ingresos",
            icono: "mdi-vector-circle",
            color: "c6",
        });
    },
    created() {
        this.listarAbiertos();
    },
};
</script>

<style></style>