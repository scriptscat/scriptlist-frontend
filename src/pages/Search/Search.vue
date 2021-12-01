/* eslint-disable @typescript-eslint/no-unsafe-return */
<template>
  <SearchLayout />
  <div class="flex justify-center">
    <q-card flat bordered class="scriptshow q-px-sm">
      <q-intersection once transition="scale" v-if="ScriptList.length !== 0">
        <q-card
          class="single"
          flat
          bordered
          v-for="(item, index) in ScriptList"
          v-bind:key="index"
        >
          <q-card square bordered flat>
            <q-item>
              <q-item-section avatar>
                <q-avatar>
                  <img
                    :src="
                      'https://scriptcat.org/api/v1/user/avatar/' + item.uid
                    "
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
            <q-item v-if="item.updatetime !== 0" class="block text-left">
              <q-item-label class="row" caption>
                <span class="col">今日安装</span>
                <span class="col">总安装量</span>
                <span class="col">创建日期</span>
                <span class="col">最近更新</span>
              </q-item-label>
              <q-item-label class="row text-caption text-black">
                <span class="col"
                  ><strong>{{ item.today_install }}</strong></span
                >
                <span class="col"
                  ><strong>{{ item.total_install }}</strong></span
                >
                <span class="col"
                  ><strong>{{
                    dateformat(item.createtime * 1000)
                  }}</strong></span
                >
                <span class="col"
                  ><strong>{{
                    dateformat(item.createtime * 1000)
                  }}</strong></span
                >
              </q-item-label>
            </q-item>
            <q-item v-else class="block text-left">
              <q-item-label class="row" caption>
                <span class="col">今日安装</span>
                <span class="col">总安装量</span>
                <span class="col">创建日期</span>
                <span class="col">最近更新</span>
              </q-item-label>
              <q-item-label class="row text-caption text-black">
                <span class="col"
                  ><strong>{{ item.today_install }}</strong></span
                >
                <span class="col"
                  ><strong>{{ item.total_install }}</strong></span
                >
                <span class="col"
                  ><strong>{{
                    dateformat(item.createtime * 1000)
                  }}</strong></span
                >
                <span class="col"
                  ><strong>{{
                    dateformat(item.updatetime * 1000)
                  }}</strong></span
                >
              </q-item-label>
            </q-item>
            <q-separator />
            <q-item>
              <q-btn-group flat class="full-width">
                <q-separator vertical inset="1" />
                <q-btn
                  flat
                  dense
                  icon="share"
                  size="sm"
                  color="grey-6"
                  class="q-mx-sm"
                >
                  <q-tooltip>分享</q-tooltip>
                </q-btn>
                <q-separator vertical inset="2" />
                <q-btn
                  flat
                  dense
                  icon="more_horiz"
                  size="sm"
                  color="grey-6"
                  class="q-mx-sm"
                >
                  <q-tooltip>更多</q-tooltip>
                </q-btn>
                <q-separator vertical inset="2" />
                <!-- <a
                  flat
                  class="text-caption"
                  style="font-size: 10px;"
                  text-color="primary"
                  :href="'/script-show-page/' + this.id + '/comment'"
                  outline
                >
                  　{{ ((item.score * 2) / 10).toFixed(1) }}
                </a> -->
                <q-rating
                  size="16px"
                  :model-value="item.score / 10"
                  :max="5"
                  color="primary"
                />
              </q-btn-group>
            </q-item>
          </q-card>
        </q-card>
      </q-intersection>
    </q-card>

    <!-- <div v-if="ScriptList.length !== 0">
      <div>
        <div
          class="Script-Block"
          v-for="(item, index) in ScriptList"
          :key="index"
        >
          <q-card class="my-card shadow-1" bordered>
            <q-item>
              <q-item-section avatar>
                <q-avatar>
                  <img
                    :src="
                      'https://scriptcat.org/api/v1/user/avatar/' + item.uid
                    "
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
              <q-item-section side bottom>
                <div
                  class="text-caption text-center text-primary"
                  style="font-size: 18px"
                >
                  {{ ((item.score * 2) / 10).toFixed(1) }}
                </div>
                <q-rating
                  size="20px"
                  v-on:click="to_score(item.id)"
                  :value="item.score / 10"
                  :max="5"
                  color="primary"
                />
              </q-item-section>
            </q-item>

            <q-separator />

            <q-card-section>
              <q-card-section class="q-pt-none">
                <div v-if="item.updatetime !== 0" class="text-grey-7">
                  今日安装：{{ item.today_install }}　总安装量：{{
                    item.total_install
                  }}
                  　创建日期：{{ item.createtime }}　最近更新：{{
                    item.updatetime
                  }}
                </div>
                <div v-else class="text-grey-7">
                  今日安装：{{ item.today_install }}　总安装量：{{
                    item.total_install
                  }}
                  　创建日期：{{ item.createtime }}　最近更新：{{
                    item.createtime
                  }}
                </div>
              </q-card-section>
              <q-separator />
              <q-card-section class="q-pt-none" style="margin-top: 10px"
                >{{ item.description }}
              </q-card-section>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <div v-else>111</div> -->

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
import { ref, defineComponent } from 'vue';
import geScriptList from './geScriptList';
import SearchLayout from 'components/Layout/SearchLayout.vue';
import format from 'date-fns/format';

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
  name: 'search',
  components: {
    SearchLayout,
  },
  computed: {
    dateformat: () => {
      return (value: number | Date) => {
        return format(value, 'yyyy-MM-dd');
      };
    },
    ScriptList() {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return this.$store.state.scripts.scripts;
    },
  },
  serverPrefetch() {
    // return the Promise from the action
    // so that the component waits before rendering
    return this.$store.dispatch(
      'scripts/fetchScriptList',
      '/scripts?page=' +
        (this.$route.query.page || 1).toString() +
        '&count=20&keyword=' +
        encodeURIComponent(<string>this.$route.query.keyword || '') +
        '&sort=' +
        (this.$route.query.sort || 'today_download').toString() +
        '&category=' +
        (this.$route.query.category || '').toString() +
        '&domain=' +
        (this.$route.query.domain || '').toString()
    );
  },
  setup() {
    const recommondlist = ref({
      download: [],
      score: [],
      new: [],
    });

    // 获取推荐列表
    // geScriptList
    //   .getRecommendList(
    //     '/scripts?page=1&count=10&keyword=&sort=today_download&category=&domain='
    //   )
    //   .then((r) => {
    //     const reee: RootObject = r.data;
    //     ScriptList.value = reee.list;
    //   })
    //   .catch((e) => {
    //     console.log(e);
    //   });

    geScriptList
      .getRecommendList(
        '/scripts?page=1&count=10&keyword=&sort=today_download&category=&domain='
      )
      .then((r) => {
        recommondlist.value.download = r.data.list;
      })
      .catch((e) => {
        console.log(e);
      });
    geScriptList
      .getRecommendList(
        '/scripts?page=1&count=10&keyword=&sort=score&category=&domain='
      )
      .then((r) => {
        recommondlist.value.score = r.data.list;
      })
      .catch((e) => {
        console.log(e);
      });
    geScriptList
      .getRecommendList(
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
      recommondlist,
    };
  },
});
</script>

<style lang="scss" scoped>
.scriptshow {
  margin: 20px 20px 0px 10px;
  padding: 10px;
  width: 900px;
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
  margin: 5px 5px 10px 5px;
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
</style>
