<template>
  <q-card-section>
    <q-card
      flat
      v-for="(item, index) in version"
      :key="index"
      class="version-item"
    >
      <q-card-section>
        <div class="text-h5">
          v{{ item.version }}
          <q-chip
            v-if="index == 0"
            outline
            color="green"
            text-color="green"
            size="sm"
          >
            最新
          </q-chip>
          <span class="text-caption" style="float: right">{{
            dateformat(item.createtime * 1000)
          }}</span>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div v-if="!item.changelog">作者偷懒没有写更新日志</div>
        <div v-else>
          <MarkdownView :id="item.version" :content="item.changelog" />
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn-group flat>
          <q-btn
            class="text-caption"
            type="a"
            :href="
              '/scripts/code/' +
              id +
              '/' +
              encodeURIComponent(script.name) +
              '.user.js?version=' +
              item.version
            "
            color="primary"
            label="安装此版本"
          />
          <q-btn
            outline
            class="text-caption"
            type="a"
            target="_blank"
            href="https://bbs.tampermonkey.net.cn/thread-57-1-1.html"
            color="primary"
            label="如何安装?"
          />
        </q-btn-group>
      </q-card-actions>
    </q-card>
  </q-card-section>
</template>

<script lang="ts">
import { Cookies, useMeta } from 'quasar';
import { defineComponent } from 'vue';
import { RouteLocationNormalizedLoaded } from 'vue-router';
import MarkdownView from '@Components/MarkdownView.vue';
import { formatDate } from '@App/utils/utils';

export default defineComponent({
  components: { MarkdownView },
  preFetch({ store, currentRoute, ssrContext }) {
    if (!ssrContext) {
      return;
    }
    const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies;
    return store.dispatch('scripts/fetchVersionList', {
      id: currentRoute.params.id,
      page: parseInt(<string>currentRoute.query.page || '1'),
      count: 20,
      cookies: cookies,
    });
  },
  setup() {
    useMeta({ title: '版本列表' });
  },
  computed: {
    id() {
      return parseInt(<string>this.$route.params.id);
    },
    script() {
      return this.$store.state.scripts.script;
    },
    version() {
      return this.$store.state.scripts.version;
    },
    total() {
      return this.$store.state.scripts.total;
    },
  },
  unmounted() {
    void this.$store.commit('scripts/resetPreFetch');
  },
  mounted() {
    if (!this.$store.state.scripts.preFetch) {
      void this.reload(this.$route);
    }
    // else {
    //   this.version = this.$store.state.scripts.version;
    // }
  },
  methods: {
    async reload(currentRoute: RouteLocationNormalizedLoaded) {
      await this.$store.dispatch('scripts/fetchVersionList', {
        id: currentRoute.params.id,
        page: parseInt(<string>currentRoute.query.page || '1'),
        count: 20,
      });
      console.log(this.$store.state.scripts.preFetch);
    },
  },
  data() {
    return {
      dateformat: formatDate,
    };
  },
});
</script>

<style scoped>
.version-item:not(:first-child) {
  margin-top: 30px;
}
</style>
