<template>
  <div class="page-padding">
    <div style="margin: 8vh 0">
      <div style="margin: 4vh 0" class="flex justify-center">
        <span style="font-size: 24px;color: #303133">全，比全更全。</span>
      </div>
      <div class="flex justify-center">
        <q-input
          style="max-width: 1000px; width: 100%; padding: 0 15px"
          outlined
          dense
          v-on:keyup.enter="ClickSearch"
          v-model="SearchText"
          placeholder="请输入查询的关键词"
        >
          <template v-slot:append>
            <q-icon
              v-if="SearchText !== ''"
              name="close"
              @click="SearchText = ''"
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
    <div style="padding: 0px 20px 0px 15px; margin-bottom: 10px">
      <div
        class="shadow-2"
        style="
          margin-top: 30px;
          text-align: center;
          padding: 0px 8px;
          border-radius: 14px;
        "
      >
        <div class="intro-page-wrap description">
          <h6>油猴脚本有什么用？</h6>
          <p>
            他可以拓展网页功能，去除广告，增加易用性等等，提高你网上冲浪的体验。
          </p>
          <h6>ScriptCat脚本猫又是什么？</h6>
          <p>
            参考了油猴的设计思路并且支持油猴脚本，实现了一个<b>后台脚本</b>运行的框架，并且也支持大部分的油猴脚本。推荐直接安装脚本猫，支持的脚本范围更广。
          </p>
          <h6>如何使用油猴脚本？</h6>
          <p>
            使用油猴脚本首先需要安装油猴管理器，油猴管理器根据不同浏览器安装的方式有所不同。
          </p>
          <el-table
            :data="tableData"
            stripe
            style="margin-left: 16px">
            <el-table-column
              prop="agent"
              label="浏览器"
              width="260">
            </el-table-column>
            <el-table-column
              prop="ScriptCat"
              label="🌟ScriptCat🌟"
              width="260">
              <template slot-scope="scope">
                <el-link
                  v-if="scope.row.ScriptCat!=null"
                  type="primary"
                  :href="scope.row.ScriptCat"
                  target="_black"
                >点此安装
                </el-link
                >
              </template>
            </el-table-column>
            <el-table-column
              prop="TamperMonkey"
              label="TamperMonkey"
              width="260">
              <template slot-scope="scope">
                <el-link
                  v-if="scope.row.TamperMonkey!=null"
                  type="primary"
                  :href="scope.row.TamperMonkey"
                  target="_black"
                >点此安装
                </el-link
                >
              </template>
            </el-table-column>
          </el-table>
          <h6>安装出现问题? 想学习脚本开发? 对脚本存在疑问?</h6>
          <p>
            可以访问我们的论坛：
            <el-link type="primary" href="https://bbs.tampermonkey.net.cn/" target="_black"
            >油猴中文网
            </el-link
            >
          </p>
        </div>
      </div>
    </div>
    <div></div>
  </div>
</template>

<style>
.list a {
  margin-left: 4px;
}

.description p, .description li {
  margin-left: 20px !important;
}
</style>

<script>
export default {
  meta: {
    title: "ScriptCat - 分享你的用户脚本",
    titleTemplate: (title) => `${title}`,
  },
  data() {
    return {
      SearchText: "",
      tableData: [{
        agent: 'Chrome',
        ScriptCat: 'https://chrome.google.com/webstore/detail/scriptcat/ndcooeababalnlpkfedmmbbbgkljhpjf',
        TamperMonkey: 'https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo'
      }, {
        agent: 'Firefox',
        ScriptCat: 'https://addons.mozilla.org/zh-CN/firefox/addon/scriptcat/',
        TamperMonkey: 'https://addons.mozilla.org/firefox/addon/tampermonkey/'
      }, {
        agent: 'Microsoft Edge',
        ScriptCat: 'https://microsoftedge.microsoft.com/addons/detail/scriptcat/liilgpjgabokdklappibcjfablkpcekh',
        TamperMonkey: 'https://www.microsoft.com/store/p/tampermonkey/9nblggh5162s'
      }, {
        agent: 'Safari',
        TamperMonkey: 'http://tampermonkey.net/?browser=safari'
      }, {
        agent: 'Opera',
        TamperMonkey: 'https://addons.opera.com/extensions/details/tampermonkey-beta/'
      }, {
        agent: 'UC',
        TamperMonkey: 'https://www.tampermonkey.net/?browser=ucweb&ext=dhd'
      }]
    };
  },
  methods: {
    ClickSearch() {
      if (this.SearchText === "") {
        this.$router.push({
          path: "search",
        });
        return;
      }
      this.$router.push({
        path: "search",
        query: {keyword: this.SearchText, page: 1},
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.intro-page-wrap {
  text-align: left;
  padding: 16px;

  h6 {
    margin: 10px 10px;
    color: #303133;
  }

  p {
    margin: 8px 0;
    color: #606266;
  }

  li {
    margin: 6px 0;
    list-style-type: none;
  }
}
</style>
