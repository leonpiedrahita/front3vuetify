<template>
    <div id="app">
      <v-card>
        <v-card-title>
          <span class="headline">Firma Cliente</span>
        </v-card-title>
  
        <div class="container align-center">
          <div class="col-12 justify-center">
            <VueSignaturePad
              id="signature"
              width="350px"
              height="200px"
              ref="signaturePad"
              :options="options"
            />
          </div>
  
          <v-card-actions>
            <v-spacer></v-spacer>
  
            <v-btn class="blue darken-1" @click="undo"> Deshacer </v-btn>
            <v-spacer></v-spacer>
  
            <v-btn class="blue darken-1" @click="save"> Guardar </v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </div>
      </v-card>
    </div>
  </template>
  
  <script>
  export default {
    name: "FirmaComponent",
    data: () => ({
      options: {
        penColor: "black",
      },
    }),
  
    methods: {
      undo() {
        this.$refs.signaturePad.undoSignature();
      },
      save() {
        const { isEmpty, data } =
          this.$refs.signaturePad.saveSignature("image/png");
        console.log(isEmpty);
        console.log(data);
      },
    },
  };
  </script>
  
  <style>
  .lafirma {
    height: 200px;
    width: 350px;
  }
  #signature {
    border: double 3px transparent;
    border-radius: 5px;
    background-image: linear-gradient(white, white),
      radial-gradient(circle at top left, #000000, #000000);
    background-origin: border-box;
    background-clip: content-box, border-box;
  }
  </style>