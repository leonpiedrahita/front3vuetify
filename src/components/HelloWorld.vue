<template>
  <v-container>
    <v-treeview density="compact" :items="items" />
  </v-container>
</template>

<script setup>
  import { ref } from 'vue'

  const items = ref([
    {
      value: 1,
      title: 'Applications :',
      locked: true,
      children: [
        { value: 2, title: 'Calendar : app', locked: false },
        { value: 3, title: 'Chrome : app', locked: false },
        { value: 4, title: 'Webstorm : app', locked: true },
      ],
    },
    {
      value: 5,
      title: 'Documents :',
      locked: false,
      children: [
        {
          value: 6,
          title: 'vuetify :',
          locked: false,
          children: [
            {
              value: 7,
              title: 'src :',
              locked: true,
              children: [
                { value: 8, title: 'index : ts', locked: false },
                { value: 9, title: 'bootstrap : ts', locked: false },
              ],
            },
          ],
        },
        {
          value: 10,
          title: 'material2 :',
          locked: false,
          children: [
            {
              value: 11,
              title: 'src :',
              locked: false,
              children: [
                { value: 12, title: 'v-btn : ts' },
                { value: 13, title: 'v-card : ts' },
                { value: 14, title: 'v-window : ts' },
              ],
            },
          ],
        },
      ],
    },
    {
      value: 15,
      title: 'Downloads :',
      children: [
        { value: 16, title: 'October : pdf' },
        { value: 17, title: 'November : pdf' },
        { value: 18, title: 'Tutorial : html' },
      ],
    },
    {
      value: 19,
      title: 'Videos :',
      children: [
        {
          value: 20,
          title: 'Tutorials :',
          children: [
            { value: 21, title: 'Basic layouts : mp4' },
            { value: 22, title: 'Advanced techniques : mp4' },
            { value: 23, title: 'All about app : dir' },
          ],
        },
        { value: 24, title: 'Intro : mov' },
        { value: 25, title: 'Conference introduction : avi' },
      ],
    },
    {
      value: 26,
      title: 'Another',
    },
  ])
</script>