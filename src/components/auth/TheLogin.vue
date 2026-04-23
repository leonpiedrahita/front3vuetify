<template>
  <div class="fondo-logo"><v-layout>


      <v-col>
        <v-row align="center" style="height: 90vh">
          <v-col cols="12" md="10" lg="7" class="mx-auto">
            <v-card class="pa-10" color="transparent">
              <v-img src="/src/imagenes/logo/GoMaint.png" max-width="550" class="mx-auto mb-1"></v-img>
              <v-card-title title align="center"> Acceder a su cuenta </v-card-title>
              <v-form ref="form" lazy-validation @submit.prevent="loginUser">
                <v-text-field v-model="login.email" label="E-mail" required></v-text-field>
                <v-text-field v-model="login.password" label="Contraseña" type="password" required></v-text-field>

                <v-btn :disabled="!(login.email && login.password)" color="primary" class="mr-4" block type="submit">
                  Ingresar
                </v-btn>
              </v-form>
            </v-card>
          </v-col>
        </v-row>
        <v-row justify="center" class="mt-10">
          <div class="by-leolab">
            <v-icon right size="18">mdi-copyright</v-icon>
            LeoLab
            <v-icon left size="18">mdi-paw</v-icon>
            <span class="separator"></span>
            Todos los derechos reservados 2026.
            <span class="separator"></span>
            V.2.1.3
          </div>
        </v-row>
      </v-col>

      <!-- Dialog Novedades -->
      <v-dialog v-model="dialogNovedades" max-width="580" persistent scrollable>
        <v-card>
          <v-toolbar flat style="background-color: #52B69A; color: white;">
            <v-icon class="ml-3 mr-2">mdi-new-box</v-icon>
            <v-toolbar-title class="font-weight-bold">Novedades — V.2.1.3</v-toolbar-title>
          </v-toolbar>
          <v-card-text class="pt-4 pb-2" style="max-height: 70vh; overflow-y: auto;">
            <v-list density="compact">

              <v-list-subheader class="font-weight-bold text-teal">Nuevas funcionalidades</v-list-subheader>

              <v-list-item prepend-icon="mdi-whatsapp">
                <div class="novedad-titulo">Administración de permisos de notificaciones WhatsApp</div>
                <div class="novedad-desc">Panel con tabs para configurar notificaciones por rol: nuevo ingreso y cada etapa del flujo de forma independiente.</div>
              </v-list-item>

              <v-list-item prepend-icon="mdi-calendar-clock">
                <div class="novedad-titulo">Calendario de preventivos mejorado</div>
                <div class="novedad-desc">Filtro por cliente con búsqueda parcial y header unificado con el resto del sistema.</div>
              </v-list-item>

              <v-list-subheader class="font-weight-bold text-teal mt-2">Mejoras</v-list-subheader>

              <v-list-item prepend-icon="mdi-calendar-end">
                <div class="novedad-titulo">Fecha de finalización automática en órdenes</div>
                <div class="novedad-desc">Al seleccionar la fecha de inicio por primera vez, la fecha de finalización se completa automáticamente con el mismo valor.</div>
              </v-list-item>

              <v-list-item prepend-icon="mdi-amplifier">
                <div class="novedad-titulo">Referencias de equipo</div>
                <div class="novedad-desc">Corrección al crear nueva referencia y redirección automática al guardar o actualizar.</div>
              </v-list-item>

              <v-list-item prepend-icon="mdi-tag-outline">
                <div class="novedad-titulo">Estado "Disponible Pdte. MP."</div>
                <div class="novedad-desc">El estado "Disp. Pdte. MP." fue renombrado a "Disponible Pdte. MP." en todo el sistema.</div>
              </v-list-item>

              <v-list-subheader class="font-weight-bold text-teal mt-2">Correcciones</v-list-subheader>

              <v-list-item prepend-icon="mdi-alert-circle-outline">
                <div class="novedad-titulo">Error al guardar una orden</div>
                <div class="novedad-desc">Si el servidor falla al guardar, ahora se muestra un mensaje de error claro y el formulario conserva la información para reintentar.</div>
              </v-list-item>

            </v-list>
          </v-card-text>
          <v-card-actions class="pa-4 pt-0 justify-end">
            <v-btn color="#52B69A" variant="flat" style="color:white;" @click="dialogNovedades = false">
              Entendido
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog transition="dialog-bottom-transition" max-width="600" persistent v-model="confirmacionlogin">
  <v-card>
    <v-toolbar class="text-h4" color="primary" dark>¡Bienvenid@!</v-toolbar>
    <v-card-text>
      <div class="text-h5 pa-3">
        {{ this.nombre }}
      </div>
    </v-card-text>
  </v-card>
</v-dialog>
      <v-dialog transition="dialog-bottom-transition" max-width="600" persistent v-model="errorlogin">
        <v-card>
          <v-toolbar class="text-h4" color="error" dark>¡Oops! Algo salió mal</v-toolbar>
          <v-card-text>
            <div class="text-h5 pa-4">
              Email y/o Contraseña inválidos
            </div>
          </v-card-text>
          <v-card-actions class="pa-3 justify-center">
            <v-btn color="success" @click="errorlogin = false">Aceptar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>

  </div>
</template>
<script>

import axios from "axios";

export default {
  name: 'TheLogin',
  data() {

    return {
      dialogNovedades: false,
      confirmacionlogin: false,
      errorlogin: false,
      nombre: "",
      login: {
        email: "",
        password: "",
      },
    };
  },
  async beforeCreate() {
    await this.$store.dispatch("autoLogin");
    if (this.$store.state.existe === 1) {
      if (this.$store.state.user.rol === "lumira") {
        this.$router.push({ name: 'ListarOrdenes' });
      } else {
        this.$router.push({ name: 'ListarEquipos' });
      }
    }
  },
  mounted() {
    this.clearCookies();
    // this.dialogNovedades = true;
  },
  methods: {
    clearCookies() {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        // Importante: Borrar con el path de la app
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }
      console.log("Cookies de sesión previa limpiadas.");
    },
   async loginUser() {
  axios
    .post(this.$store.state.ruta + "api/usuario/ingresar", this.login)
    .then((response) => {
      return response.data;
    })
    .then((data) => {
      this.$store.dispatch("guardarToken", { accessToken: data.tokenReturn, refreshToken: data.refreshToken });
      this.nombre = this.$store.state.user.nombre;
      this.confirmacionlogin = true;

      // --- NUEVA LÓGICA AUTOMÁTICA ---
      setTimeout(() => {
        this.LoginAceptado();
      }, 2000); // 3000 milisegundos = 3 segundos
    })
    .catch((error) => {
      this.errorlogin = true;
      console.log(error);
    });
},
    LoginAceptado() {
      this.confirmacionlogin = false
      this.$router.push({ name: 'ListarEquipos' });


    }
  },
};
</script>
<style scoped>
.fondo-logo {
  min-height: 100vh;
  background-image: url('/engrane medio sin fondo.png');
  background-repeat: no-repeat;
  background-color: #f5f5f5;
  /* gris claro */
  background-size: contain;
  /* o 'cover' si quieres que rellene todo el espacio */
  background-attachment: fixed;

}

.by-leolab {
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.novedad-titulo {
  font-size: 0.9rem;
  font-weight: 500;
  color: #1a1a1a;
  line-height: 1.4;
}
.novedad-desc {
  font-size: 0.82rem;
  color: #666;
  line-height: 1.5;
  white-space: normal;
  margin-top: 2px;
}

.separator {
  display: inline-block;
  width: 12px;
  /* ajusta según tu preferencia */
}
</style>