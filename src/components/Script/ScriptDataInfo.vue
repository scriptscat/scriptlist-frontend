<template>
  <q-item class="block text-left">
    <q-item-label class="row" style="width: 600px" caption>
      <span class="col">今日安装</span>
      <span class="col">总安装量</span>
      <span class="col">创建日期</span>
      <span class="col">最近更新</span>
      <span class="col">评分</span>
    </q-item-label>
    <q-item-label
      class="row text-caption text-black"
      style="font-weight: bold; width: 600px"
    >
      <span class="col"
        ><q-icon name="today" /> {{ script.today_install }}</span
      >
      <span class="col"
        ><q-icon name="download" />{{ script.total_install }}</span
      >
      <span class="col"
        ><q-icon name="event" />{{ dateformat(script.createtime * 1000) }}</span
      >
      <span v-if="script.updatetime !== 0" class="col"
        ><q-icon name="edit_calendar" />{{
          dateformat(script.updatetime * 1000)
        }}</span
      >
      <span v-else class="col"
        ><q-icon name="edit_calendar" />{{
          dateformat(script.createtime * 1000)
        }}</span
      >
      <span v-if="script.score != 0" class="col"
        ><q-icon name="star" />{{
          ((script.score * 2) / 10).toFixed(1)
        }}
        分</span
      >
      <span v-else class="col">暂无评分</span>
    </q-item-label>
  </q-item>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { formatDate } from '@App/utils/utils';

export default defineComponent({
  name: 'ScriptDataInfo',
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
