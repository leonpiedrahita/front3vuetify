<template>
    <v-card class="pa-2">
        <!-- Filtros -->
        <div class="pa-3">
            <v-row align="center">
                <v-col cols="12" sm="3">
                    <v-select
                        v-model="filtroUbicacion"
                        :items="ubicacionesDisponibles"
                        label="Filtrar por ubicación"
                        clearable
                        variant="outlined"
                        density="compact"
                        hide-details
                    />
                </v-col>
                <v-col cols="12" sm="3">
                    <v-select
                        v-model="filtroConfirmado"
                        :items="opcionesConfirmado"
                        item-title="label"
                        item-value="value"
                        label="Estado de confirmación"
                        clearable
                        variant="outlined"
                        density="compact"
                        hide-details
                    />
                </v-col>
                <v-col cols="12" sm="4">
                    <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        label="Buscar equipo / serie / cliente"
                        single-line
                        hide-details
                    />
                </v-col>
                <v-col cols="12" sm="2" class="d-flex justify-end">
                    <v-btn color="primary" size="large" @click="exportarExcel">
                        Exportar a Excel
                    </v-btn>
                </v-col>
            </v-row>
        </div>

        <v-data-table
            :headers="encabezado"
            :items="itemsFiltrados"
            :loading="cargando"
            loading-text="Cargando... por favor espere"
            class="elevation-1"
        >
            <template v-slot:item.equipo="{ item }">
                {{ item.equipo.nombre }}
            </template>

            <template v-slot:item.serie="{ item }">
                {{ item.equipo.serie }}
            </template>

            <template v-slot:item.cliente="{ item }">
                {{ item.equipo.cliente.nombre }}
            </template>

            <template v-slot:item.ubicacion="{ item }">
                <span>{{ item.ubicacionFlat }}</span>
                <v-tooltip
                    v-if="item.etapas?.some(e => e.confirmado === false && e.nombre !== 'Despachado')"
                    location="top"
                    text="Pendiente de confirmación de ubicación"
                >
                    <template v-slot:activator="{ props }">
                        <v-icon v-bind="props" color="#D97706" size="small" class="ml-1">mdi-alert-box-outline</v-icon>
                    </template>
                </v-tooltip>
            </template>

            <template v-slot:item.confirmado="{ item }">
                <v-chip
                    :color="item.etapas?.some(e => e.confirmado === false) ? 'warning' : 'success'"
                    size="small"
                    variant="tonal"
                    label
                >
                    {{ item.etapas?.some(e => e.confirmado === false) ? 'Pendiente' : 'Confirmado' }}
                </v-chip>
            </template>

            <template v-slot:item.confirmadoPor="{ item }">
                {{ item.etapas?.at(-1)?.confirmadoPor || '—' }}
            </template>

            <template v-slot:item.etapa="{ item }">
                {{ item.etapaActualFlat }}
            </template>
        </v-data-table>
    </v-card>
</template>

<script>
import axios from 'axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default {
    name: 'ListadoUbicacionesComponent',
    data() {
        return {
            cargando: false,
            ordenes: [],
            search: '',
            filtroUbicacion: null,
            filtroConfirmado: null,
            opcionesConfirmado: [
                { label: 'Confirmado', value: true },
                { label: 'Pendiente', value: false },
            ],
            encabezado: [
                { title: 'Equipo', key: 'equipo', sortable: true, align: 'center' },
                { title: 'Serie', key: 'serie', sortable: true, align: 'center' },
                { title: 'Cliente', key: 'cliente', sortable: true, align: 'center' },
                { title: 'Ubicación', key: 'ubicacion', sortable: true, align: 'center' },
                { title: 'Confirmación', key: 'confirmado', sortable: false, align: 'center' },
                { title: 'Confirmado por', key: 'confirmadoPor', sortable: false, align: 'center' },
                { title: 'Etapa actual', key: 'etapa', sortable: true, align: 'center' },
            ],
        };
    },
    computed: {
        ubicacionesDisponibles() {
            const ubs = [...new Set(this.ordenes.map(o => o.ubicacionFlat).filter(u => u && u !== 'N/A'))];
            return ubs.sort();
        },
        itemsFiltrados() {
            const q = this.search?.toLowerCase().trim() || '';
            return this.ordenes.filter(o => {
                const porUbicacion = !this.filtroUbicacion || o.ubicacionFlat === this.filtroUbicacion;
                const confirmadoActual = !o.etapas?.some(e => e.confirmado === false);
                const porConfirmado = this.filtroConfirmado === null || this.filtroConfirmado === undefined
                    ? true
                    : confirmadoActual === this.filtroConfirmado;
                const porBusqueda = !q || [
                    o.equipo?.nombre,
                    o.equipo?.serie,
                    o.equipo?.cliente?.nombre,
                ].some(v => v?.toLowerCase().includes(q));
                return porUbicacion && porConfirmado && porBusqueda;
            });
        },
    },
    methods: {
        async cargar() {
            this.cargando = true;
            try {
                const { data } = await axios.get(
                    `${this.$store.state.ruta}api/ingreso/ingresosabiertos`,
                    { headers: { token: this.$store.state.token } }
                );
                this.ordenes = data.map(o => {
                    const ultima = o.etapas?.at(-1) ?? null;
                    return {
                        ...o,
                        ubicacionFlat: ultima?.ubicacion || 'N/A',
                        etapaActualFlat: ultima?.nombre || 'N/A',
                    };
                });
            } catch (err) {
                console.error(err);
            } finally {
                this.cargando = false;
            }
        },
        async exportarExcel() {
            const datos = this.itemsFiltrados.map(o => ({
                Equipo: o.equipo.nombre,
                Serie: o.equipo.serie,
                Cliente: o.equipo.cliente.nombre,
                Ubicacion: o.ubicacionFlat,
                Confirmacion: o.etapas?.some(e => e.confirmado === false) ? 'Pendiente' : 'Confirmado',
                ConfirmadoPor: o.etapas?.at(-1)?.confirmadoPor || '',
                EtapaActual: o.etapaActualFlat,
            }));
            const wb = new ExcelJS.Workbook();
            const ws = wb.addWorksheet('Ubicaciones');
            if (datos.length) ws.columns = Object.keys(datos[0]).map(k => ({ header: k, key: k, width: 22 }));
            ws.addRows(datos);
            const buf = await wb.xlsx.writeBuffer();
            const now = new Date();
            const fecha = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
            saveAs(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `ubicaciones_${fecha}.xlsx`);
        },
    },
    created() {
        this.$store.dispatch('guardarUbicacion', {
            ubicacion: 'Listado de ubicaciones',
            icono: 'mdi-map-marker-multiple-outline',
            color: 'c6',
        });
        this.cargar();
    },
};
</script>
