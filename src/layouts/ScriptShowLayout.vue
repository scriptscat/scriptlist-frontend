<template>
  <q-drawer
    v-model="leftDrawerOpen"
    show-if-above
    bordered
    :mini="miniState"
    class="bg-white"
    :width="200"
  >
    <q-scroll-area class="fit">
      <q-list padding class="text-grey-8">
        <q-item
          class="GNL__drawer-item"
          v-ripple
          v-for="(item, index) in tabList"
          :key="index"
          clickable
        >
          <!-- <q-item-section avatar>
              <q-icon :name="link.icon"/>
            </q-item-section> -->
          <q-btn
            flat
            :to="{ name: item.name, params: $route.params }"
            icon="add"
            outline
            color="white"
            class="text-black text-body1"
          >
          &nbsp;{{item.label}}
          </q-btn>
        </q-item>
        <q-separator inset class="q-my-sm" />
      </q-list>
    </q-scroll-area>
  </q-drawer>

  <div class="main flex flex-left">
    <q-card
      flat
      bordered
      class="flex flex-left"
      style="width: 100%; max-width: 1100px"
    >
      <div style="padding: 8px">
        <router-view />
      </div>
    </q-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
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
    const tabList = ref([
      {
        name: 'index',
        label: '脚本详情',
      },
      {
        name: 'issue',
        label: '脚本反馈',
      },
      {
        name: 'showComment',
        label: '脚本评论',
      },
      {
        name: 'showCode',
        label: '脚本代码',
      },
      {
        name: 'showHistory',
        label: '历史版本',
      },
      {
        name: 'updateScript',
        label: '更新脚本',
      },
      {
        name: 'statistic',
        label: '安装统计',
      },
      {
        name: 'manageScript',
        label: '脚本管理',
      },
    ]);
    useMeta({
      title: 'ScriptCat',
      titleTemplate: (title) => `${script.name} - ${title}`,
      meta: {
        description: { name: 'description', content: script.description },
      },
    });
    return {
      script,
      tabList,
    };
  },
  computed: {
    id() {
      return this.$route.params.id;
    },
    author() {
      return this.$store.state.scripts.script || <DTO.Script>{};
    },
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
      tab: 0,
    };
  },
  // created() {
  //   this.id = parseInt(this.$route.params.id[0]);
  //   if (!this.id) {
  //     this.$q.notify({
  //       position: 'top-right',
  //       message: '访问路径存在问题',
  //     });
  //     void this.$router.push({ path: '/' });
  //     return;
  //   }
  //   if (this.script) {
  //     this.$store.commit('scripts/SetIsManagerScript', this.script.is_manager);
  //   } else {
  //     this.$store.commit('scripts/SetIsManagerScript', false);
  //   }
  // },
});
</script>

<style lang="scss" scoped>
.main {
  margin: 10px 0px 0px 10px;
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
  letter-spacing: .01785714em;
  font-size: .875rem;
  font-weight: 500;
  line-height: 1.25rem;
}

</style>

