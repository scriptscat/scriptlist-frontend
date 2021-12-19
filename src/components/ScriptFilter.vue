<template>
  <q-card flat class="single flex justify-end">
    <q-select
      outlined
      v-model="sort_"
      :options="sortOptions"
      @update:model-value="sortChange"
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
      v-model="category_"
      :options="categoryOptions"
      @update:model-value="categoryChange"
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
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'Fliter',
  props: {
    sort: {
      type: String,
      require: true,
      default: 'today_download',
    },
    category: {
      type: Array,
      required: false,
      default() {
        return ['建设中'];
      },
    },
  },
  setup(props: { sort: string; category: unknown[] }) {
    const sort_ = ref({ label: '', value: '' });
    const options = [
      { label: '日安装', value: 'today_download' },
      { label: '总安装', value: 'total_download' },
      { label: '评分', value: 'score' },
      { label: '最新发布', value: 'createtime' },
      { label: '最近更新', value: 'updatetime' },
    ];
    for (let i = 0; i < options.length; i++) {
      if (options[i].value == props.sort) {
        sort_.value = options[i];
        break;
      }
    }

    return {
      //today_download 日安装 total_download 总安装 createtime 最新发布 score 评分 updatetime 最新更新
      sortOptions: options,
      categoryOptions: ['建设中'],
      sort_: sort_,
      category_: ref(props.category),
    };
  },
  methods: {
    sortChange(val: string) {
      this.$emit('sortChange', val);
    },
    categoryChange(val: string) {
      this.$emit('categoryChange', val);
    },
  },
});
</script>
