<template>
  <v-app id="inspire">
    <v-app-bar app :color="this.$store.state.color">
      <v-app-bar-nav-icon class="mr-1" @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-toolbar-title class="pa-0"><v-icon medium class="mb-1 mr-1">{{ this.$store.state.icono }}</v-icon>
        {{ this.$store.state.ubicacion }}</v-toolbar-title>
      <v-spacer></v-spacer>

      <v-toolbar-title class="mostrar">
        {{ this.$store.state.user.nombre }}</v-toolbar-title>

      <v-btn icon class="mr-5 ml-5" @click="salir()">
        <v-icon> mdi-logout</v-icon>
        <span> </span>
      </v-btn>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" fixed temporary>
      <v-card class="mx-auto" max-width="300" tile>
        <v-list nav>
          <v-list-item :to="{ name: 'ListarEquipos' }" exact><!-- uando doy clic en incicio me envía a Segura -->
            <v-list-item prepend-icon="mdi-home" title="Inicio" />



          </v-list-item>

          <v-list-item :to="{ name: 'ListarClientes' }">
            <v-list-item prepend-icon="mdi-account-box-multiple" title="Clientes" />

          </v-list-item>
          <v-list-group>
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" prepend-icon="mdi-amplifier" title="Equipos" />

            </template>
            <v-list-item :to="{ name: 'ListarEquipos' }">
              <v-list-item-subtitle>
                <v-list-item-title> Existentes </v-list-item-title>
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item :to="{ name: 'ListarRefEquipos' }">
              <v-list-item-subtitle>
                <v-list-item-title> Referencias </v-list-item-title>
              </v-list-item-subtitle>
            </v-list-item>

          </v-list-group>
          <v-list-item :to="{ name: 'ListarOrdenes' }">
            <v-list-item prepend-icon="mdi-vector-circle" title="Ingresos" />


          </v-list-item>

          <!--  <v-list-group v-if="this.$store.state.user.rol === 'administrador'" prepend-icon="mdi-security" no-action>
            <template v-slot:activator>
              <v-list-item>
                <v-list-item-title> Permisos </v-list-item-title>
              </v-list-item>
            </template>

                          <v-list-item :to="{ name: 'Usuario' }">
                <v-list-item-subtitle>
                  <v-list-item-title> Usuario </v-list-item-title>
                </v-list-item-subtitle>
              </v-list-item> 
          </v-list-group>-->
        </v-list></v-card>
    </v-navigation-drawer>

    <v-main class="margen">
      <router-view />
    </v-main>
  </v-app>
</template>
<script>
export default {
  name: "SeguraComponent",
  data() {
    return {
      drawer: null,
      selectedItem: 1,
      desplegableequipos: [
        [],
        []
      ]
    };
  },
  beforeCreate() {
    this.$store.dispatch("autoLogin");
    if (this.$store.state.existe === 0) {
      this.$router.push({ name: "Login" });
    }
  },

  methods: {
    salir() {
      this.$store.dispatch("salir");
    },
  },
};
</script>
<style>
.margen {
  padding: 0px !important;
 margin-top: 4em;
}

.mostrar {
  width: auto;
}

@media (max-width: 500px) {
  .mostrar {
    width: 0;
  }
}
</style>