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
      type: String,
      require: true,
      default: '0',
    },
  },
  setup(props: { sort: string; category: string; }) {
    const sort_ = ref({ label: '', value: '' });
    const sortOptions = [
      { label: '日安装', value: 'today_download' },
      { label: '总安装', value: 'total_download' },
      { label: '评分', value: 'score' },
      { label: '最新发布', value: 'createtime' },
      { label: '最近更新', value: 'updatetime' },
    ];
    for (let i = 0; i < sortOptions.length; i++) {
      if (sortOptions[i].value == props.sort) {
        sort_.value = sortOptions[i];
        break;
      }
    }

  const category_ = ref({ label: '', value: '' });
  const categoryOptions = [
    { label: '全部脚本', value: '0' },
    { label: '定时脚本', value: '1' },
    { label: '后台脚本', value: '2' }
  ];
  for (let i = 0; i < categoryOptions.length; i++) {
    if (categoryOptions[i].value == props.category) {
      category_.value = categoryOptions[i];
      break;
    }
  }

    return {
      //today_download 日安装 total_download 总安装 createtime 最新发布 score 评分 updatetime 最新更新
      sortOptions: sortOptions,
      categoryOptions: categoryOptions,
      sort_: sort_,
      category_:category_,
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
