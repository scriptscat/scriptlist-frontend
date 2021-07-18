<template>
  <div class="page-padding  padding-normal flex page-main">
    <div class="shadow-5 main-scrip-page">
      <div>
        <div
          class="Script-Block"
          v-for="(item, index) in ScriptList"
          :key="index"
        >
          <div class="Head" @click="JumpToSciptWeb(item)">
            {{ item.name }}
          </div>
          <div class="Context">
            <div class="text">
              <span v-if="item.description !== ''">{{ item.description }}</span>
              <span v-else>暂无简介</span>
            </div>
            <div class="Deatil">
              <div class="item">
                <div class="Item-left-box">
                  <div>
                    作者
                  </div>
                  <div class="Author">
                    {{ item.username }}
                  </div>
                </div>
                <div class="Item-right-box">
                  <div>
                    得分
                  </div>
                  <div class="flex items-center justify-center">
                    <q-rating
                      v-model="item.score"
                      disable
                      size="1em"
                      :max="5"
                      color="primary"
                    />
                  </div>
                </div>
              </div>
              <div class="item">
                <div class="Item-left-box">
                  <div>
                    今日安装
                  </div>
                  <div>
                    {{ item.today_install }}
                  </div>
                </div>
                <div class="Item-right-box">
                  <div>
                    创建日期
                  </div>
                  <div>
                    {{ item.createtime | formatDate }}
                  </div>
                </div>
              </div>

              <div class="item">
                <div class="Item-left-box">
                  <div>
                    总安装量
                  </div>
                  <div>
                    {{ item.total_install }}
                  </div>
                </div>
                <div class="Item-right-box">
                  <div>
                    最近更新
                  </div>
                  <div v-if="item.updatetime !== 0">
                    {{ item.updatetime | formatDate }}
                  </div>
                  <div v-else>
                    暂无更新
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <q-separator />
      </div>
      <div class="q-pa-lg flex flex-center">
        <TablePagination
          :currentpage.sync="page"
          :maxpage="maxpage"
          :maxlens="6"
          @UpdatePage="UpdatePageFunc"
        />
      </div>
    </div>
    <div class="show-mess-page">
      <q-card>
        <div class="bg-primary text-white" style="padding:5px">
          <div class="text-subtitle2">今日推荐</div>
        </div>

        <q-separator />

        <q-card-actions> </q-card-actions>
      </q-card>
      <q-card>
        <div class="bg-primary text-white" style="padding:5px">
          <div class="text-subtitle2">最高安装</div>
        </div>

        <q-separator />

        <q-card-actions> </q-card-actions>
      </q-card>
      <q-card>
        <div class="bg-primary text-white" style="padding:5px">
          <div class="text-subtitle2">最新脚本</div>
        </div>

        <q-separator />

        <q-card-actions> </q-card-actions>
      </q-card>
    </div>
  </div>
</template>
<script>
import TablePagination from "components/TablePagination.vue";
export default {
  name: "Search",
  components: {
    TablePagination
  },
  computed: {
    maxpage: function() {
      let max = Math.ceil(this.totalnums / this.count);
      if (max < 1) {
        max = 1;
      }
      return max;
    }
  },
  methods: {
    JumpToSciptWeb(item){
      this.$router.push({
        path: "SciptShowPage",
        query: { id: item.id }
      });
    },
    GetScripData(page, count) {
      if (this.$route.query.page != page.toString()) {
        this.$router.push({
          query: { ...this.$route.query, page: page }
        });
      }

      this.get("/scripts?page=" + page + "&count=" + count)
        .then(response => {
          if (response.data.code == 0) {
            this.ScriptList = response.data.list;
            this.totalnums = response.data.total;
            scrollTo(0, 0);
          }
        })
        .catch(error => {
          console.log(error);
        });
    },
    UpdatePageFunc(page) {
      this.GetScripData(page, this.count);
    }
  },
  data() {
    return {
      count: 10, //每次获取条数
      SearchText: "",
      ScriptList: [],
      totalnums: 0, //总条数
      page: 1
    };
  },
  created() {
    this.SearchText = decodeURIComponent(this.$route.query.SearchText);
    this.page = parseInt(this.$route.query.page);
    this.count = parseInt(this.$route.query.count);
    if (isNaN(this.page)) {
      this.page = 1;
    }
    if (isNaN(this.count)) {
      this.count = 10;
    }
    if (this.SearchText === "" || this.SearchText === undefined) {
      this.$router.push({ path: "/" });
      return;
    }
    this.GetScripData(this.page, this.count);
  }
};
</script>
<style lang="scss" scoped>
$seprewidth: 250px;
.item-child-common {
  > div:first-child {
    margin-right: 5px;
    width: 60px;
    text-align: right;
  }
  width: 50%;
  display: flex;
}

.Script-Block {
  padding: 16px;
  .Author {
    color: #1976d2;
    text-decoration: underline;
  }
  .Author:hover {
    cursor: pointer;
  }
  .Head {
    font-size: 18px;
    text-decoration: underline;
  }
  .Head:hover {
    cursor: pointer;
  }
  .Context {
    .text {
      margin: 7.5px 0;
    }
  }
  .Deatil {
    .item {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
    .Item-left-box {
        @extend .item-child-common;
      padding-left: 17%;
    }
    .Item-right-box {
      @extend .item-child-common;
    }
  }
}

@media screen and (max-width: 800px) {
  .Deatil {
    .Item-left-box {
      padding-left: 15% !important;

    }
  }
  .main-scrip-page{
    width: 100% !important;
  }
  .show-mess-page{
    width: 100% !important;
    padding-left: 0px !important;
    margin-top: 20px;
  }
}
@media screen and (max-width: 630px) {
    .Deatil {
    .item {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
    }
    .Item-left-box  {
      width: 100% !important;
      padding-left:33% !important;
    }
    .Item-right-box {
      width: 100% !important;
      padding-left: 33% !important;
    }
  }

}
.pagination-input {
  max-width: 50px;
  margin: 0px 5px;
}
.page-main {
  margin-bottom: 20px;
  margin-top: 30px;
  .main-scrip-page {
    width: calc(100% - #{$seprewidth});
  }
  .show-mess-page {
    min-width: $seprewidth;
    padding-left: 10px;
    .q-card {
      margin-bottom: 10px;
    }
  }
}
</style>
