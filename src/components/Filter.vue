<template>
  <q-card flat class="single flex justify-end">
    <q-select
      outlined
      v-model="category"
      :options="categoryOptions"
      borderless
      dense
      options-dense
      label="排序方式"
      style="min-width: 120px"
      class="no-shadow"
    >
    </q-select>
    <q-select
      disable
      outlined
      v-model="category"
      :options="categoryOptions"
      borderless
      dense
      options-dense
      label="分类"
      style="min-width: 120px; margin-left: 10px"
    >
    </q-select>
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
      categoryOptions: ['相关度', '安装量', '评分', '最新'],
    };
  },
  data() {
    return {
      category: [],
    };
  },
});
</script>
