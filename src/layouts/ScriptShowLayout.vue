<template>
  <div class="page-padding padding-normal">
    <q-card style="margin: 30px auto; max-width: 1100px">
      <q-tabs
        v-model="tab"
        inline-label
        outside-arrows
        mobile-arrows
        dense
        align="left"
        active-color="primary"
        indicator-color="primary"
      >
        <q-route-tab
          :to="{ name: 'index', params: $route.params }"
          :name="0"
          label="脚本"
        />
        <q-route-tab
          :to="{ name: 'issue', params: $route.params }"
          :name="1"
          label="反馈"
        />
        <q-route-tab
          :to="{ name: 'showComment', params: $route.params }"
          :name="2"
          label="评论"
        />
        <q-route-tab
          :to="{ name: 'showCode', params: $route.params }"
          :name="3"
          label="代码"
        />
        <q-route-tab
          :to="{ name: 'showHistory', params: $route.params }"
          :name="4"
          label="历史版本"
        />
        <q-route-tab
          :to="{ name: 'updateScript', params: $route.params }"
          :name="4"
          v-if="isuserisauthor"
          label="更新脚本"
        />
        <!--<q-route-tab
          :to="{ name: 'deleteScript', query: { id } }"
          :name="5"
          v-if="isuserisauthor"
          label="删除脚本"
        />-->
        <q-route-tab
          :to="{ name: 'statistic', params: $route.params }"
          v-if="isuserisauthor"
          :name="6"
          label="统计"
        />
        <q-route-tab
          :to="{ name: 'manageScript', params: $route.params }"
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

<script lang="ts">
import { defineComponent } from 'vue';
import { Cookies, useMeta } from 'quasar';
import { useStore } from 'src/store';
export default defineComponent({
  preFetch({ store, currentRoute, ssrContext }) {
    if (!ssrContext) {
      return;
    }
    const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies;
    return store.dispatch('scripts/fetchScriptInfo', {
      id: currentRoute.params.id,
      cookies: cookies,
    });
  },
  setup() {
    const script = useStore().state.scripts.script;
    useMeta({
      title: 'ScriptCat',
      titleTemplate: (title) => `${script.name} - ${title}`,
      meta: {
        description: { name: 'description', content: script.description },
      },
    });
    return { script };
  },
  computed: {
    isuserisauthor() {
      try {
        return this.$store.state.scripts.is_manager;
      } catch (error) {
        return false;
      }
    },
  },
  data() {
    return {
      id: 0,
      tab: 0,
    };
  },
  created() {
    this.id = parseInt(this.$route.params.id[0]);
    if (!this.id) {
      this.$q.notify({
        position: 'top-right',
        message: '访问路径存在问题',
      });
      void this.$router.push({ path: '/' });
      return;
    }
    if (this.script) {
      this.$store.commit('scripts/SetIsManagerScript', this.script.is_manager);
    } else {
      this.$store.commit('scripts/SetIsManagerScript', false);
    }
  },
});
</script>

<style></style>