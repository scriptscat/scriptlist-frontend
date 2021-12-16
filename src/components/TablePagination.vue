<template>
  <div class="flex">
    <div class="show-pag">
      <q-pagination
        v-model="current"
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
        v-on:keyup.enter="refreshTableData(toPage)"
      ></q-input>
      <span> 页</span>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, WatchStopHandle } from 'vue';
import { useRoute, RouteLocationNormalizedLoaded } from 'vue-router';
export default defineComponent({
  setup() {
    let currentPage = parseInt(<string>useRoute().query.page) || 1;
    return {
      toPage: ref(currentPage.toString()), // 跳转至
      current: ref(currentPage),
      afterQuery: '',
    };
  },
  props: {
    maxpage: {
      type: Number,
    },
    maxlens: {
      type: Number,
    },
    reloadPage: {
      type: Function,
    },
  },
  unmounted() {
    this.watch();
  },
  data() {
    return {
      watch: <WatchStopHandle>{},
    };
  },
  created() {
    const old = this.$route.path;
    this.watch = this.$watch('$route.query', () => {
      if (old != this.$route.path) {
        return;
      }
      this.reload(this.$route);
      this.reloadPage && this.reloadPage(this.$route);
    });
  },
  methods: {
    refreshTableData() {
      this.current = parseInt(this.toPage);
      void this.$router.replace({
        query: { page: this.toPage },
      });
    },
    reload(currentRoute: RouteLocationNormalizedLoaded) {
      this.current = parseInt(<string>currentRoute.query.page) || 1;
      this.toPage = <string>currentRoute.query.page;
      let query = '';
      for (const key in currentRoute.query) {
        if (key == 'page') {
          continue;
        }
        query +=
          '&' + key + '=' + encodeURIComponent(<string>currentRoute.query[key]);
      }
      this.afterQuery = query;
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