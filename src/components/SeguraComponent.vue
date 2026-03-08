<template>
  <v-app id="inspire">
    <v-app-bar app :color="this.$store.state.color">
      <v-app-bar-nav-icon class="mr-1" @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-toolbar-title class="pa-0"><v-icon medium class="mb-1 mr-1">{{ this.$store.state.icono }}</v-icon>
        {{ this.$store.state.ubicacion }}</v-toolbar-title>
      <v-spacer></v-spacer>

      <v-toolbar-title class="mostrar">
        {{ this.$store.state.user.nombre }}</v-toolbar-title>

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon class="mr-5 ml-5" v-bind="props">
            <v-icon size="x-large">mdi-account-circle</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item prepend-icon="mdi-account" title="Información del usuario" @click="dialogoUsuario = true" />
          <v-list-item prepend-icon="mdi-logout" title="Cerrar sesión" @click="salir()" />
        </v-list>
      </v-menu>

      <!-- Modal información del usuario -->
      <v-dialog v-model="dialogoUsuario" width="75%" persistent>
        <v-card>
          <v-toolbar flat style="background-color: #52B69A; color: white;">
            <v-toolbar-title class="font-weight-bold">Mi cuenta</v-toolbar-title>
            <v-spacer />
            <v-btn icon="mdi-close" variant="text" color="white" @click="cerrarDialogoUsuario" />
          </v-toolbar>

          <v-card-text class="pa-6">
            <v-row>
              <!-- Información del usuario -->
              <v-col cols="12" md="6">
                <div class="text-h6 mb-4">Información</div>
                <v-list lines="two">
                  <v-list-item prepend-icon="mdi-account" title="Nombre" :subtitle="$store.state.user.nombre" />
                  <v-list-item prepend-icon="mdi-email" title="Correo" :subtitle="$store.state.user.email" />
                  <v-list-item prepend-icon="mdi-badge-account" title="Rol" :subtitle="$store.state.user.rol" />
                </v-list>
              </v-col>

              <!-- Cambiar contraseña -->
              <v-col cols="12" md="6">
                <div class="text-h6 mb-4">Cambiar contraseña</div>
                <v-text-field
                  v-model="nuevaContrasena"
                  label="Nueva contraseña"
                  :type="mostrarContrasena ? 'text' : 'password'"
                  :append-inner-icon="mostrarContrasena ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="mostrarContrasena = !mostrarContrasena"
                  variant="outlined"
                  :error="!!errorContrasena"
                />
                <v-text-field
                  v-model="confirmarContrasena"
                  label="Confirmar contraseña"
                  :type="mostrarContrasena ? 'text' : 'password'"
                  variant="outlined"
                  :error-messages="errorConfirmar"
                />
                <p :class="errorContrasena ? 'text-red text-caption mb-3' : 'text-black text-caption mb-3'">
                  La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial.
                </p>
                <v-alert v-if="mensajeExito" type="success" class="mt-2 mb-4">{{ mensajeExito }}</v-alert>
                <v-btn color="primary" variant="flat" :loading="guardandoContrasena" @click="cambiarContrasena">
                  Guardar contraseña
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" fixed temporary>
      <v-card class="mx-auto" max-width="300" tile>
        <v-list nav>
          <v-list-item v-if="this.$store.state.user.rol !== 'lumira'" :to="{ name: 'ListarEquipos' }" exact><!-- uando doy clic en incicio me envía a Segura -->
            <v-list-item prepend-icon="mdi-home" title="Inicio" />



          </v-list-item>

          <v-list-item v-if="this.$store.state.user.rol !== 'lumira'" :to="{ name: 'ListarClientes' }">
            <v-list-item prepend-icon="mdi-account-box-multiple" title="Clientes" />

          </v-list-item>
          <v-list-group v-if="this.$store.state.user.rol !== 'lumira'">
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

          <v-list-group v-if="this.$store.state.user.rol === 'administrador'" prepend-icon="mdi-security" no-action>
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" prepend-icon="mdi-badge-account-outline" title="Usuarios" />
            </template>

            <v-list-item :to="{ name: 'AdministracionUsuarios' }">
              <v-list-item-subtitle>
                <v-list-item-title> Usuarios </v-list-item-title>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list-group>
        </v-list></v-card>
    </v-navigation-drawer>

    <v-main class="margen">
      <router-view v-if="ready" />
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
      ready: false,
      dialogoUsuario: false,
      nuevaContrasena: "",
      confirmarContrasena: "",
      mostrarContrasena: false,
      guardandoContrasena: false,
      errorContrasena: "",
      errorConfirmar: "",
      mensajeExito: "",
    };
  },
  async beforeCreate() {
    await this.$store.dispatch("autoLogin");
    if (this.$store.state.existe === 0) {
      this.$router.push({ name: "Login" });
    } else {
      this.ready = true;
    }
  },
  methods: {
    salir() {
      this.$store.dispatch("salir");
    },
    cerrarDialogoUsuario() {
      this.dialogoUsuario = false;
      this.nuevaContrasena = "";
      this.confirmarContrasena = "";
      this.errorContrasena = "";
      this.errorConfirmar = "";
      this.mensajeExito = "";
    },
    async cambiarContrasena() {
      this.errorContrasena = "";
      this.errorConfirmar = "";
      this.mensajeExito = "";

      const regexContrasena = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{6,}$/;
      if (!this.nuevaContrasena || !regexContrasena.test(this.nuevaContrasena)) {
        this.errorContrasena = "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial.";
        return;
      }
      if (this.nuevaContrasena !== this.confirmarContrasena) {
        this.errorConfirmar = "Las contraseñas no coinciden";
        return;
      }

      this.guardandoContrasena = true;
      try {
        await this.$axios.patch(
          `${this.$store.state.ruta}api/usuario/cambiarcontrasena`,
          { newPassword: this.nuevaContrasena },
          { headers: { token: this.$store.state.token } }
        );
        this.mensajeExito = "Contraseña actualizada correctamente";
        this.nuevaContrasena = "";
        this.confirmarContrasena = "";
      } catch (err) {
        this.errorContrasena = err.response?.data?.message || "Error al actualizar la contraseña";
      } finally {
        this.guardandoContrasena = false;
      }
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