<template>
  <div class="page-padding padding-normal">
    <q-card style="margin:30px 0px">

        <q-tabs
          v-model="tab"
          inline-label
          outside-arrows
          mobile-arrows
          dense
          align="left"
          class="text-primary"
        >
          <q-tab :name="0" label="脚本" />

          <q-tab :name="1" label="代码" />
          <q-tab :name="2" label="历史" />
          <q-tab :name="3" label="评论" />
          <q-tab :name="4" label="统计" />
        </q-tabs>

      <q-card-actions> </q-card-actions>
    </q-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      id: null,
      tab: 0
    };
  },
  created() {
    this.id = parseInt(this.$route.query.id);
    if (!this.id) {
      this.$q.notify({
        position: "top-right",
        message: "访问路径存在问题",
        position: "top"
      });
      this.$router.push({ path: "/" });
      return;
    }
  }
};
</script>

<style></style>
