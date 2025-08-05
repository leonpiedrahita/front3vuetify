<template>
    <v-timeline align="start" density="confortable" truncate-line="both">
        <v-timeline-item v-for="(etapa, index) in ingreso.etapas" :key="etapa.id" dot-color="primary" size="small" >
             <!-- Dibuja el número en el dot -->
       <!-- Slot para mostrar el número como ícono -->
      <template v-slot:icon>
        <div
          class="d-flex align-center justify-center rounded-circle primary text-white"
          style="width: 24px; height: 24px; font-size: 12px;"
        >
          {{ index + 1 }}
        </div>
      </template>
            <template v-slot:opposite>
                <div class="d-flex flex-column align-end text-end">
                    <div><strong class="me-4">{{ etapa.fecha || 'Sin fecha' }}</strong></div>
                    <div><strong>{{ etapa.nombre }}</strong></div>
                </div>
            </template>
            <div>
                <div class="text-caption">
                    Comentario: {{ etapa.comentario || 'Sin comentario' }}
                </div>
                <div class="text-caption">
                    Ubicación: {{ etapa.ubicacion || 'Sin ubicación' }}
                </div>
                <div class="text-caption">
                    Responsable: {{ etapa.responsable || 'No asignado' }}
                </div>
            </div>
        </v-timeline-item>
    </v-timeline>
</template>

<script setup>
const ingreso = {
    id: 12,
    equipoId: 51,
    etapaActual: 3,
    ultimaEtapa: 3,
    estado: "Abierta",
    createdAt: "2025-08-05T02:22:54.500Z",
    updatedAt: "2025-08-05T02:23:21.975Z",
    etapas: [
        {
            id: 31,
            ingresoId: 12,
            nombre: "Desinfección",
            comentario: "dfsgdfg",
            responsable: "Usuario Administrador",
            fecha: "(4-8-2025)",
            ubicacion: "Cuarentena",
            createdAt: "2025-08-05T02:22:54.500Z",
        },
        {
            id: 32,
            ingresoId: 12,
            nombre: "Soporte ingeniería",
            comentario: "fghdtyutyu",
            responsable: "Usuario Administrador",
            fecha: "(4-8-2025)",
            ubicacion: "Cuarentena",
            createdAt: "2025-08-05T02:23:07.908Z",
        },
        {
            id: 33,
            ingresoId: 12,
            nombre: "Listo para despacho",
            comentario: null,
            responsable: null,
            fecha: null,
            ubicacion: "Bodega de equipos usados",
            createdAt: "2025-08-05T02:23:21.973Z",
        },
    ],
};
</script>
<style></style>