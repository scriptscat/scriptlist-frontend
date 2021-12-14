<template>
  <div class="flex flex-center padding-normal">
    <q-card-section
      flat
      bordered
      class="scriptshow"
      v-if="ScriptList.length !== 0"
    >
      <div class="author flex flex-center">
        <q-avatar>
          <img :src="'https://scriptcat.org/api/v1/user/avatar/' + User.uid" />
        </q-avatar>
        <div class="text-h4">&nbsp;{{ User.username }}</div>
      </div>
      <Filter />
      <q-card
        class="single"
        flat
        bordered
        v-for="(item, index) in ScriptList"
        v-bind:key="index"
      >
        <q-card bordered flat>
          <q-item>
            <q-item-section>
              <div class="text-body1">
                <a
                  class="text-black"
                  target="_blank"
                  :href="'/script-show-page/' + item.id"
                >
                  <b>{{ item.name }}</b>
                </a>
              </div>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-card-section class="q-pt-none" style="margin: 10px 0px 0px 0px"
            >{{ item.description }}
          </q-card-section>
          <q-separator />
          <q-item class="block text-left">
            <q-item-label class="row" caption>
              <span class="col">今日安装</span>
              <span class="col">总安装量</span>
              <span class="col">创建日期</span>
              <span class="col">最近更新</span>
              <span class="col">评分</span>
            </q-item-label>
            <q-item-label
              class="row text-caption text-black"
              style="font-weight: bold"
            >
              <span class="col">{{ item.today_install }}</span>
              <span class="col">{{ item.total_install }}</span>
              <span class="col">{{ dateformat(item.createtime * 1000) }}</span>
              <span v-if="item.updatetime !== 0" class="col">{{
                dateformat(item.updatetime * 1000)
              }}</span>
              <span v-else class="col">{{
                dateformat(item.createtime * 1000)
              }}</span>
              <span v-if="item.score != 0" class="col"
                >{{ ((item.score * 2) / 10).toFixed(1) }} 分</span
              >
              <span v-else class="col">暂无评分</span>
            </q-item-label>
          </q-item>
          <q-separator />
          <q-item-label style="margin: 5px 5px 5px 0px">
            <q-btn-group flat>
              <q-btn
                flat
                icon="star"
                size="sm"
                color="light-blue-10"
                type="a"
                href="/comment/1"
              >
                <q-tooltip>评分</q-tooltip>
              </q-btn>
              <q-separator vertical inset="1" />
              <q-btn flat icon="chat" size="sm" color="light-blue-10">
                <q-tooltip>反馈</q-tooltip>
              </q-btn>
              <q-separator vertical inset="1" />
              <q-btn flat icon="share" size="sm" color="light-blue-10">
                <q-tooltip>分享</q-tooltip>
              </q-btn>
              <q-separator vertical inset="1" />
              <q-btn flat icon="more_horiz" size="sm" color="light-blue-10">
                <q-tooltip>更多</q-tooltip>
              </q-btn>
              <q-separator vertical inset="2" />
            </q-btn-group>
          </q-item-label>
        </q-card>
      </q-card>
      <div v-if="Maxpage > 1" class="flex flex-center">
        <q-pagination v-model="page" :max="Maxpage" direction-links />
      </div>
    </q-card-section>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import format from 'date-fns/format';
import { useRouter, useRoute } from 'vue-router';
import Filter from 'src/components/Filter.vue';
import { Cookies } from 'quasar';

export default defineComponent({
  meta: {
    title: 'webhook',
  },
  components: {
    Filter,
  },
  computed: {
    dateformat: () => {
      return (value: number | Date) => {
        return format(value, 'yyyy-MM-dd');
      };
    },
    Maxpage() {
      return Math.ceil(this.$store.state.scripts.total / 20);
    },
    User() {
      return this.$store.state.user.user;
    },
    ScriptList() {
      return this.$store.state.scripts.scripts;
    },
  },

  async preFetch({ store,ssrContext }) {
    if(!ssrContext){
      return;
    }
    const cookies=process.env.SERVER?Cookies.parseSSR(ssrContext):Cookies;
    await store.dispatch(
      'scripts/fetchUserScriptList',{
        uid:0,
        cookies:cookies
      }
    );
  },

  setup() {
    const route = useRoute();
    const router = useRouter();
    const page = ref(Number(route.query.page) || 1);

    watch(page, (newValue) => {
      const { href } = router.resolve({
        query: {
          keyword: route.query.keyword,
          page: newValue,
          category: route.query.category,
        },
      });
      window.open(href, '_self');
    });

    return {
      page,
    };
  },
});
</script>

<style lang="scss" scoped>
.author {
  margin: 10px 0px 20px 0px;
}
.scriptshow {
  padding: 15px;
  width: 1000px;
  a {
    text-decoration: none;
  }
}
.single {
  margin: 20px 0px 20px 0px;
}
</style>