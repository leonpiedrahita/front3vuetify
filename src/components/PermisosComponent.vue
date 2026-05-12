<template>
  <v-card class="pa-4">
    <v-card-title class="text-h6 font-weight-bold mb-1 text-center">
      Permisos de notificaciones WhatsApp
    </v-card-title>
    <v-card-subtitle class="mb-4 text-center">
      Activa o desactiva las notificaciones automáticas por rol. Presiona Guardar para aplicar los cambios.
    </v-card-subtitle>

    <v-progress-linear v-if="cargando" indeterminate color="primary" class="mb-4" />

    <template v-else>

      <!-- Interruptor principal -->
      <v-card variant="outlined" class="mb-4 pa-3 mx-auto" style="width: fit-content;" :color="globalHabilitado ? 'success' : 'error'">
        <div class="d-flex align-center justify-center ga-4">
          <v-switch
            v-model="globalHabilitado"
            :color="globalHabilitado ? 'success' : 'error'"
            hide-details
            :loading="guardandoGlobal"
            @update:model-value="cambiarGlobal"
          />
          <div>
            <div class="text-subtitle-1 font-weight-bold">
              <v-icon class="mr-2">mdi-whatsapp</v-icon>
              Notificaciones WhatsApp
            </div>
            <div class="text-body-2 text-medium-emphasis">
              {{ globalHabilitado
                ? 'Activas — las notificaciones se enviarán según la configuración por rol'
                : 'Desactivadas — no se enviará ninguna notificación (la configuración por rol se conserva)' }}
            </div>
          </div>
        </div>
      </v-card>

      <!-- ── Tabla unificada: Notificaciones por etapa ─────────── -->
      <div style="overflow-x: auto;">
        <v-table density="comfortable" class="elevation-1" style="min-width: 1000px;">
          <thead>
            <tr>
              <th class="text-center font-weight-bold" style="min-width:120px;">Rol</th>
              <th class="text-center font-weight-bold" style="min-width:110px; font-size:0.78rem;">Nuevo Ingreso</th>
              <th
                v-for="etapa in tiposEtapa"
                :key="etapa.key"
                class="text-center font-weight-bold"
                style="min-width:110px; font-size:0.78rem;"
              >
                {{ etapa.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rol in roles" :key="rol.nombre">
              <td class="font-weight-medium text-capitalize text-center">{{ rol.nombre }}</td>
              <td class="text-center">
                <v-switch
                  v-model="configuracion[rol.nombre].ingreso"
                  color="success"
                  hide-details
                  density="compact"
                  class="d-flex justify-center"
                />
              </td>
              <td v-for="etapa in tiposEtapa" :key="etapa.key" class="text-center">
                <v-switch
                  v-model="configuracion[rol.nombre][etapa.key]"
                  color="success"
                  hide-details
                  density="compact"
                  class="d-flex justify-center"
                />
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <v-card-actions class="justify-center mt-4">
        <v-btn
          color="primary"
          variant="flat"
          size="large"
          :loading="guardando"
          :disabled="!hayCambios"
          @click="guardarTodo"
        >
          Guardar cambios
        </v-btn>
      </v-card-actions>
    </template>

    <v-snackbar v-model="snackbar.visible" :color="snackbar.color" timeout="3000" location="top center">
      <div class="w-100 text-center">{{ snackbar.mensaje }}</div>
    </v-snackbar>
  </v-card>
</template>

<script>
import axios from 'axios';

const ROLES = [
  { nombre: 'soporte' },
  { nombre: 'aplicaciones' },
  { nombre: 'comercial' },
  { nombre: 'cotizaciones' },
  { nombre: 'calidad' },
  { nombre: 'bodega' },
  { nombre: 'lumira' },
  { nombre: 'ventas' },
  { nombre: 'ingresos' },
];

const TIPOS_ETAPA = [
  { key: 'etapa_cuarentena',            label: 'Cuarentena' },
  { key: 'etapa_soporte_ingenieria',    label: 'Sop. Ingeniería' },
  { key: 'etapa_soporte_aplicaciones',  label: 'Sop. Aplicaciones' },
  { key: 'etapa_listo_despacho',        label: 'Listo p. despacho' },
  { key: 'etapa_cotizacion_solicitada', label: 'Cot. solicitada' },
  { key: 'etapa_cotizacion_aprobada',   label: 'Cot. aprobada' },
  { key: 'etapa_pdte_repuestos',        label: 'Pdte. repuestos' },
  { key: 'etapa_pdte_aprobacion',       label: 'Pdte. aprobación' },
  { key: 'etapa_despachado',            label: 'Despachado' },
  { key: 'etapa_finalizado',            label: 'Finalizado' },
  { key: 'etapa_cancelado',             label: 'Cancelado' },
];

const TIPOS = ['ingreso', ...TIPOS_ETAPA.map(t => t.key)];

function clonar(cfg) {
  return Object.fromEntries(
    Object.entries(cfg).map(([rol, tipos]) => [rol, { ...tipos }])
  );
}

function configuracionInicial() {
  return Object.fromEntries(
    ROLES.map(r => [
      r.nombre,
      Object.fromEntries(TIPOS.map(t => [t, false])),
    ])
  );
}

export default {
  name: 'PermisosComponent',
  data() {
    return {
      cargando: true,
      guardando: false,
      globalHabilitado: true,
      guardandoGlobal: false,
      roles: ROLES,
      tiposEtapa: TIPOS_ETAPA,
      configuracion: configuracionInicial(),
      original: null,
      snackbar: { visible: false, color: 'success', mensaje: '' },
    };
  },
  computed: {
    hayCambios() {
      if (!this.original) return false;
      for (const rol of ROLES) {
        for (const tipo of TIPOS) {
          if (this.configuracion[rol.nombre][tipo] !== this.original[rol.nombre][tipo]) return true;
        }
      }
      return false;
    },
  },
  methods: {
    async cargarGlobal() {
      try {
        const { data } = await axios.get(
          this.$store.state.ruta + 'api/configuracion/notificaciones/global',
          { headers: { token: this.$store.state.token } }
        );
        this.globalHabilitado = data.habilitado;
      } catch (err) {
        this.mostrarSnackbar('error', 'Error al cargar estado global de notificaciones');
      }
    },
    async cambiarGlobal(valor) {
      this.guardandoGlobal = true;
      try {
        await axios.put(
          this.$store.state.ruta + 'api/configuracion/notificaciones/global',
          { habilitado: valor },
          { headers: { token: this.$store.state.token } }
        );
        this.mostrarSnackbar(
          valor ? 'success' : 'warning',
          valor ? 'Notificaciones WhatsApp activadas' : 'Notificaciones WhatsApp desactivadas'
        );
      } catch (err) {
        this.globalHabilitado = !valor;
        this.mostrarSnackbar('error', 'Error al actualizar el estado de notificaciones');
      } finally {
        this.guardandoGlobal = false;
      }
    },
    async cargar() {
      this.cargando = true;
      try {
        const { data } = await axios.get(
          this.$store.state.ruta + 'api/configuracion/notificaciones',
          { headers: { token: this.$store.state.token } }
        );
        data.forEach(({ rol, tipoNotificacion, habilitado }) => {
          if (this.configuracion[rol] && tipoNotificacion in this.configuracion[rol]) {
            this.configuracion[rol][tipoNotificacion] = habilitado;
          }
        });
        this.original = clonar(this.configuracion);
      } catch (err) {
        this.mostrarSnackbar('error', 'Error al cargar la configuración');
      } finally {
        this.cargando = false;
      }
    },
    async guardarTodo() {
      this.guardando = true;
      try {
        const cambios = [];
        for (const rol of ROLES) {
          for (const tipo of TIPOS) {
            cambios.push({ rol: rol.nombre, tipoNotificacion: tipo, habilitado: this.configuracion[rol.nombre][tipo] });
          }
        }
        await axios.post(
          this.$store.state.ruta + 'api/configuracion/notificaciones/bulk',
          { cambios },
          { headers: { token: this.$store.state.token } }
        );
        this.original = clonar(this.configuracion);
        this.mostrarSnackbar('success', 'Configuración guardada correctamente');
      } catch (err) {
        this.mostrarSnackbar('error', 'Error al guardar la configuración');
      } finally {
        this.guardando = false;
      }
    },
    mostrarSnackbar(color, mensaje) {
      this.snackbar = { visible: true, color, mensaje };
    },
  },
  created() {
    this.$store.dispatch('autoLogin');
    if (this.$store.state.existe === 0) {
      this.$router.push({ name: 'Login' });
      return;
    }
    this.$store.dispatch('guardarUbicacion', {
      ubicacion: 'Admin. de Permisos',
      icono: 'mdi-shield-account',
      color: 'c6',
    });
    this.cargarGlobal();
    this.cargar();
  },
};
</script>
