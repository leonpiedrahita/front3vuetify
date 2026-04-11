<template>
  <v-card class="pa-2">
    <v-toolbar flat style="background-color: #52B69A; color: white;" class="mb-4">
      <v-icon class="ml-2 mr-3">mdi-file-document-edit-outline</v-icon>
      <v-toolbar-title class="font-weight-bold">Mis Borradores</v-toolbar-title>
    </v-toolbar>

    <v-progress-linear v-if="cargando" indeterminate color="teal" class="mb-2" />

    <v-data-table
      :headers="headers"
      :items="borradores"
      :loading="cargando"
      loading-text="Cargando ... por favor espere"
      class="elevation-1"
      hide-default-footer
      :items-per-page="-1"
    >
      <template v-slot:no-data>
        <div class="text-center pa-4 text-medium-emphasis">
          No tienes borradores guardados
        </div>
      </template>

      <template v-slot:item.equipo="{ item }">
        {{ item.equipo.nombre }}
      </template>

      <template v-slot:item.serie="{ item }">
        {{ item.equipo.serie }}
      </template>

      <template v-slot:item.propietario="{ item }">
        {{ item.equipo.propietario ? item.equipo.propietario.nombre : '—' }}
      </template>

      <template v-slot:item.cliente="{ item }">
        {{ item.equipo.cliente ? item.equipo.cliente.nombre : '—' }}
      </template>

      <template v-slot:item.actualizadoEn="{ item }">
        {{ formatearFecha(item.actualizadoEn) }}
      </template>

      <template v-slot:item.acciones="{ item }">
        <v-btn
          icon
          variant="text"
          color="primary"
          size="small"
          title="Continuar borrador"
          @click="continuarBorrador(item)"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn
          icon
          variant="text"
          color="error"
          size="small"
          title="Eliminar borrador"
          :loading="eliminandoId === item.id"
          @click="confirmarEliminar(item)"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- Diálogo de confirmación -->
    <v-dialog v-model="dialogConfirmar" max-width="400" persistent>
      <v-card>
        <v-toolbar flat color="error" class="text-white">
          <v-icon class="ml-3 mr-2">mdi-alert</v-icon>
          <v-toolbar-title class="font-weight-bold">Eliminar borrador</v-toolbar-title>
        </v-toolbar>
        <v-card-text class="pt-4">
          ¿Estás seguro de que deseas eliminar el borrador de
          <strong>{{ borradorAEliminar?.equipo?.nombre }}</strong>?
          Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 justify-end ga-2">
          <v-btn variant="outlined" @click="dialogConfirmar = false">Cancelar</v-btn>
          <v-btn color="error" variant="flat" @click="eliminarBorrador">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
export default {
  name: 'MisBorradores',

  data: () => ({
    cargando: false,
    eliminandoId: null,
    borradores: [],
    dialogConfirmar: false,
    borradorAEliminar: null,
    headers: [
      { title: 'Equipo', key: 'equipo', sortable: true },
      { title: 'Serie', key: 'serie', sortable: true },
      { title: 'Propietario', key: 'propietario', sortable: true },
      { title: 'Cliente', key: 'cliente', sortable: true },
      { title: 'Última modificación', key: 'actualizadoEn', sortable: true },
      { title: 'Acciones', key: 'acciones', sortable: false, align: 'center' },
    ],
  }),

  mounted() {
    this.cargarBorradores();
  },

  methods: {
    async cargarBorradores() {
      this.cargando = true;
      try {
        const ruta = this.$store.state.ruta;
        const token = this.$store.state.token;
        const { data } = await this.$axios.get(`${ruta}api/borrador/listar`, {
          headers: { token },
        });
        this.borradores = data;
      } catch (error) {
        console.error('Error al cargar borradores:', error);
      } finally {
        this.cargando = false;
      }
    },

    continuarBorrador(borrador) {
      // Sobreescribir el equipo en localStorage con el del borrador,
      // para que consultarequipo() no cargue el equipo de la sesión anterior
      localStorage.setItem('equipo', JSON.stringify(borrador.equipo));
      sessionStorage.setItem(
        'borradorEditar',
        JSON.stringify({ id: borrador.id, datos: borrador.datos })
      );
      this.$router.push({ name: 'FormularioGenerarOrden' });
    },

    confirmarEliminar(borrador) {
      this.borradorAEliminar = borrador;
      this.dialogConfirmar = true;
    },

    async eliminarBorrador() {
      const borrador = this.borradorAEliminar;
      this.dialogConfirmar = false;
      this.eliminandoId = borrador.id;
      try {
        const ruta = this.$store.state.ruta;
        const token = this.$store.state.token;
        await this.$axios.delete(`${ruta}api/borrador/eliminar/${borrador.id}`, {
          headers: { token },
        });
        this.borradores = this.borradores.filter((b) => b.id !== borrador.id);
      } catch (error) {
        console.error('Error al eliminar borrador:', error);
      } finally {
        this.eliminandoId = null;
        this.borradorAEliminar = null;
      }
    },

    formatearFecha(valor) {
      if (!valor) return '—';
      return new Date(valor).toLocaleDateString('es-CO');
    },
  },
};
</script>
