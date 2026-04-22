<template>
  <v-card class="pa-2">
    <v-progress-linear v-if="cargando" indeterminate color="teal" class="mb-2" />

    <!-- Leyenda + Filtro -->
    <v-row align="center" class="mb-4 px-2">
      <v-col cols="12" sm="6" md="4">
        <v-autocomplete
          v-model="clienteFiltro"
          :items="listaClientes"
          label="Filtrar por cliente"
          clearable
          hide-details
          density="compact"
          prepend-inner-icon="mdi-filter"
          variant="outlined"
          :custom-filter="filtrarCliente"
        />
      </v-col>
      <v-col cols="12" sm="6" md="8" class="d-flex ga-4 flex-wrap justify-center justify-sm-end">
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
      </v-col>
    </v-row>

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
          :items="equiposFiltradosConFecha"
          :loading="cargando"
          loading-text="Cargando ... por favor espere"
          class="elevation-1"
          :sort-by="[{ key: 'diasRestantes', order: 'asc' }]"
        >
          <template v-slot:item.nombre="{ item }">
            {{ item.nombre }}<br />
            <span class="text-caption text-medium-emphasis">{{ item.serie }}</span>
          </template>

          <template v-slot:item.diasRestantes="{ item }">
            <v-chip :color="item.color" size="small" variant="outlined" class="font-weight-bold">
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
            <v-list-item prepend-icon="mdi-map-marker" title="Ciudad" :subtitle="equipoSeleccionado.ubicacionNombre || '—'" />
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
      clienteFiltro: null,
      dialogDetalle: false,
      equipoSeleccionado: null,
      headers: [
        { title: 'Equipo / Serie', key: 'nombre', sortable: true },
        { title: 'Cliente', key: 'cliente.nombre', sortable: true },
        { title: 'Ciudad', key: 'ubicacionNombre', sortable: true },
        { title: 'Propietario', key: 'propietario.nombre', sortable: true },
        { title: 'Periodicidad', key: 'referencia.periodicidadmantenimiento', sortable: true },
        { title: 'Próximo preventivo', key: 'fechaVencimiento', sortable: false },
        { title: 'Estado', key: 'diasRestantes', sortable: true },
      ],
      calendarOptions: {
        plugins: [dayGridPlugin, listPlugin],
        initialView: 'dayGridMonth',
        initialDate: new Date(),
        locale: esLocale,
        headerToolbar: {
          left: 'today dayGridMonth listYear',
          center: 'prev title next',
          right: '',
        },
        buttonText: { today: 'Hoy', month: 'Mes', list: 'Lista anual' },
        events: [],
        eventContent: this.renderEvento,
        eventClick: this.alHacerClickEnEvento,
        eventDisplay: 'block',
        height: 'auto',
        dayMaxEvents: false,
        displayEventTime: false,
      },
    };
  },

  computed: {
    listaClientes() {
      const nombres = this.equipos
        .map((eq) => eq.cliente?.nombre)
        .filter(Boolean);
      return [...new Set(nombres)].sort();
    },

    equiposFiltrados() {
      if (!this.clienteFiltro) return this.equipos;
      const q = this.clienteFiltro.toLowerCase();
      return this.equipos.filter((eq) => eq.cliente?.nombre?.toLowerCase().includes(q));
    },

    equiposFiltradosConFecha() {
      return this.equiposFiltrados.map((eq) => this.calcularDatos(eq));
    },
  },

  watch: {
    equiposFiltrados(lista) {
      this.calendarOptions.events = lista.map((eq) => {
        const { fechaVencimientoDate, color } = this.calcularDatos(eq);
        return {
          title: eq.nombre,
          date: fechaVencimientoDate.toISOString().split('T')[0],
          backgroundColor: color,
          borderColor: color,
          extendedProps: {
            equipoId: eq.id,
            cliente: eq.cliente?.nombre || '—',
            ciudad: eq.ubicacionNombre || '—',
          },
        };
      });
    },
  },

  created() {
    this.$store.dispatch('autoLogin');
    this.$store.dispatch('guardarUbicacion', {
      ubicacion: 'Calendario de Preventivos',
      icono: 'mdi-calendar-clock',
      color: 'c6',
    });
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
        case 'Anual':    fechaLimite.setMonth(fechaLimite.getMonth() + 12); break;
        case 'Semestral': fechaLimite.setMonth(fechaLimite.getMonth() + 6); break;
        case 'Trimestral': fechaLimite.setMonth(fechaLimite.getMonth() + 3); break;
      }
      const hoy = new Date();
      const diasRestantes = Math.floor((fechaLimite - hoy) / (1000 * 60 * 60 * 24));
      let color, icon;
      if (diasRestantes > 30)       { color = '#4CAF50'; icon = 'mdi-check-circle'; }
      else if (diasRestantes >= 0)  { color = '#FF7043'; icon = 'mdi-alert-circle'; }
      else                          { color = '#F44336'; icon = 'mdi-close-circle'; }
      return {
        ...eq,
        fechaVencimientoDate: fechaLimite,
        fechaVencimiento: fechaLimite.toLocaleDateString('es-CO'),
        diasRestantes,
        color,
        icon,
      };
    },

    renderEvento(info) {
      const { cliente, ciudad } = info.event.extendedProps;
      return {
        html: `
          <div class="fc-evento-custom">
            <div class="fc-evento-equipo">${info.event.title}</div>
            <div class="fc-evento-sub">
              <span><i class="mdi mdi-account"></i> ${cliente}</span>
              <span><i class="mdi mdi-map-marker"></i> ${ciudad}</span>
            </div>
          </div>
        `,
      };
    },

    alHacerClickEnEvento(info) {
      const equipoId = info.event.extendedProps.equipoId;
      const equipo = this.equiposFiltradosConFecha.find((eq) => eq.id === equipoId);
      if (equipo) {
        this.equipoSeleccionado = equipo;
        this.dialogDetalle = true;
      }
    },

    filtrarCliente(itemTitle, queryText) {
      return itemTitle.toLowerCase().includes(queryText.toLowerCase());
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
  text-transform: lowercase;
}
.calendar-wrapper .fc-toolbar-title::first-letter {
  text-transform: uppercase;
}

/* ── Encabezados de columna (Lun, Mar, …) ── */
.calendar-wrapper .fc-col-header-cell-cushion {
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: capitalize;
  color: #1a1a1a;
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

/* ── Eventos ── */
.calendar-wrapper .fc-daygrid-event {
  white-space: normal;
  overflow: visible;
  border-radius: 4px;
  padding: 3px 5px;
  margin-bottom: 2px;
  cursor: pointer;
}
.fc-evento-custom {
  line-height: 1.3;
}
.fc-evento-equipo {
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
}
.fc-evento-sub {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-top: 2px;
}
.fc-evento-sub span {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.92);
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
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 1 !important;
}
.calendar-wrapper .fc-button .fc-icon {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 1 !important;
  font-size: 1.1em !important;
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

/* ── Lista anual: texto en negro ── */
.calendar-wrapper .fc-list-event .fc-evento-equipo {
  color: #1a1a1a;
}
.calendar-wrapper .fc-list-event .fc-evento-sub span {
  color: #444;
}

/* ── Vista lista ── */
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
