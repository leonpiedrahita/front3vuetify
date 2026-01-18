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
            Todos los derechos reservados 2025.
            <span class="separator"></span>
            V.1.3.5
          </div>
        </v-row>
      </v-col>
      <v-dialog transition="dialog-bottom-transition" max-width="600" persistent v-model="confirmacionlogin">
        <v-card>
          <v-toolbar class="text-h4" color="primary" dark>¡Bienvenid@!</v-toolbar>
          <v-card-text>
            <div class="text-h5 pa-3">
              {{ this.nombre }}
            </div>
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn class="c6" @click="LoginAceptado">Aceptar</v-btn>
          </v-card-actions>
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
            <v-btn class="error" @click="errorlogin = false">Aceptar</v-btn>
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
      confirmacionlogin: false,
      errorlogin: false,
      nombre: "",
      login: {
        email: "",
        password: "",
      },
    };
  },
  beforeCreate() {
    this.$store.dispatch("autoLogin")
    if (this.$store.state.existe === 1) {
      if (this.$store.state.user.rol==="lumira") {
        this.$router.push({ name: 'ListarOrdenes' })
      }
      else{this.$router.push({ name: 'ListarEquipos' })}

      
    }


  },
  methods: {
    async loginUser() {


      axios
        .post(this.$store.state.ruta + "api/usuario/ingresar", this.login)
        .then((response) => {
          return response.data;
        })
        .then((data) => {
          this.$store.dispatch("guardarToken", data.tokenReturn);//se guarda el token en la tienda
          this.nombre = this.$store.state.user.nombre,
            this.confirmacionlogin = true
/*             console.log(data);
 */          })
        .catch((error) => {
          this.errorlogin = true;
          console.log(error);
          return error;
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

.separator {
  display: inline-block;
  width: 12px;
  /* ajusta según tu preferencia */
}
</style>