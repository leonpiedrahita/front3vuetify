<template>
  <v-card class="pa-5 mt-15 ">
    <v-card-title>Informacion del equipo</v-card-title>
    <v-row>
      <v-card-title>
        <v-card title="Nombre del Analizador" variant="flat">
          <v-card-text>
            <v-toolbar-title>
              {{ equipo.nombre }}
            </v-toolbar-title>
          </v-card-text>
        </v-card>
      </v-card-title>
      <v-card-title>
        <v-card title="Numero de serie" variant="flat">
          <v-card-text>
            <v-toolbar-title>
              {{ equipo.serie }}
            </v-toolbar-title>
          </v-card-text>
        </v-card>
      </v-card-title>
      <v-card-title>
        <v-card title="Tipo de contrato" variant="flat">
          <v-card-text>
            <v-toolbar-title>
              {{ equipo.tipodecontrato }}
            </v-toolbar-title>
          </v-card-text>
        </v-card>
      </v-card-title>
      <v-divider class="mb-5 mt-5"></v-divider>
    </v-row>


    <v-card-title>Informacion del propietario</v-card-title>

    <v-row>
      <v-card-title>
        <v-card title="Nombre/Razón social" variant="flat">
          <v-card-text>
            <v-toolbar-title>
              {{ equipo.propietario.nombre }}
            </v-toolbar-title>
          </v-card-text>
        </v-card>
      </v-card-title>
      <v-card-title>
        <v-card title="Identificación" variant="flat">
          <v-card-text>
            <v-toolbar-title>
              {{ equipo.propietario.nit }}
            </v-toolbar-title>
          </v-card-text>
        </v-card>
      </v-card-title>
      <v-card-title>
        <v-card title="Dirección" variant="flat">
          <v-card-text>
            <v-toolbar-title>
              {{ equipo.ubicaciondireccion }}
            </v-toolbar-title>
          </v-card-text>
        </v-card>
      </v-card-title>

    </v-row>
    <v-divider class="mb-5 mt-5"></v-divider>
    <v-card-title>Informacion del cliente</v-card-title>
    <v-row>
      <v-card-title>
        <v-card title="Nombre/Razón social" variant="flat">
          <v-card-text>
            <v-toolbar-title>
              {{ equipo.cliente.nombre }}
            </v-toolbar-title>
          </v-card-text>
        </v-card>
      </v-card-title>
      <v-card-title>
        <v-card title="Identificación" variant="flat">
          <v-card-text>
            <v-toolbar-title>
              {{ equipo.cliente.nit }}
            </v-toolbar-title>
          </v-card-text>
        </v-card>
      </v-card-title>
      

    </v-row>



  </v-card>
  <pre> {{ equipo }} </pre>
</template>
<script>
export default {
  name: "DetallesEquipoComponent",

  data: () => ({
    equipo: {},

    items: [
      {
        id: 1,
        name: "Applications :",
        children: [
          { id: 2, name: "Calendar : app" },
          { id: 3, name: "Chrome : app" },
          { id: 4, name: "Webstorm : app" },
        ],
      },
      {
        id: 5,
        name: "Documents :",
        children: [
          {
            id: 6,
            name: "vuetify :",
            children: [
              {
                id: 7,
                name: "src :",
                children: [
                  { id: 8, name: "index : ts" },
                  { id: 9, name: "bootstrap : ts" },
                ],
              },
            ],
          },
          {
            id: 10,
            name: "material2 :",
            children: [
              {
                id: 11,
                name: "src :",
                children: [
                  { id: 12, name: "v-btn : ts" },
                  { id: 13, name: "v-card : ts" },
                  { id: 14, name: "v-window : ts" },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 15,
        name: "Downloads :",
        children: [
          { id: 16, name: "October : pdf" },
          { id: 17, name: "November : pdf" },
          { id: 18, name: "Tutorial : html" },
        ],
      },
      {
        id: 19,
        name: "Videos :",
        children: [
          {
            id: 20,
            name: "Tutorials :",
            children: [
              { id: 21, name: "Basic layouts : mp4" },
              { id: 22, name: "Advanced techniques : mp4" },
              { id: 23, name: "All about app : dir" },
            ],
          },
          { id: 24, name: "Intro : mov" },
          { id: 25, name: "Conference introduction : avi" },
        ],
      },
    ],
  }),

  computed: {},
  created() {
    this.equipo = this.$store.state.detallesequipo;
  },
  beforeCreate() {
    this.$store.dispatch("autoLogin");
    if (this.$store.state.existe === 0) {
      this.$router.push({ name: "Login" });
    }
    this.$store.dispatch("guardarUbicacion", {
      ubicacion: "Detalles Equipo",
      icono: "mdi-amplifier",
      color: "c6",
    });
  },
  methods: {},
};
</script>
  
<style scoped></style>