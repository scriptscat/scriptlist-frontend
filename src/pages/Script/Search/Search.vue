<template>
  <div class="flex justify-center">
    <q-card-section
      flat
      bordered
      class="scriptshow"
      v-if="ScriptList.length !== 0"
    >
      <Fliter />
      <q-card
        class="single"
        flat
        bordered
        v-for="(item, index) in ScriptList"
        v-bind:key="index"
      >
        <q-card bordered flat>
          <q-item>
            <q-item-section avatar>
              <q-avatar>
                <img
                  :src="'https://scriptcat.org/api/v1/user/avatar/' + item.uid"
                />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>
                <a
                  style="color: rgb(40, 86, 172)"
                  target="_blank"
                  :href="'/users/' + item.uid"
                >
                  {{ item.username }}
                </a>
              </q-item-label>
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
            <ScriptCardAction :id="item.id" :name="item.name" />
          </q-item-label>
        </q-card>
      </q-card>
      <div class="flex flex-center">
        <q-pagination v-model="page" :max="Maxpage" direction-links />
      </div>
    </q-card-section>
    <q-card flat bordered class="scriptshow" v-else> 暂无结果 </q-card>

    <div class="show-mess-page">
      <q-list
        bordered
        class="rounded-borders"
        style="padding-top: 5px; width: 300px"
      >
        <q-expansion-item
          default-opened
          dense
          dense-toggle
          expand-separator
          caption="安装量推荐"
        >
          <q-card>
            <q-card-section>
              <div v-for="(item, index) in recommondlist.download" :key="index">
                <span class="show-recommod-text">
                  <span
                    :style="{ backgroundColor: iconcolorlist[index] }"
                    class="recommond-icon"
                    >{{ index + 1 }}
                  </span>
                  <a
                    class="text-caption"
                    :href="'/script-show-page/' + item.id"
                  >
                    {{ item.name }}</a
                  >
                </span>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-expansion-item
          default-opened
          dense
          dense-toggle
          expand-separator
          caption="评分推荐"
        >
          <q-card>
            <q-card-section>
              <div v-for="(item, index) in recommondlist.score" :key="index">
                <span class="show-recommod-text"
                  ><span
                    :style="{ backgroundColor: iconcolorlist[index] }"
                    class="recommond-icon"
                    >{{ index + 1 }}</span
                  ><a
                    class="text-caption"
                    :href="'/script-show-page/' + item.id"
                  >
                    {{ item.name }}</a
                  ></span
                >
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
        <q-expansion-item
          default-opened
          dense
          dense-toggle
          expand-separator
          caption="最新脚本"
        >
          <q-card>
            <q-card-section>
              <div v-for="(item, index) in recommondlist.new" :key="index">
                <span class="show-recommod-text"
                  ><span
                    :style="{ backgroundColor: iconcolorlist[index] }"
                    class="recommond-icon"
                    >{{ index + 1 }}</span
                  ><a
                    class="text-caption"
                    :href="'/script-show-page/' + item.id"
                  >
                    {{ item.name }}</a
                  ></span
                >
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, watch } from 'vue';
import format from 'date-fns/format';
import { useRouter, useRoute } from 'vue-router';
import { getRecommendList } from 'src/apis/scripts';
import { useMeta } from 'quasar';
import Fliter from 'src/components/Filter.vue';
import ScriptCardAction from '@Components/Script/ScriptCardAction.vue';

const iconcolorlist = [
  '#ff981b',
  '#FF8F1C',
  '#6AC25E',
  '#7CCB6D',
  '#BD76E3',
  '#BE78E4',
  '#23B4EA',
  '#1EB1E9',
  '#EB7182',
  '#EB7282',
];

export default defineComponent({
  components: { Fliter, ScriptCardAction },
  name: 'search',
  computed: {
    dateformat: () => {
      return (value: number | Date) => {
        return format(value, 'yyyy-MM-dd');
      };
    },
    Maxpage() {
      return Math.ceil(this.$store.state.scripts.total / 20);
    },
    ScriptList() {
      return this.$store.state.scripts.scripts;
    },
  },
  preFetch({ store, currentRoute }) {
    return store.dispatch(
      'scripts/fetchScriptList',
      '/scripts?page=' +
        (currentRoute.query.page || 1).toString() +
        '&count=20&keyword=' +
        encodeURIComponent(<string>currentRoute.query.keyword || '') +
        '&sort=' +
        (currentRoute.query.sort || 'today_download').toString() +
        '&category=' +
        (currentRoute.query.category || '').toString() +
        '&domain=' +
        (currentRoute.query.domain || '').toString()
    );
  },
  setup() {
    useMeta({
      title: '用户脚本列表',
    });
    const recommondlist = ref<{
      download: DTO.Script[];
      score: DTO.Script[];
      new: DTO.Script[];
    }>({
      download: [],
      score: [],
      new: [],
    });
    const router = useRouter();
    const route = useRoute();
    const page = ref(Number(route.query.page) || 1);

    watch(page, (newValue) => {
      const { href } = router.resolve({
        name: 'search',
        query: {
          keyword: route.query.keyword,
          page: newValue,
          category: route.query.category,
        },
      });
      window.open(href, '_self');
    });

    getRecommendList(
      '/scripts?page=1&count=10&keyword=&sort=today_download&category=&domain='
    )
      .then((r) => {
        recommondlist.value.download = r.data.list;
      })
      .catch((e) => {
        console.log(e);
      });

    getRecommendList(
      '/scripts?page=1&count=10&keyword=&sort=score&category=&domain='
    )
      .then((r) => {
        recommondlist.value.score = r.data.list;
      })
      .catch((e) => {
        console.log(e);
      });

    getRecommendList(
      '/scripts?page=1&count=10&keyword=&sort=updatetime&category=&domain='
    )
      .then((r) => {
        recommondlist.value.new = r.data.list;
      })
      .catch((e) => {
        console.log(e);
      });

    return {
      iconcolorlist: ref(iconcolorlist),
      page,
      recommondlist,
    };
  },
});
</script>

<style lang="scss" scoped>
.filter {
  width: 915px;
}

.scriptshow {
  padding: 15px;
  width: 915px;
  a {
    text-decoration: none;
  }
}

.show-mess-page {
  padding: 20px 40px 0px 10px;
}

.show-recommod-text {
  max-width: 300px;
  padding-left: 4px;
  overflow: hidden;
  display: flex;
  a {
    flex: 1 1 0;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    text-decoration: none;
    color: black;
  }
}

.single {
  margin: 5px 5px 20px 5px;
}

.recommond-icon {
  flex-shrink: 0;
  display: inline-block;
  width: 16.7px;
  height: 17px;
  text-align: center;
  color: white;
  border-radius: 3px;
  line-height: 18.4px;
  font-size: 12.1px;
  margin-right: 5px;
}

@media screen and (max-width: 1280px) {
  .scriptshow {
    width: 680px;
  }
}
@media screen and (max-width: 1080px) {
  .scriptshow {
    width: 600px;
  }
}
@media screen and (max-width: 1000px) {
  .show-mess-page {
    display: none;
  }
}
</style>
