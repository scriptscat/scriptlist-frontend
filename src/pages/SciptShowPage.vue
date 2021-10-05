<template>
  <div class="page-padding padding-normal">
    <q-card style="margin: 30px 0px">
      <q-tabs
        v-model="tab"
        inline-label
        outside-arrows
        mobile-arrows
        dense
        align="left"
        class="text-primary"
      >
        <q-route-tab
          :to="{ name: 'showPage', params: $route.params }"
          :name="0"
          label="脚本"
        />
        <q-route-tab
          :to="{ name: 'showCode', params: $route.params }"
          :name="1"
          label="代码"
        />
        <q-route-tab
          :to="{ name: 'showHistory', params: $route.params }"
          :name="2"
          label="历史"
        />
        <q-route-tab
          :to="{ name: 'showComment', params: $route.params }"
          :name="3"
          label="评论"
        />
        <q-tab :name="4" label="统计" />
                <q-route-tab
          :to="{ name: 'updateScript', query: {id} }"
          :name="5"
          v-if="isuserisauthor"
          label="更新脚本"
        />
                <q-route-tab
          :to="{ name: 'deleteScript',query: {id} }"
          :name="6"
          v-if="isuserisauthor"
          label="删除脚本"
        />
                        <q-route-tab
          :to="{ name: 'manageScript', query: {id} }"
          :name="7"
          v-if="isuserisauthor"
          label="管理"
        />
      </q-tabs>

      <div style="padding: 8px">
        <router-view />
      </div>

      <q-card-actions> </q-card-actions>
    </q-card>
  </div>
</template>

<script>
export default {
  computed:{
        isuserisauthor(){
          debugger;
      return this.$store.state.scripts.script.uid===this.$store.state.user.user.uid
    }
  },
  data() {
    return {
      id: null,
      tab: 0,
    };
  },
  methods: {},
  created() {
    this.id = parseInt(this.$route.params.id);

    if (!this.id) {
      this.$q.notify({
        position: "top-right",
        message: "访问路径存在问题",
        position: "top",
      });
      this.$router.push({ path: "/" });
      return;
    }
  },
};
</script>

<style></style>
