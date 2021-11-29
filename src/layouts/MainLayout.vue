<template>
  <q-layout>
    <q-page-container view="hHh lpR fFf" class="bg-grey-1">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'MainLayout',
  setup() {
    return {};
  },
});
</script>