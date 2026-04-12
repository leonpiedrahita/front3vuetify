<template>
  <v-card class="pa-2">
    <v-toolbar flat style="background-color: #52B69A; color: white;" class="mb-4">
      <v-icon class="ml-2 mr-3">mdi-file-upload-outline</v-icon>
      <v-toolbar-title class="font-weight-bold">Importar Archivos</v-toolbar-title>
    </v-toolbar>

    <v-card class="ma-4 pa-6" max-width="600" elevation="2">
      <v-card-title class="text-subtitle-1 font-weight-medium mb-1">
        Cargar archivo CSV — Cartera de clientes
      </v-card-title>
      <v-card-subtitle class="mb-4 text-medium-emphasis">
        El archivo debe tener las columnas: <strong>Cliente</strong> (NIT), <strong>Nombre Cliente</strong>, <strong>Menor_Dias_desde_Factura</strong>
      </v-card-subtitle>

      <v-card-text class="pb-2">
        <v-file-input
          v-model="archivo"
          accept=".csv"
          label="Seleccionar archivo CSV"
          prepend-icon="mdi-paperclip"
          variant="outlined"
          show-size
          clearable
          @update:model-value="onArchivoSeleccionado"
        />

        <!-- Vista previa del CSV -->
        <div v-if="previstaRegistros.length" class="mt-2">
          <div class="text-caption text-medium-emphasis mb-1">
            Vista previa — {{ previstaRegistros.length }} registros leídos
          </div>
          <v-table density="compact" class="rounded border" style="max-height:200px; overflow-y:auto;">
            <thead>
              <tr>
                <th>NIT</th>
                <th>Nombre</th>
                <th>Días desde factura</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in previstaRegistros.slice(0, 8)" :key="r.nit">
                <td>{{ r.nit }}</td>
                <td>{{ r.nombre }}</td>
                <td>
                  <v-chip :color="r.dias >= 90 ? 'error' : 'success'" size="x-small" variant="flat">
                    {{ r.dias }}
                  </v-chip>
                </td>
              </tr>
              <tr v-if="previstaRegistros.length > 8">
                <td colspan="3" class="text-center text-caption text-medium-emphasis">
                  ... y {{ previstaRegistros.length - 8 }} registros más
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-btn
          color="#52B69A"
          variant="flat"
          style="color: white;"
          :disabled="!archivo || previstaRegistros.length === 0"
          :loading="importando"
          @click="importar"
        >
          <v-icon start>mdi-upload</v-icon>
          Importar
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Resultado de la importación -->
    <v-card v-if="resultado" class="ma-4 pa-4" max-width="600" elevation="1">
      <v-card-title class="text-subtitle-1 font-weight-medium">
        <v-icon color="success" class="mr-2">mdi-check-circle</v-icon>
        Importación completada
      </v-card-title>
      <v-card-text>
        <v-list density="compact">
          <v-list-item>
            <template v-slot:prepend><v-icon color="primary">mdi-format-list-numbered</v-icon></template>
            <v-list-item-title>Total equipos procesados</v-list-item-title>
            <template v-slot:append><strong>{{ resultado.total }}</strong></template>
          </v-list-item>
          <v-list-item>
            <template v-slot:prepend><v-icon color="teal">mdi-check</v-icon></template>
            <v-list-item-title>Equipos con NIT encontrado en CSV</v-list-item-title>
            <template v-slot:append><strong>{{ resultado.actualizados }}</strong></template>
          </v-list-item>
          <v-list-item>
            <template v-slot:prepend><v-icon color="grey">mdi-minus</v-icon></template>
            <v-list-item-title>Equipos sin coincidencia (campo en blanco)</v-list-item-title>
            <template v-slot:append><strong>{{ resultado.enBlanco }}</strong></template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- Snackbar de error -->
    <v-snackbar v-model="snackbarError" color="error" timeout="4000">
      {{ mensajeError }}
    </v-snackbar>
  </v-card>
</template>

<script>
export default {
  name: 'ImportarArchivos',

  data: () => ({
    archivo: null,
    previstaRegistros: [],
    importando: false,
    resultado: null,
    snackbarError: false,
    mensajeError: '',
  }),

  methods: {
    onArchivoSeleccionado(file) {
      this.previstaRegistros = [];
      this.resultado = null;
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          this.previstaRegistros = this.parsearCSV(e.target.result);
        } catch {
          this.mostrarError('No se pudo leer el archivo CSV. Verifica el formato.');
        }
      };
      reader.readAsText(file, 'UTF-8');
    },

    parsearCSV(texto) {
      // Quitar BOM si existe
      const contenido = texto.replace(/^\uFEFF/, '');
      const lineas = contenido.split(/\r?\n/).filter(l => l.trim());
      if (lineas.length < 2) throw new Error('Archivo vacío');

      // Saltar encabezado
      const registros = [];
      for (let i = 1; i < lineas.length; i++) {
        const partes = lineas[i].split(',');
        if (partes.length < 3) continue;
        const nit = partes[0].trim();
        const nombre = partes[1].trim();
        const dias = parseInt(partes[2].trim(), 10);
        if (!nit || isNaN(dias)) continue;
        registros.push({ nit, nombre, dias });
      }
      return registros;
    },

    async importar() {
      this.importando = true;
      this.resultado = null;
      try {
        const ruta = this.$store.state.ruta;
        const token = this.$store.state.token;
        const { data } = await this.$axios.post(
          `${ruta}api/equipo/importaratencion`,
          { registros: this.previstaRegistros.map(r => ({ nit: r.nit, dias: r.dias })) },
          { headers: { token } }
        );
        this.resultado = data;
      } catch (err) {
        this.mostrarError(err?.response?.data?.error || 'Error al importar. Intenta de nuevo.');
      } finally {
        this.importando = false;
      }
    },

    mostrarError(msg) {
      this.mensajeError = msg;
      this.snackbarError = true;
    },
  },
};
</script>
