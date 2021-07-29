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
      <q-tab-panels
        v-model="tab"
        animated
        vertical
        transition-prev="jump-up"
        transition-next="jump-up"
      >
        <q-tab-panel :name="0"> <MainMess :id="id" /> </q-tab-panel>
        <q-tab-panel :name="1"> <History :id="id" /> </q-tab-panel>
        <q-tab-panel :name="3"> <Comment :id="id" /> </q-tab-panel>
      </q-tab-panels>

      <q-card-actions> </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import MainMess from "components/ScriptDesciprt/MainMess.vue";
import History from "components/ScriptDesciprt/History.vue";
import Comment from "components/ScriptDesciprt/Comment.vue";
export default {
  components: {
    History,
    MainMess,
    Comment
  },
  data() {
    return {
      id: null,
      tab: 0
    };
  },
  methods: {},
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
