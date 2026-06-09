<template>
    <v-card class="pa-2">
        <v-data-table
            :headers="encabezado"
            :items="movimientos"
            :loading="cargando"
            loading-text="Cargando... por favor espere"
            class="elevation-1 mt-2"
        >
            <template v-slot:item.equipo="{ item }">
                {{ item.ingreso?.equipo?.nombre }} — {{ item.ingreso?.equipo?.serie }}
            </template>

            <template v-slot:item.cliente="{ item }">
                {{ item.ingreso?.equipo?.cliente?.nombre }}
            </template>

            <template v-slot:item.ubicacion="{ item }">
                {{ item.ubicacion }}
            </template>

            <template v-slot:item.responsable="{ item }">
                {{ item.responsable || '—' }}
            </template>

            <template v-slot:item.createdAt="{ item }">
                {{ formatearFecha(item.createdAt) }}
            </template>

            <template v-slot:item.acciones="{ item }">
                <v-btn
                    v-if="puedeConfirmarUbicacion(item.ubicacion)"
                    color="success"
                    variant="flat"
                    size="small"
                    prepend-icon="mdi-check-circle-outline"
                    :loading="confirmando === item.id"
                    @click="confirmar(item)"
                >
                    Confirmar
                </v-btn>
                <span v-else-if="!puedeConfirmarUbicacion(item.ubicacion)" class="text-caption text-grey">Sin permiso</span>
            </template>
        </v-data-table>

        <v-snackbar v-model="snackbar.visible" :color="snackbar.color" timeout="3000">
            {{ snackbar.texto }}
        </v-snackbar>
    </v-card>
</template>

<script>
import axios from 'axios';

export default {
    name: 'BandejaMovimientosComponent',
    data() {
        return {
            cargando: false,
            movimientos: [],
            confirmando: null,
            snackbar: { visible: false, texto: '', color: 'success' },
            encabezado: [
                { title: 'Equipo — Serie', key: 'equipo', sortable: false, align: 'start' },
                { title: 'Cliente', key: 'cliente', sortable: false, align: 'center' },
                { title: 'Ubicación destino', key: 'ubicacion', align: 'center' },
                { title: 'Registrado por', key: 'responsable', align: 'center' },
                { title: 'Fecha', key: 'createdAt', align: 'center' },
                { title: 'Acción', key: 'acciones', sortable: false, align: 'center' },
            ],
        };
    },
    computed: {},

    methods: {
        puedeConfirmarUbicacion(ubicacion) {
            const rol = this.$store.state.user.rol;
            const ub = (ubicacion || '').toLowerCase();
            if (ub.includes('bodega')) return ['bodega', 'administrador', 'ingresos'].includes(rol);
            if (['cuarentena', 'taller de ingenieria', 'taller de ingeniería', 'snibe'].some(t => ub.includes(t)))
                return ['administrador', 'soporte', 'lumira', 'aplicaciones'].includes(rol);
            return false;
        },
        async cargar() {
            this.cargando = true;
            try {
                const { data } = await axios.get(
                    `${this.$store.state.ruta}api/ingreso/movimientos/pendientes`,
                    { headers: { token: this.$store.state.token } }
                );
                this.movimientos = data;
            } catch (err) {
                console.error(err);
            } finally {
                this.cargando = false;
            }
        },
        async confirmar(etapa) {
            this.confirmando = etapa.id;
            try {
                await axios.patch(
                    `${this.$store.state.ruta}api/ingreso/confirmar/${etapa.ingreso.id}/etapa/${etapa.id}`,
                    {},
                    { headers: { token: this.$store.state.token } }
                );
                this.snackbar = { visible: true, texto: 'Ubicación confirmada correctamente', color: 'success' };
                this.$store.dispatch('fetchMovimientosPendientes');
                await this.cargar();
            } catch (err) {
                this.snackbar = { visible: true, texto: 'Error al confirmar el movimiento', color: 'error' };
            } finally {
                this.confirmando = null;
            }
        },
        formatearFecha(f) {
            if (!f) return '—';
            return new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
        },
    },
    created() {
        this.$store.dispatch('guardarUbicacion', {
            ubicacion: 'Pendientes',
            icono: 'mdi-map-marker-multiple-outline',
            color: 'c6',
        });
        this.cargar();
    },
};
</script>
