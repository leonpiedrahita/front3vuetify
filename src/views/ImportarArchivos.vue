<template>
  <v-card class="pa-2">
    <!-- Tarjetas lado a lado -->
    <div class="d-flex flex-wrap ma-4" style="gap: 24px; justify-content: space-between;">

      <!-- Sección 1: Cartera -->
      <v-card class="pa-6 flex-1-1" style="min-width: 280px; max-width: 560px;" elevation="2">
        <v-card-title class="text-subtitle-1 font-weight-medium mb-1 px-0">
          Cartera de clientes
        </v-card-title>
        <v-card-subtitle class="mb-4 text-medium-emphasis px-0">
          Columnas requeridas: <strong>Cliente</strong> (NIT), <strong>Nombre Cliente</strong>, <strong>Menor_Dias_desde_Factura</strong>
        </v-card-subtitle>

        <v-card-text class="pb-2 px-0">
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

        <v-card-actions class="px-0 pb-0 pt-4">
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

        <!-- Resultado cartera -->
        <v-alert v-if="resultado" type="success" variant="tonal" class="mt-4" density="compact">
          <div class="font-weight-medium mb-1">Importación completada</div>
          <div>Total procesados: <strong>{{ resultado.total }}</strong></div>
          <div>Con NIT encontrado: <strong>{{ resultado.actualizados }}</strong></div>
          <div>Sin coincidencia: <strong>{{ resultado.enBlanco }}</strong></div>
        </v-alert>
      </v-card>

      <!-- Sección 2: Asesores -->
      <v-card class="pa-6 flex-1-1" style="min-width: 280px; max-width: 560px;" elevation="2">
        <v-card-title class="text-subtitle-1 font-weight-medium mb-1 px-0">
          Asesores comerciales
        </v-card-title>
        <v-card-subtitle class="mb-4 text-medium-emphasis px-0">
          Columnas requeridas: <strong>Cliente</strong> (NIT), <strong>Nombre Cliente</strong>, <strong>Razon_social_vend</strong>
        </v-card-subtitle>

        <v-card-text class="pb-2 px-0">
          <v-file-input
            v-model="archivoAsesor"
            accept=".csv"
            label="Seleccionar archivo CSV"
            prepend-icon="mdi-paperclip"
            variant="outlined"
            show-size
            clearable
            @update:model-value="onArchivoAsesorSeleccionado"
          />

          <div v-if="previstaAsesores.length" class="mt-2">
            <div class="text-caption text-medium-emphasis mb-1">
              Vista previa — {{ previstaAsesores.length }} registros leídos
            </div>
            <v-table density="compact" class="rounded border" style="max-height:200px; overflow-y:auto;">
              <thead>
                <tr>
                  <th>NIT</th>
                  <th>Nombre cliente</th>
                  <th>Asesor</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in previstaAsesores.slice(0, 8)" :key="r.nit">
                  <td>{{ r.nit }}</td>
                  <td>{{ r.nombre }}</td>
                  <td>{{ r.asesor }}</td>
                </tr>
                <tr v-if="previstaAsesores.length > 8">
                  <td colspan="3" class="text-center text-caption text-medium-emphasis">
                    ... y {{ previstaAsesores.length - 8 }} registros más
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </v-card-text>

        <v-card-actions class="px-0 pb-0 pt-4">
          <v-btn
            color="#52B69A"
            variant="flat"
            style="color: white;"
            :disabled="!archivoAsesor || previstaAsesores.length === 0"
            :loading="importandoAsesor"
            @click="importarAsesor"
          >
            <v-icon start>mdi-upload</v-icon>
            Importar
          </v-btn>
        </v-card-actions>

        <!-- Resultado asesores -->
        <v-alert v-if="resultadoAsesor" type="success" variant="tonal" class="mt-4" density="compact">
          <div class="font-weight-medium mb-1">Importación completada</div>
          <div>Total procesados: <strong>{{ resultadoAsesor.total }}</strong></div>
          <div>Con asesor asignado: <strong>{{ resultadoAsesor.actualizados }}</strong></div>
          <div>Sin coincidencia: <strong>{{ resultadoAsesor.enBlanco }}</strong></div>
        </v-alert>
      </v-card>

    </div>

    <!-- Snackbar de error -->
    <v-snackbar v-model="snackbarError" color="error" timeout="4000">
      {{ mensajeError }}
    </v-snackbar>
  </v-card>
</template>

<script>
export default {
  name: 'ImportarArchivos',

  created() {
    this.$store.dispatch('guardarUbicacion', {
      ubicacion: 'Importar Archivos',
      icono: 'mdi-file-upload-outline',
      color: 'c6',
    });
  },

  data: () => ({
    // Cartera
    archivo: null,
    previstaRegistros: [],
    importando: false,
    resultado: null,
    // Asesores
    archivoAsesor: null,
    previstaAsesores: [],
    importandoAsesor: false,
    resultadoAsesor: null,
    // Compartido
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
          this.previstaRegistros = this.parsearCSVCartera(e.target.result);
        } catch {
          this.mostrarError('No se pudo leer el archivo CSV. Verifica el formato.');
        }
      };
      reader.readAsText(file, 'UTF-8');
    },

    onArchivoAsesorSeleccionado(file) {
      this.previstaAsesores = [];
      this.resultadoAsesor = null;
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          this.previstaAsesores = this.parsearCSVAsesor(e.target.result);
        } catch {
          this.mostrarError('No se pudo leer el archivo CSV. Verifica el formato.');
        }
      };
      reader.readAsText(file, 'UTF-8');
    },

    parsearCSVCartera(texto) {
      const contenido = texto.replace(/^﻿/, '');
      const lineas = contenido.split(/\r?\n/).filter(l => l.trim());
      if (lineas.length < 2) throw new Error('Archivo vacío');
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

    parsearCSVAsesor(texto) {
      const contenido = texto.replace(/^﻿/, '');
      const lineas = contenido.split(/\r?\n/).filter(l => l.trim());
      if (lineas.length < 2) throw new Error('Archivo vacío');
      const registros = [];
      for (let i = 1; i < lineas.length; i++) {
        const partes = lineas[i].split(',');
        if (partes.length < 3) continue;
        const nit = partes[0].trim();
        const nombre = partes[1].trim();
        const asesor = partes[2].trim();
        if (!nit || !asesor) continue;
        registros.push({ nit, nombre, asesor });
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

    async importarAsesor() {
      this.importandoAsesor = true;
      this.resultadoAsesor = null;
      try {
        const ruta = this.$store.state.ruta;
        const token = this.$store.state.token;
        const { data } = await this.$axios.post(
          `${ruta}api/equipo/importarasesor`,
          { registros: this.previstaAsesores.map(r => ({ nit: r.nit, asesor: r.asesor })) },
          { headers: { token } }
        );
        this.resultadoAsesor = data;
      } catch (err) {
        this.mostrarError(err?.response?.data?.error || 'Error al importar asesores. Intenta de nuevo.');
      } finally {
        this.importandoAsesor = false;
      }
    },

    mostrarError(msg) {
      this.mensajeError = msg;
      this.snackbarError = true;
    },
  },
};
</script>
