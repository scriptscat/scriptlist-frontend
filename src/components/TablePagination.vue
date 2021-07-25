<template>
  <div class="flex">
    <div class="show-pag">
      <q-pagination
        v-model="currentpage"
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
        @keyup.enter.native="refreshTableData(tolink(toPage))"
      ></q-input>
      <span> 页</span>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      page: 0,
      toPage: "", // 跳转至
    };
  },
  created() {},
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
    tolink: {
      type: Function,
    },
  },
  methods: {
    refreshTableData(link) {
      window.open(link, "_self");
    },
  },
};
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
