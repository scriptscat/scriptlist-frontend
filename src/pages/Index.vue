<template>
  <div class="page-padding">
    <div style="margin: 8vh 0;">
      <div style="margin: 4vh 0" class="flex justify-center">
        <div class="text-h5">
          <span 
          style="vertical-align:middle;">
          <img :src="cat" style="width:72px;">
          </span>
          {{SearchTitle}}
          </div>
      </div>
      <div class="flex justify-center">
        <q-input
          style="max-width: 1000px; width: 100%; padding: 0 15px"
          outlined
          dense
          v-on:keyup.enter="ClickSearch"
          v-model="Text"
          v-bind:placeholder="SearchText"
        >
          <template v-slot:append>
            <q-icon
              v-if="Text !== ''"
              name="close"
              @click="Text = ''"
              class="cursor-pointer"
            />
            <q-icon
              style="cursor: pointer"
              name="search"
              @click="ClickSearch"
            />
          </template>
        </q-input>
      </div>
    </div>
    <div style="padding: 0px 20px 0px 15px; margin-bottom: 20px;" class="flex justify-center">
      <div class="shadow-2" style="max-width: 1100px; width:100%; text-align:center; padding: 0px 8px; border-radius: 14px;">
        <div class="intro-page-wrap description">
          <q-list bordered class="rounded-borders" v-for="(result, idx) in questionAnswer" :key="idx">
              <q-expansion-item
                switch-toggle-side
                expand-separator
                v-bind:label="result.question"
              >
                <q-card>
                  <q-card-section style="margin-left:56px" v-html="result.answer"></q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
        </div>

        <div class="q-pa-md">
          <q-table
              :data="tableData"
              :columns="columns"
              title="如果你需要运行脚本，首先需要安装以下一种脚本管理器"
              :rows-per-page-options="[6]"
              row-key="name"
            >
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="desc" :props="props">
                  {{ props.row.agent }}
                </q-td>
                <q-td key="calories" :props="props">
                  <a
                  v-if="props.row.ScriptCat!=''"
                  v-bind:href="props.row.ScriptCat">点击安装</a>
                </q-td>
                <q-td key="fat" :props="props">
                  <a v-bind:href="props.row.TamperMonkey">点击安装</a>
                </q-td>
              </q-tr>
            </template>

            <template v-slot:bottom>
              Safari,Opera,UC等浏览器将会尽快通过审核
            </template>

          </q-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  meta: {
    title: "ScriptCat - 分享你的用户脚本",
    titleTemplate: title => `${title}`
  },
  data() {
    return {
      SearchTitle: "ScriptCat（脚本猫）比全更全的用户脚本托管平台",
      SearchText: "请输入要查询的脚本关键词",
      Text:"",
      cat : require('../assets/cat.png'),

      columns : [
        { name: 'desc', align: 'left', label: '浏览器', field: 'name' },
        { name: 'calories', align: 'left', label: 'Scirpt下载（推荐）', field: 'Scirpt' },
        { name: 'fat', align: 'left',label: 'tampermonkey下载', field: 'tampermonkey' },
      ],

      tableData: [
        {
          agent: "Chrome",
          ScriptCat:
            "https://chrome.google.com/webstore/detail/scriptcat/ndcooeababalnlpkfedmmbbbgkljhpjf",
          TamperMonkey:
            "https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo"
        },
        {
          agent: "Firefox",
          ScriptCat:
            "https://addons.mozilla.org/zh-CN/firefox/addon/scriptcat/",
          TamperMonkey: "https://addons.mozilla.org/firefox/addon/tampermonkey/"
        },
        {
          agent: "Microsoft Edge",
          ScriptCat:
            "https://microsoftedge.microsoft.com/addons/detail/scriptcat/liilgpjgabokdklappibcjfablkpcekh",
          TamperMonkey:
            "https://www.microsoft.com/store/p/tampermonkey/9nblggh5162s"
        },
        {
          agent: "Safari",
          ScriptCat:"",
          TamperMonkey: "http://tampermonkey.net/?browser=safari"
        },
        {
          agent: "Opera",
          ScriptCat:"",
          TamperMonkey:
            "https://addons.opera.com/extensions/details/tampermonkey-beta/"
        },
        {
          agent: "UC",
          ScriptCat:"",
          TamperMonkey: "https://www.tampermonkey.net/?browser=ucweb&ext=dhd"
        }
      ],

      questionAnswer:[
        {
          question:"油猴脚本有什么用？",
          answer:"他可以拓展网页功能，去除广告，增加易用性等等，提高你网上冲浪的体验。"
        },        
        {
          question:"ScriptCat脚本猫又是什么？",
          answer:"参考了油猴的设计思路并且支持油猴脚本，实现了一个<b>后台脚本</b>运行的框架，并且也支持大部分的油猴脚本。推荐直接安装脚本猫，支持的脚本范围更广。"
        },
        {
          question:"如何使用油猴脚本？",
          answer:"使用油猴脚本首先需要安装油猴管理器，油猴管理器根据不同浏览器安装的方式有所不同。"
        },
        {
          question:"安装出现问题? 想学习脚本开发? 对脚本存在疑问?",
          answer:'可以访问我们的论坛：<a style="text-decoration:none; color:rgb(40, 86, 172);" href="https://bbs.tampermonkey.net.cn/"target="_black">油猴中文网</a>'
        },
      ]
    };
  },
  methods: {
    ClickSearch() {
      if (this.SearchText == "") {
        this.$router.push({
          path: "search"
        });
        return;
      }
      this.$router.push({
        path: "search",
        query: { keyword: this.Text, page: 1 }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.intro-page-wrap {
  text-align: left;
  padding: 16px;
}

.q-pa-md{
  a{
    text-decoration:none;
    color:rgb(40, 86, 172);
  }
}

</style>
