<template>
  <span v-if="state === 1">
    <q-icon name="lens" color="deep-orange" class="q-mx-sm" />
    <q-chip
      square
      outline
      color="deep-orange"
      class="bg-deep-orange-1 no-border-radius"
      size="sm"
    >
      待处理
    </q-chip>
  </span>
  <span v-else-if="state === 3">
    <q-icon name="radio_button_checked" color="positive" class="q-mx-sm" />
    <q-chip
      square
      outline
      color="positive"
      class="bg-positive-1 no-border-radius"
      size="sm"
    >
      完成
    </q-chip>
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Fliter',
  props: {
    state: {
      type: Number,
      required: false,
      default() {
        return 1;
      },
    },
  },
});
</script>
