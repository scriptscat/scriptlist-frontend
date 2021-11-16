<template>
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
                <a class="text-caption" :href="'/script-show-page/' + item.id">
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
                ><a class="text-caption" :href="'/script-show-page/' + item.id">
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
                ><a class="text-caption" :href="'/script-show-page/' + item.id">
                  {{ item.name }}</a
                ></span
              >
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, onMounted } from 'vue';
import geScriptList from './geScriptList';
import aa from './aa';

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
  setup() {
    const recommondlist = ref({
      download: [],
      score: [],
      new: [],
    });
  
    recommondlist.download.value = [
      {
        name: 'ssss',
      },
    ];

    geScriptList
      .getRecommendList(
        '/scripts?page=1&count=10&keyword=&sort=today_download&category=&domain='
      )
      .then((res: aa) => {
        recommondlist.download.value = res.list;
        console.log(recommondlist);
      })
      .catch((e) => {
        console.log(e);
      });
    geScriptList
      .getRecommendList(
        '/scripts?page=1&count=10&keyword=&sort=today_download&category=&domain='
      )
      .then((res: aa) => {
        recommondlist.score.value = res.list;
        console.log(recommondlist);
      })
      .catch((e) => {
        console.log(e);
      });
    geScriptList
      .getRecommendList(
        '/scripts?page=1&count=10&keyword=&sort=today_download&category=&domain='
      )
      .then((res: aa) => {
        recommondlist.new.value = res.list;
        console.log(recommondlist);
      })
      .catch((e) => {
        console.log(e);
      });

    console.log(recommondlist);
    return {
      iconcolorlist: ref(iconcolorlist),
      recommondlist,
    };
  },
});
</script>

<style lang="scss" scoped></style>
