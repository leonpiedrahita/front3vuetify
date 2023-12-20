<template>
  <v-card class="pa-2">

    <p>{{this.clientes}}</p>
  </v-card>
</template>
<script>
 import axios from "axios";
export default {
  name: "ListarClientesComponent",
  data: () => ({
    expanded: [],
    input1: "",
    Editarcliente: false,
    Agregarcliente: false,
    dialogo: false,
    textodialogo: "",
    dialog: false,
    dialog2: false,
    dialogDelete: false,
    search: "",
    cargando: true,
    esperarguardar: false,
    encabezado: [
      {
        text: "Sede",
        value: "nombre",
        align: "center",
        class: "titulo--text font-weight-bold",
        width: "50%",
      },
      {
        text: "Dirección",
        value: "direccion",
        align: "center",
        class: "titulo--text font-weight-bold",
        width: "50%",
      },
      {
        text: "Eliminar sede",
        value: "eliminarsede",
        sortable: false,

        class: "titulo--text font-weight-bold ",
        width: "50%",
      },
    ],
    headers: [
      {
        text: "Nombre/Razón social",
        align: "center",
        value: "nombre",
        class: "titulo--text font-weight-bold",
      },
      {
        text: "NIT",
        value: "nit",
        align: "center",
        class: "titulo--text font-weight-bold",
      },
      {
        text: "Nombre de contacto principal",
        value: "contactoprincipal[0].nombre",
        align: "center",
        class: "titulo--text font-weight-bold",
      },
      {
        text: "Teléfono de contacto principal",
        value: "contactoprincipal[0].telefono",
        align: "center",
        divider: true,
        class: "titulo--text font-weight-bold",
      },
      {
        text: "Editar cliente",
        value: "editarsede",
        sortable: false,
        align: "center",
        class: "titulo--text font-weight-bold",
      },
      {
        text: "Agregar Sede",
        value: "agregarsede",
        sortable: false,
        align: "center",
        class: "titulo--text font-weight-bold",
      },
    ],
  
    editedIndex: -1,
    clientes: [],
    prueba: {},
    editedItem: {
      nit: "",
      nombre: "",
      contactoprincipal: [{}],
    },
    editedItem2: {
      nombre: "",
      direccion: "",
    },
    defaultItem: {
      nit: "",
      nombre: "",
      contactoprincipal: [
        {
          nombre: "",
          telefono: "",
        },
      ],
    },
    defaultItem2: {
      nombre: "",
      direccion: "",
    },
  }),

  computed: {
    titulocliente() {
      return "Editar cliente";
    },
    titulosede() {
      return "Agregar sede";
    },
    
  },

  watch: {
    dialog(val) {
      val || this.cerrareditar();
    },
    dialog2(val) {
      val || this.cerraragregarsede();
    },
    dialogDelete(val) {
      val || this.cerrareliminarsede();
    },
  },
  beforeCreate() {
    this.$store.dispatch("autoLogin");
    if (this.$store.state.existe === 0) {
      this.$router.push({ name: "Login" });
    }
    this.$store.dispatch("guardarUbicacion", {
      ubicacion: "Clientes",
      icono: "mdi-account-box-multiple",
      color: "c6",
    });
  },
  created() {
    if (this.$store.state.existe === 0) {
      this.$router.push({ name: "Login" });
    } else {
      this.listar();
    }
  },

  methods: {
    listar() {
      //va a ir a mi backend y me traerá las peticiones de la base de datos
      axios
        .get(this.$store.state.ruta + "api/cliente/listar", {
          headers: {
            token: this.$store.state.token,
            
          },
          
        })
        .then((response) => {
          this.clientes = response.data; //el this es porque no es propia de la funcion sino de l componente

          this.cargando = false;
          /* this.equipos.contactoprincipal =
            this.equipos.contactoprincipal[this.equipos.contactoprincipal.length - 1]; */
            //console.log(error);
        })
        .catch((error) => {
          console.log(error);
          return error;
        });
    },
    nuevoCliente() {
      this.$store.dispatch("autoLogin");

      if (this.$store.state.existe === 0) {
        this.$router.push({ name: "Login" });
      } else {
        this.Agregarcliente = true;
        this.dialog = true;
      }
    },
    editItem(item) {
     
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
      this.Editarcliente = true;
    },
    editItem2(item) {
     
      this.editedItem = Object.assign({}, item);
      this.dialog2 = true;
    },
    deleteItem(item) {
      
      this.editedItem2 = Object.assign({}, item);
      this.dialogDelete = true;
    },

    cerrareliminarsede() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem2 = Object.assign({}, this.defaultItem2);
        this.editedIndex = -1;
      });
    },
    cerrareditar() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem.contactoprincipal[0].telefono="";
          this.editedItem.contactoprincipal[0].nombre="";
          this.editedItem.nit="";
          this.editedItem.nombre="";
        this.Editarcliente = false;
        this.Agregarcliente = false;

        this.editedIndex = -1;
      });
      this.listar();
    },
    cerraragregarsede() {
      this.dialog2 = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedItem2 = Object.assign({}, this.defaultItem2);
        this.editedIndex = -1;
      });
      this.listar();
    },

    editar() {
      //Editar categoria
      this.Editarcliente = false;
      
      axios
        .patch(
          this.$store.state.ruta +
            "api/cliente/actualizar/" +
            this.editedItem._id,
          {
            nombre: this.editedItem.nombre,
            nit: this.editedItem.nit,
            contactoprincipal: this.editedItem.contactoprincipal,
          },
          {
            headers: {
              token: this.$store.state.token,
            },
          }
        )
        .then((response) => {
          console.log(response);
           this.cerrareditar();
          this.listar();
        })
        .catch((error) => {
          console.log(error);
          return error;
        });

     
    },
    agregarCliente() {
      //Editar categoria
      this.esperarguardar = true;
      const encontrarnit = this.clientes.find(
        (registro) => registro.nit === this.editedItem.nit
      );

      if (encontrarnit) {
        this.textodialogo = "El NIT ya se encuentra registrado";
        this.Agregarcliente = false;
        this.cerrareditar();
        this.dialogo = true;
      } else {
        this.Agregarcliente = false;
        
        axios
          .post(
            this.$store.state.ruta + "api/cliente/registrar/",
            {
              nombre: this.editedItem.nombre,
              nit: this.editedItem.nit,
              contactoprincipal: this.editedItem.contactoprincipal,
            },
            {
              headers: {
                token: this.$store.state.token,
              },
            }
          )
          .then((response) => {
            console.log(response);
            this.cerrareditar();
            this.esperarguardar = false;
            this.listar();
          })
          .catch((error) => {
            console.log(error);
            return error;
          });
      }
    },
    agregarnuevasede() {
      //Editar categoria
      axios
        .patch(
          this.$store.state.ruta +
            "api/cliente/agregarsede/" +
            this.editedItem._id,
          {
            nombre: this.editedItem2.nombre,
            direccion: this.editedItem2.direccion,
          },
          {
            headers: {
              token: this.$store.state.token,
            },
          }
        )
        .then((response) => {
          console.log(response);
          this.listar();
        })
        .catch((error) => {
          console.log(error);
          return error;
        });

      this.cerraragregarsede();
    },
    save3() {
      axios
        .patch(
          this.$store.state.ruta + "api/cliente/eliminarsede/",
          {
            nombre: this.editedItem2.nombre,
            direccion: this.editedItem2.direccion,
            idcliente: this.editedItem2.idcliente,
          },
          {
            headers: {
              token: this.$store.state.token,
            },
          }
        )
        .then((response) => {
          console.log(response);
          this.listar();
        })
        .catch((error) => {
          console.log(error);
          return error;
        });

      this.cerrareliminarsede();
    },
  },
};
</script>
<style scoped>
.centered-input >>> input {
  text-align: center;
}
.aviso {
  text-align: center;
}
.toolbar {
  flex-wrap: wrap;
}
@media (max-width: 767px) {
  .tamano {
    display: none;
  }
}
</style>