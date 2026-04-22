<template>
  <v-card class="pa-4">
    <v-card-title class="text-h6 font-weight-bold mb-2 text-center">
      Permisos de notificaciones WhatsApp
    </v-card-title>
    <v-card-subtitle class="mb-4 text-center">
      Activa o desactiva las notificaciones automáticas por rol. Presiona Guardar para aplicar los cambios.
    </v-card-subtitle>

    <v-progress-linear v-if="cargando" indeterminate color="primary" class="mb-4" />

    <v-table v-else density="comfortable" class="elevation-1">
      <thead>
        <tr>
          <th class="text-center font-weight-bold">Rol</th>
          <th class="text-center font-weight-bold">Nuevo Ingreso</th>
          <th class="text-center font-weight-bold">Cambio de Etapa</th>
          <th class="text-center font-weight-bold">Despachado</th>
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
          <td class="text-center">
            <v-switch
              v-model="configuracion[rol.nombre].etapa"
              color="success"
              hide-details
              density="compact"
              class="d-flex justify-center"
            />
          </td>
          <td class="text-center">
            <v-switch
              v-model="configuracion[rol.nombre].etapa_despachado"
              color="success"
              hide-details
              density="compact"
              class="d-flex justify-center"
            />
          </td>
        </tr>
      </tbody>
    </v-table>

    <v-card-actions v-if="!cargando" class="justify-center mt-4">
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

const TIPOS = ['ingreso', 'etapa', 'etapa_despachado'];

function clonar(cfg) {
  return Object.fromEntries(
    Object.entries(cfg).map(([rol, tipos]) => [rol, { ...tipos }])
  );
}

export default {
  name: 'PermisosComponent',
  data() {
    return {
      cargando: true,
      guardando: false,
      roles: ROLES,
      configuracion: Object.fromEntries(
        ROLES.map(r => [r.nombre, { ingreso: false, etapa: false, etapa_despachado: false }])
      ),
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
    async cargar() {
      this.cargando = true;
      try {
        const { data } = await axios.get(
          this.$store.state.ruta + 'api/configuracion/notificaciones',
          { headers: { token: this.$store.state.token } }
        );
        data.forEach(({ rol, tipoNotificacion, habilitado }) => {
          if (this.configuracion[rol]) {
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
        const peticiones = [];
        for (const rol of ROLES) {
          for (const tipo of TIPOS) {
            peticiones.push(
              axios.put(
                this.$store.state.ruta + 'api/configuracion/notificaciones',
                { rol: rol.nombre, tipoNotificacion: tipo, habilitado: this.configuracion[rol.nombre][tipo] },
                { headers: { token: this.$store.state.token } }
              )
            );
          }
        }
        await Promise.all(peticiones);
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
    this.cargar();
  },
};
</script>
