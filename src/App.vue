<template>
  <router-view />
  <v-snackbar
    v-model="snackbarSesion.visible"
    color="error"
    location="top"
    :timeout="2500"
  >
    {{ snackbarSesion.texto }}
  </v-snackbar>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
const store = useStore();
const snackbarSesion = computed(() => store.state.snackbarSesion);
</script>
