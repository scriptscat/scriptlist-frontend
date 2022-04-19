<template>
  <div class="main flex flex-center" v-if="script">
    <h4 style="display: block; width: 100%; max-width: 1300px">
      <q-banner
        v-if="script.archive"
        dense
        rounded
        class="bg-orange text-white"
        style="width: 100%; margin-bottom: 10px"
      >
        此脚本已归档，作者不再进行维护
      </q-banner>
      <a
        :href="'/script-show-page/' + script.id"
        style="text-decoration: none; color: #000"
        >{{ script.name }}</a
      >
    </h4>
    <q-card
      bordered
      flat
      style="margin: 10px 0px 10px 0px; width: 100%; max-width: 1300px"
    >
      <q-tabs align="left">
        <div v-for="(item, index) in tabList" :key="index">
          <q-route-tab
            v-if="isuserisauthor != false || index < 5"
            :to="{ name: item.name, params: $route.params }"
            flat
            outline
          >
            <div class="text-weight-medium" style="font-size: 16px">
              {{ item.label }}
            </div>
          </q-route-tab>
        </div>
      </q-tabs>
    </q-card>
    <q-card flat bordered style="width: 100%; max-width: 1300px">
      <router-view />
    </q-card>
  </div>
  <div v-else>
    <h4>{{ errMsg }}</h4>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { Cookies, useMeta } from 'quasar';
import { useStore } from 'src/store';
import { useRoute } from 'vue-router';

export default defineComponent({
  components: {},
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
    const store = useStore();
    const script = store.state.scripts.script;
    if (!script) {
      return {
        script: undefined,
        errMsg: store.state.scripts.errMsg,
      };
    }
    const tab = 0;
    const router = useRoute();
    const id = router.params.id;
    const author = store.state.scripts.script || <DTO.Script>{};
    const isuserisauthor = author.is_manager || false;
    const tabList = ref([
      {
        name: 'index',
        label: '详情',
      },
      {
        name: 'code',
        label: '代码',
      },
      {
        name: 'issue',
        label: '反馈',
      },
      {
        name: 'comment',
        label: '评分',
      },
      {
        name: 'version',
        label: '版本列表',
      },
      {
        name: 'update',
        label: '更新脚本',
      },
      {
        name: 'statistic',
        label: '安装统计',
      },
      {
        name: 'manage',
        label: '脚本管理',
      },
    ]);
    useMeta({
      title: '-',
      titleTemplate: (title) => {
        if (title && title != '-') {
          return `${script.name} - ${title}`;
        }
        return script.name;
      },
      meta: {
        description: { name: 'description', content: script.description },
      },
    });
    return {
      script,
      tabList,
      expanded: ref(true),
      tab,
      id,
      author,
      isuserisauthor,
    };
  },
});
</script>

<style lang="scss" scoped>
.main {
  margin: 10px 0px 0px 10px;
  margin-bottom: 10px;
}

.GNL__drawer-item {
  line-height: 24px;
  border-radius: 0 24px 24px 0;
  margin-right: 12px;
}
.GNL__drawer-item .q-item__section--avatar .q-icon {
  color: #5f6368;
}
.GNL__drawer-item .q-item__label {
  color: #3c4043;
  letter-spacing: 0.01785714em;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
}
</style>
