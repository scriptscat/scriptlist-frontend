<template>
  <div class="flex">
    <div class="show-pag">
      <q-pagination
        v-model="currentpage_"
        :max="maxpage"
        :max-pages="maxlens"
        :to-fn="tolink"
        direction-links
      />
    </div>
    <div class="flex justify-center items-center show-input-block">
      <span>跳至</span>
      <q-input
        outlined
        v-model="toPage"
        class="pagination-input"
        v-on:keyword.enter="refreshTableData(tolink(toPage))"
      ></q-input>
      <span> 页</span>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  data() {
    let query = '';
    for (const key in this.$route.query) {
      if (key == 'page') {
        continue;
      }
      query += '&' + key + '=' + encodeURIComponent(<string>this.$route.query[key]);
    }
    return {
      page: 0,
      toPage: '', // 跳转至
      currentpage_: this.currentpage || 1,
      afterQuery: query,
    };
  },
  props: {
    currentpage: {
      type: Number,
    },
    maxpage: {
      type: Number,
    },
    maxlens: {
      type: Number,
    },
  },
  methods: {
    refreshTableData(link: string) {
      window.open(link, '_self');
    },
    tolink(page: number) {
      return (
        this.$route.path + '?' + 'page=' + page.toString() + this.afterQuery
      );
    },
  },
});
</script>
<style lang="scss" scoped>
@media screen and (max-width: 500px) {
  .show-input-block {
    width: 100%;
  }
  .show-pag {
    width: 100%;
    display: flex;
    justify-content: center;
  }
}
</style>