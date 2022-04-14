<template>
  <div>
    <q-chip
      v-for="category in script.category"
      :key="category.id"
      size="sm"
      outline
      color="green"
      text-color="white"
    >
      {{ category.name }}
      <q-tooltip> 脚本标签:{{ category.name }} </q-tooltip>
    </q-chip>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { formatDate } from '@App/utils/utils';

export default defineComponent({
  name: 'ScriptCategory',
  props: {
    script: {
      type: Object,
    },
  },
  data() {
    return {
      dateformat: formatDate,
    };
  },
});
</script>
