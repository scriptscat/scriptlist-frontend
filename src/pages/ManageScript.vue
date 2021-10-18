<template>
  <div class="page-padding padding-normal page-wrap">
    <div class="show-mess-page">
      <q-card>
        <q-card-section>
          <div
            v-if="ScriptList.length !== 0"
            class="text-h4"
            style="margin-top:20px;text-align:center;"
          >
            {{user.username}}
          </div>
          <div
            v-for="(item, index) in btnlist"
            :key="index"
            style="margin-top:8px;margin-left:20px;"
          >
            <q-btn
              outline
              @click="JumpBtnToTarget(item)"
              v-if="item.show===1" 
              color="primary" 
              :label="item.name" />
          </div>
          <div v-if="ScriptList.length !== 0">
            <div
              class="Script-Block"
              v-for="(item, index) in ScriptList"
              :key="index"
            >
              <q-card class="my-card" flat bordered>
                <q-item >
                  <q-item-section avatar>
                    <q-avatar>
                      <img :src="'https://scriptcat.org/api/v1/user/avatar/' + item.uid">
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label >
                      <a
                        style="color:rgb(40, 86, 172);"
                        target="_blank"
                        >
                        {{item.username}}
                      </a>
                      </q-item-label>
                    <div class="text-body1">
                      <a class="text-black"
                        target="_blank"
                        :href="'/script-show-page/' + item.id">
                        <b>{{item.name}}</b>
                      </a>
                    </div>
                  </q-item-section>
                  <q-item-section side bottom>
                      <div 
                        class="text-caption text-center text-primary"
                        style="font-size:18px"
                        >
                        {{(item.score*2/10).toFixed(1)}}
                      </div>
                      <q-rating 
                        size="20px" 
                        v-on:click="to_score(item.id)" 
                        :value="item.score/10" 
                        :max="5"
                        color="primary"/>
                  </q-item-section>
                </q-item>
                
                <q-separator />

                <q-card-section>
                  <q-card-section class="q-pt-none">
                    <div v-if="item.updatetime !== 0" class="text-grey-7">
                      今日安装：{{ item.today_install }}　总安装量：{{ item.total_install }}
                    　创建日期：{{ item.createtime | formatDate }}　最近更新：{{ item.updatetime | formatDate }}
                    </div>
                    <div v-else class="text-grey-7">
                      今日安装：{{ item.today_install }}　总安装量：{{ item.total_install }}
                    　创建日期：{{ item.createtime | formatDate }}　最近更新：{{ item.createtime | formatDate }}
                    </div>
                  </q-card-section>
                  <q-separator />
                  <q-card-section class="q-pt-none" style="margin-top:10px">{{item.description}}
                  </q-card-section>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
//import TablePagination from "components/TablePagination.vue";

export default {
  components: {
    //  TablePagination
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
  data() {
    return {
      page: 1,
      ScriptList: [],

      btnlist: [
        {
          id: 0,
          name: "发布编写的脚本",
          href: "submitscript",
          show:1,
        },
        {
          id: 1,
          name: "发布你编写的样式",
          href: ""
        },
        {
          id: 2,
          name: "新建脚本收藏集",
          href: ""
        },
        {
          id: 3,
          name: "导入脚本",
          href: ""
        },
        {
          id: 4,
          name: "设置 webhook",
          href: "webhookpage",
                    show:1,
        },
        {
          id: 5,
          name: "编辑账号信息",
          href: ""
        }
      ]
    };
  },
  computed: {
    islogin() {
      return this.$store.state.user.islogin;
    },
    user() {
      return this.$store.state.user.user;
    }
  },
  methods: {
    JumpBtnToTarget(item){
            this.$router.push({
        path: item.href
      });
    },
    tolink(page) {
      let ret = "/search?page=" + (page || 1);
      if (this.$route.query.keyword) {
        ret += "&keyword=" + encodeURIComponent(this.$route.query.keyword);
      }
      if (this.$route.query.sort) {
        ret += "&sort=" + encodeURIComponent(this.$route.query.sort);
      }
      if (this.$route.query.category) {
        ret += "&category=" + encodeURIComponent(this.$route.query.category);
      }
      if (this.$route.query.domain) {
        ret += "&domain=" + encodeURIComponent(this.$route.query.domain);
      }
      return ret;
    },
    getmyscripts() {
      this.get(
        "/user/scripts/" +
          this.user.uid +
          "?page=1&count=20&keyword=&sort=&category=&domain="
      )
        .then(response => {
          if (response.data.msg === "ok") {
            if (process.env.CLIENT) {
              if (response.data.code === 0) {
                this.ScriptList = response.data.list;
              }
            }
          }
        })
        .catch(error => {});
    }
  },
  created() {
    if (process.env.CLIENT) {
      if (!this.islogin) {
        this.$q.notify({
          position: "top-right",
          message: "当前尚未登陆！",
          position: "top"
        });
        this.$router.push({ path: "/" });
        return;
      }
      //this.id = this.$route.query.id;
    }
    this.getmyscripts();
  }
};
</script>
<style lang="scss" scoped>
.page-wrap {
  max-width: 1100px;
  margin-bottom: 20px;
  margin-top: 20px;
}
.my-card{
  a{
    text-decoration:none;
  }
}
.Script-Block {
  padding: 16px;
}
</style>
