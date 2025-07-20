<template>
  <div id="app" class="d-flex justify-center align-center" style="min-height: 100vh;">
    <v-card>
      <v-card-title class="justify-center">
        <span class="headline">Firma</span>
      </v-card-title>

      <v-card-text class="d-flex flex-column align-center">
        <VueSignaturePad
          id="signature"
          width="350px"
          height="200px"
          ref="signaturePad"
          :options="options"
        />
      </v-card-text>

      <v-card-actions class="justify-center">
        <v-btn color="blue darken-1" class="mx-2" @click="undo">Deshacer</v-btn>
        <v-btn color="blue darken-1" class="mx-2" @click="save">Guardar</v-btn>
      </v-card-actions>
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