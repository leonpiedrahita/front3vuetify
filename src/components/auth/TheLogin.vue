<template>
    <v-layout>
      
  
      <v-col>
        <v-row align="center" class="justify-center" style="height: 100vh">
          <v-col cols="12" lg="6" align="center">
            <v-card class="pa-10">
              <v-card-title title class="justify-center">  Acceder a su cuenta </v-card-title>
              <v-form ref="form" lazy-validation>
                <v-text-field
                  v-model="login.email"
                  label="E-mail"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="login.password"
                  label="Contraseña"
                  type="password"
                  required
                ></v-text-field>
  
                <v-btn
                  :disabled="!(this.login.email && this.login.password)"
                  color="primary"
                  class="mr-4"
  
                  block
                  @click="loginUser"
                >
                  Ingresar
                </v-btn>
              </v-form>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
      <v-dialog
          transition="dialog-bottom-transition"
          max-width="600"
          persistent
          v-model="confirmacionlogin"
        >
          <v-card>
            <v-toolbar class="text-h4" color="primary" dark>¡Bienvenid@!</v-toolbar>
            <v-card-text>
              <div class="text-h5 pa-3">
                 {{this.nombre}}
              </div>
            </v-card-text>
            <v-card-actions class="justify-center">
              <v-btn class="c6" @click="LoginAceptado">Aceptar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
            <v-dialog
          transition="dialog-bottom-transition"
          max-width="600"
          persistent
          v-model="errorlogin"
        >
          <v-card>
            <v-toolbar class="text-h4" color="error" dark>¡Oops! Algo salió mal</v-toolbar>
            <v-card-text>
              <div class="text-h5 pa-4">
                 Email y/o Contraseña inválidos
              </div>
            </v-card-text>
            <v-card-actions class="pa-3 justify-center">
              <v-btn class="error" @click="errorlogin=false">Aceptar</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
    </v-layout>
    
    
  </template>
  <script>
  
  import axios from "axios";
  
  export default {
      name:'TheLogin',
    data() {
      
      return {
        confirmacionlogin:false,
        errorlogin:false,
        nombre:"",
        login: {
          email: "",
          password: "",
        },
      };
    },
     beforeCreate() {
       this.$store.dispatch("autoLogin")
       if(this.$store.state.existe === 1){
         this.$router.push({name: 'ListarClientes'})
       }
         
      //this.$store.dispatch("autoLogin")? this.$router.push({name: 'ListarClientes'}) : false;
    },
    methods: {
      async loginUser() {
        
        
        axios
          .post(this.$store.state.ruta +"api/usuario/ingresar", this.login)
          .then((response) => {
            return response.data;
          })
          .then((data) => {          
              this.$store.dispatch("guardarToken",data.tokenReturn );//se guarda el token en la tienda
              this.nombre=this.$store.state.user.nombre ,
                       this.confirmacionlogin=true
            console.log(data);
          })
          .catch((error) => {
            this.errorlogin=true;
            console.log(error);
            return error;
          });
      },
      LoginAceptado(){
        this.confirmacionlogin=false
        this.$router.push({name: 'ListarClientes'});
        
              
      }
    },
  };
  </script>