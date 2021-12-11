<template>
  <q-card flat bordered class="single flex justify-end" style="padding: 10px">
    <q-btn size="xs" style="padding: 0 10px; margin-right: 10px">
      <q-select
        v-model="category"
        :options="categoryOptions"
        borderless
        dense
        options-dense
        multiple
        label="排序方式"
        style="min-width: 120px"
      >
      </q-select>
    </q-btn>
    <q-btn size="xs" style="padding: 0 10px">
      <q-select
        v-model="category"
        :options="categoryOptions"
        borderless
        dense
        options-dense
        multiple
        label="分类"
        style="min-width: 80px"
      >
      </q-select>
    </q-btn>
  </q-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Fliter',
  props: {
    // options: {
    //   type: Array,
    //   required: false,
    //   default() {
    //     return ['a', 'b'];
    //   },
    // },
  },
  setup() {
    return {
      categoryOptions: ['全部', 'ab', 'bc'],
    };
  },
  data() {
    return {
      category: [],
    };
  },
});
</script>
