<template>
  <div align="center">
    <div class="title text-h4">ScriptCat，比全更全的用户脚本托管平台</div>
    <q-input
      class="GNL__toolbar-input"
      outlined
      v-model="SearchText"
      color="bg-grey-7"
      placeholder="脚本猫，让你的浏览器可以做更多的事情"
      v-on:keyup.enter="Search"
    >
      <template v-slot:prepend>
        <q-icon v-if="SearchText === ''" name="done" />
        <q-icon
          v-else
          name="clear"
          class="cursor-pointer"
          @click="SearchText = ''"
        />
      </template>
      <template v-slot:append>
        <q-btn
          icon="search"
          flat
          dense
          outline
          color="primary"
          @click="Search"
        />
        <!-- <q-btn flat dense aria-label="Menu" icon="menu">
          筛选
          <q-menu anchor="bottom end" self="top end">
            <div class="q-pa-md" style="width: 500px">
              <div class="row items-center">
                <div class="col-3 text-subtitle2">脚本类型</div>
                <q-input dense v-model="exactPhrase" />
                <div class="col-3 text-subtitle2">排序方式</div>
                <div class="col-9">
                  <q-input dense v-model="hasWords" />
                </div>

                <div class="col-12 q-pt-lg row justify-end">
                  <q-btn
                    flat
                    dense
                    no-caps
                    color="grey-7"
                    size="md"
                    style="min-width: 68px"
                    label="确认"
                    v-close-popup
                  />
                </div>
              </div>
            </div>
          </q-menu>
        </q-btn> -->
      </template>
    </q-input>

    <div class="flex flex-center">
      <q-card
        class="my-card"
        flat
        bordered
        v-for="(value, index) in data"
        :key="index"
      >
        <q-item class="bg-grey-1">
          <q-item-section>
            <div align="left">
              <q-btn
                flat
                :color="value.color"
                :icon="value.icon"
                style="font-size: 17px"
              >
                　{{ value.title }}
              </q-btn>
            </div>
          </q-item-section>
        </q-item>
        <q-separator />
        <q-card-section>
          <q-card-section
            align="left"
            class="text-caption text-grey-8"
            style="font-size: 13px"
            v-html="value.content"
          />
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script lang="ts">
import { useMeta } from 'quasar';
import { ref, defineComponent, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'src/store';

const shape = '0';

const columns = [
  { name: 'desc', align: 'left', label: '浏览器', field: 'name' },
  { name: 'calories', align: 'left', label: 'Scirptcat', field: 'Scirpt' },
  {
    name: 'fat',
    align: 'center',
    label: 'tampermonkey',
    field: 'tampermonkey',
  },
];

export default defineComponent({
  name: 'Error404',
  setup() {
    useMeta({
      title: 'ScriptCat - 分享你的用户脚本',
      titleTemplate: (title) => `${title}`,
    });

    const data = ref([
      {
        icon: 'warning',
        color: 'red',
        title: '您还未安装脚本猫',
        content:
          '　脚本猫是一个可以执行用户脚本的浏览器扩展，让你的浏览器可以做更多的事情！' +
          '<br>　持续兼容油猴脚本中，已兼容90%+的油猴脚本，更多油猴特性完善中。' +
          '<br>　并且另外支持更强大的后台脚本和定时脚本!' +
          '<br>　<b>如果您已经安装了其他脚本管理器（Tanmpermonkey（油猴）），可以选择不安装脚本猫。</b>' +
          '<br>　<b>如果您想使用脚本猫，请先<a style="text-decoration:none; color:rgb(40, 86, 172);" href="https://docs.scriptcat.org/use/#%E5%AE%89%E8%A3%85%E6%89%A9%E5%B1%95">点击安装</a>脚本猫。</b>' +
          '<br>　如果您在安装中出现了问题? 想学习脚本开发? 对脚本存在疑问?' +
          '<br><b>　可以访问我们的论坛：<a style="text-decoration:none; color:rgb(40, 86, 172);" href="https://bbs.tampermonkey.net.cn/"target="_black">油猴中文网</a></b>',
      },
      {
        icon: 'chat',
        color: 'black',
        title: '常见问题',
        content:
          '<b>1.油猴脚本有什么用？</b>' +
          '<br>　他可以拓展网页功能，去除广告，增加易用性等等，提高你网上冲浪的体验。' +
          '<br><b>2.ScriptCat脚本猫又是什么？</b>' +
          '<br>　参考了油猴的设计思路并且支持油猴脚本，实现了一个<b>后台脚本</b>运行的框架，并且也支持大部分的油猴脚本。推荐直接安装脚本猫，支持的脚本范围更广。' +
          '<br><b>3.如何使用油猴脚本？</b>' +
          '<br>　使用油猴脚本首先需要安装油猴管理器，油猴管理器根据不同浏览器安装的方式有所不同。',
      },
      {
        icon: 'cloud',
        color: 'primary',
        title: '想要成为开发者？',
        content:
          '<b>在您成为论坛开发者后，我们可以提供以下福利！</b>' +
          '<br>1.论坛首页推荐！' +
          '<br>2.微信公众号文章推荐，公众号叛逆青年旅舍和一之哥哥转发您的文章！' +
          '<br>3.您将被邀请到技术氛围极好的开发者QQ群中，与更多志同道合的开发者进行技术上的交流！' +
          '<br>4.如果您愿意的话，我们也将在论坛、频道等展示您的介绍信息！' +
          '<br>5.论坛、频道的开发者用户组权限，与众不同！' +
          '<br>6.······' +
          '<br><b>如果你也想成为一名开发者，欢迎参考我们的教程</b>',
      },
    ]);
    const SearchText = ref('');
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const Search = () => {
      const { href } = router.resolve({
        name: 'search',
        query: {
          keyword: SearchText.value,
        },
      });
      window.open(href, '_blank');
    };

    const id = route.params.id;
    const author = computed(() => {
      return store.state.scripts.script || <DTO.Script>{};
    });

    onMounted(() => {
      let api = <
          {
            isInstalled: (
              name: string,
              namespace: string,
              callback: (res: any, rej: any) => void
            ) => void;
          } // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        >(<any>window.external).Scriptcat || (<any>window.external).Tampermonkey;
      if (api != undefined) {
        data.value[0].title = '您已安装脚本猫';
        data.value[0].color = 'green';
        data.value[0].icon = 'done';
      }
    });

    return {
      shape: ref(shape),
      data,
      columns,
      SearchText,
      id,
      author,
      Search,
    };
  },
});
</script>

<style>
.title {
  padding-top: 70px;
}

.q-input {
  padding-top: 50px;
  min-width: 300px;
  max-width: 1000px;
}

.my-card {
  max-width: 425px;
  width: 100%;
  height: 350px;
  margin: 100px 50px 0px 50px;
}

@media screen and (max-width: 554px) {
  .title {
    font-size: 18px;
    padding-top: 30px;
  }

  .q-input {
    padding-top: 20px;
    min-width: 350px;
    max-width: 1000px;
  }

  .my-card {
    width: 400px;
    height: 400px;
    margin: 20px 20px 0px 20px;
  }
}
</style>
