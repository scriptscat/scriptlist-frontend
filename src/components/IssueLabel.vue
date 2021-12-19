<template>
  <span v-for="(item, index) in labels" v-bind:key="index">
    <q-chip
      v-if="item === 'bug'"
      square
      outline
      color="red"
      class="bg-red-1 no-border-radius"
      size="sm"
    >
      BUG
    </q-chip>
    <q-chip
      v-else-if="item === 'feature'"
      square
      outline
      color="primary"
      class="bg-blue-1 no-border-radius"
      size="sm"
    >
      新功能
    </q-chip>
    <q-chip
      v-else-if="item === 'question'"
      square
      outline
      color="warning"
      class="bg-orange-1 no-border-radius"
      size="sm"
    >
      问题
    </q-chip>
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Fliter',
  props: {
    labels: {
      type: Array,
      required: false,
      default() {
        return [];
      },
    },
  },
});
</script>
