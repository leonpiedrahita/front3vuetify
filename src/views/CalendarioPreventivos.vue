<template>
  <v-card class="pa-2">
    <v-toolbar flat style="background-color: #52B69A; color: white;" class="mb-4">
      <v-icon class="ml-2 mr-3">mdi-calendar-clock</v-icon>
      <v-toolbar-title class="font-weight-bold">Calendario de Mantenimientos Preventivos</v-toolbar-title>
    </v-toolbar>

    <v-progress-linear v-if="cargando" indeterminate color="teal" class="mb-2" />

    <!-- Leyenda -->
    <div class="d-flex ga-4 mb-4 px-2 flex-wrap justify-center">
      <v-chip color="#4CAF50" variant="outlined" size="small" class="font-weight-bold">
        <v-icon start size="small">mdi-check-circle</v-icon>
        Más de 30 días
      </v-chip>
      <v-chip color="#FF7043" variant="outlined" size="small" class="font-weight-bold">
        <v-icon start size="small">mdi-alert-circle</v-icon>
        Menos de 30 días
      </v-chip>
      <v-chip color="#F44336" variant="outlined" size="small" class="font-weight-bold">
        <v-icon start size="small">mdi-close-circle</v-icon>
        Vencido
      </v-chip>
    </div>

    <!-- Tabs: Calendario / Lista -->
    <v-tabs v-model="tab" color="teal" class="mb-4">
      <v-tab value="calendario">
        <v-icon start>mdi-calendar-month</v-icon>
        Calendario
      </v-tab>
      <v-tab value="lista">
        <v-icon start>mdi-format-list-bulleted</v-icon>
        Lista
      </v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab">
      <!-- Vista Calendario -->
      <v-tabs-window-item value="calendario">
        <div class="calendar-wrapper pa-2">
          <FullCalendar :options="calendarOptions" />
        </div>
      </v-tabs-window-item>

      <!-- Vista Lista -->
      <v-tabs-window-item value="lista">
        <v-data-table
          :headers="headers"
          :items="equiposConFecha"
          :loading="cargando"
          loading-text="Cargando ... por favor espere"
          class="elevation-1"
          :sort-by="[{ key: 'diasRestantes', order: 'asc' }]"
        >
          <template v-slot:item.nombre="{ item }">
            {{ item.nombre }}<br />
            <span class="text-caption text-medium-emphasis">{{ item.serie }}</span>
          </template>

          <template v-slot:item.fechaVencimiento="{ item }">
            {{ item.fechaVencimiento }}
          </template>

          <template v-slot:item.diasRestantes="{ item }">
            <v-chip
              :color="item.color"
              size="small"
              variant="outlined"
              class="font-weight-bold"
            >
              <v-icon start size="small">{{ item.icon }}</v-icon>
              {{ item.diasRestantes >= 0 ? `${item.diasRestantes} días` : `Vencido hace ${Math.abs(item.diasRestantes)} días` }}
            </v-chip>
          </template>
        </v-data-table>
      </v-tabs-window-item>
    </v-tabs-window>

    <!-- Dialog detalle equipo -->
    <v-dialog v-model="dialogDetalle" max-width="480">
      <v-card v-if="equipoSeleccionado">
        <v-toolbar flat :color="equipoSeleccionado.color" class="text-white">
          <v-toolbar-title class="font-weight-bold">
            <v-icon class="mr-2">{{ equipoSeleccionado.icon }}</v-icon>
            {{ equipoSeleccionado.nombre }}
          </v-toolbar-title>
          <v-spacer />
          <v-btn icon variant="text" color="white" @click="dialogDetalle = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pt-4">
          <v-list density="compact">
            <v-list-item prepend-icon="mdi-barcode" title="Serie" :subtitle="equipoSeleccionado.serie" />
            <v-list-item prepend-icon="mdi-domain" title="Propietario" :subtitle="equipoSeleccionado.propietario?.nombre || '—'" />
            <v-list-item prepend-icon="mdi-account" title="Cliente" :subtitle="equipoSeleccionado.cliente?.nombre || '—'" />
            <v-list-item prepend-icon="mdi-calendar-check" title="Último preventivo" :subtitle="formatearFecha(equipoSeleccionado.fechaDePreventivo)" />
            <v-list-item prepend-icon="mdi-calendar-alert" title="Próximo preventivo" :subtitle="equipoSeleccionado.fechaVencimiento" />
            <v-list-item prepend-icon="mdi-update" title="Periodicidad" :subtitle="equipoSeleccionado.referencia?.periodicidadmantenimiento || '—'" />
            <v-list-item prepend-icon="mdi-file-sign" title="Tipo de contrato" :subtitle="equipoSeleccionado.tipoDeContrato || '—'" />
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="teal" variant="flat" @click="dialogDetalle = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';

export default {
  name: 'CalendarioPreventivos',

  components: { FullCalendar },

  data() {
    return {
      cargando: false,
      tab: 'calendario',
      equipos: [],
      dialogDetalle: false,
      equipoSeleccionado: null,
      headers: [
        { title: 'Equipo / Serie', key: 'nombre', sortable: true },
        { title: 'Propietario', key: 'propietario.nombre', sortable: true },
        { title: 'Cliente', key: 'cliente.nombre', sortable: true },
        { title: 'Periodicidad', key: 'referencia.periodicidadmantenimiento', sortable: true },
        { title: 'Próximo preventivo', key: 'fechaVencimiento', sortable: false },
        { title: 'Estado', key: 'diasRestantes', sortable: true },
      ],
      calendarOptions: {
        plugins: [dayGridPlugin, listPlugin],
        initialView: 'dayGridMonth',
        locale: esLocale,
        headerToolbar: {
          left: 'today dayGridMonth listYear',
          center: 'prev title next',
          right: '',
        },
        buttonText: {
          today: 'Hoy',
          month: 'Mes',
          list: 'Lista anual',
        },
        titleFormat: (info) => {
          const str = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(info.date.marker);
          return str.charAt(0).toUpperCase() + str.slice(1);
        },
        events: [],
        eventClick: this.alHacerClickEnEvento,
        eventDisplay: 'block',
        height: 'auto',
        dayMaxEvents: false,
        eventTimeFormat: { hour: undefined },
        displayEventTime: false,
      },
    };
  },

  computed: {
    equiposConFecha() {
      return this.equipos.map((eq) => this.calcularDatos(eq));
    },
  },

  mounted() {
    this.cargarPreventivos();
  },

  methods: {
    async cargarPreventivos() {
      this.cargando = true;
      try {
        const { data } = await this.$axios.get(
          `${this.$store.state.ruta}api/equipo/preventivos`,
          { headers: { token: this.$store.state.token } }
        );
        this.equipos = data;
        this.calendarOptions.events = data.map((eq) => {
          const { fechaVencimientoDate, color } = this.calcularDatos(eq);
          return {
            title: `${eq.nombre} — ${eq.cliente?.nombre || eq.serie}`,
            date: fechaVencimientoDate.toISOString().split('T')[0],
            backgroundColor: color,
            borderColor: color,
            extendedProps: { equipoId: eq.id },
          };
        });
      } catch (error) {
        console.error('Error al cargar preventivos:', error);
      } finally {
        this.cargando = false;
      }
    },

    calcularDatos(eq) {
      const fechaInicial = new Date(eq.fechaDePreventivo);
      const fechaLimite = new Date(fechaInicial);

      switch (eq.referencia?.periodicidadmantenimiento) {
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
      const diasRestantes = Math.floor((fechaLimite - hoy) / (1000 * 60 * 60 * 24));

      let color, icon;
      if (diasRestantes > 30) {
        color = '#4CAF50';
        icon = 'mdi-check-circle';
      } else if (diasRestantes >= 0) {
        color = '#FF7043';
        icon = 'mdi-alert-circle';
      } else {
        color = '#F44336';
        icon = 'mdi-close-circle';
      }

      return {
        ...eq,
        fechaVencimientoDate: fechaLimite,
        fechaVencimiento: fechaLimite.toLocaleDateString('es-CO'),
        diasRestantes,
        color,
        icon,
      };
    },

    alHacerClickEnEvento(info) {
      const equipoId = info.event.extendedProps.equipoId;
      const equipo = this.equiposConFecha.find((eq) => eq.id === equipoId);
      if (equipo) {
        this.equipoSeleccionado = equipo;
        this.dialogDetalle = true;
      }
    },

    formatearFecha(valor) {
      if (!valor) return '—';
      return new Date(valor).toLocaleDateString('es-CO');
    },
  },
};
</script>

<style>
/* ── Base ── */
.calendar-wrapper .fc {
  font-family: 'Roboto', 'Inter', system-ui, sans-serif;
}

/* ── Toolbar centro: flechas + título en fila ── */
.calendar-wrapper .fc-header-toolbar .fc-toolbar-chunk:nth-child(2) {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

/* ── Título del mes ── */
.calendar-wrapper .fc-toolbar-title {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: #1a1a2e;
}

/* ── Encabezados de columna (Lun, Mar, …) ── */
.calendar-wrapper .fc-col-header-cell-cushion {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: capitalize;
  color: #52B69A;
  padding: 8px 0;
  text-decoration: none;
}

/* ── Número del día ── */
.calendar-wrapper .fc-daygrid-day-number {
  font-size: 0.85rem;
  font-weight: 500;
  color: #444;
  padding: 4px 8px;
  text-decoration: none;
}

/* ── Día de hoy ── */
.calendar-wrapper .fc-day-today .fc-daygrid-day-number {
  background-color: #52B69A;
  color: #fff;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4px 6px;
}

/* ── Eventos: texto con salto de línea ── */
.calendar-wrapper .fc-daygrid-event {
  white-space: normal;
  overflow: visible;
  border-radius: 4px;
  padding: 2px 4px;
  margin-bottom: 2px;
  cursor: pointer;
}
.calendar-wrapper .fc-event-title {
  white-space: normal;
  overflow: visible;
  font-size: 0.78rem;
  font-weight: 500;
  line-height: 1.3;
}

/* ── Celdas de día ── */
.calendar-wrapper .fc-daygrid-day {
  min-height: 90px;
}

/* ── Botones de navegación ── */
.calendar-wrapper .fc-button {
  background-color: #52B69A !important;
  border-color: #52B69A !important;
  font-size: 0.82rem !important;
  font-weight: 500 !important;
  letter-spacing: 0.03em !important;
  border-radius: 6px !important;
  padding: 5px 12px !important;
  text-transform: none !important;
  box-shadow: none !important;
}
.calendar-wrapper .fc-button:hover {
  background-color: #3a9c83 !important;
  border-color: #3a9c83 !important;
}
.calendar-wrapper .fc-button-active,
.calendar-wrapper .fc-button:focus {
  background-color: #2d7a66 !important;
  border-color: #2d7a66 !important;
  box-shadow: none !important;
}

/* ── Vista lista: encabezados ── */
.calendar-wrapper .fc-list-day-cushion {
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background-color: #f0faf7 !important;
}
.calendar-wrapper .fc-list-event-title {
  font-size: 0.85rem;
}
</style>
