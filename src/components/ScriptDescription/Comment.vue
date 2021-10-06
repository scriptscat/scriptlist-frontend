<template>
  <div>
    <div class="q-pa-md">
      <div>
        <div>
          <span style="font-size: 20px">发表我的评论(账户:{{ username }})</span>
        </div>
        <q-separator style="margin: 5px 0" />
        <div class="my-comment">
          <div>
            <div style="margin: 4px 0px">
              <span>评价星级:</span>
            </div>
            <div>
              <q-rating
                icon-selected="star"
                icon-half="star_half"
                v-model="mypostform.ratingpost"
                size="2em"
                :max="5"
                color="primary"
              />
            </div>
            <div style="margin: 4px 0px 8px">
              <span>评价内容:</span>
            </div>
            <div>
              <q-input
                class="text-area-control"
                v-model="mypostform.text"
                filled
                type="textarea"
              />
            </div>
          </div>
        </div>
        <div>
          <q-btn
            @click="SubmitMyViwer"
            :disable="!islogin"
            style="margin: 10px 0px"
            color="primary"
            label="提交评价"
          />
        </div>
        <q-separator style="margin: 5px 0" />
      </div>
      <div>
        <div>
          <span style="font-size: 20px; margin: 15px 0">用户评价：</span>
        </div>
        <q-separator style="margin:5px 0 20px 0" />
        <div>
          <div v-for="(item, index) in userscorelist" :key="index">
            <div style="margin-bottom:15px;" class="flex">
              <q-avatar size="48px">
                <img :src="item.avatar" />
              </q-avatar>
              <div style="flex:1 1 0;padding-left:15px;">
                <div style="margin-bottom:3px;" class="flex items-center">
                  <span style="color:#1a73e8;min-width:60px;">{{
                    item.username
                  }}</span>
                  <span style="padding-left:15px">{{ item.createtime }}</span>

                  <q-rating
                    style="padding-left:5px;"
                    readonly
                    :value="item.score"
                    size="16px"
                    :max="5"
                    color="primary"
                  />
                </div>
                <div>
                  <div>
                    {{ item.message }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    id() {
      return this.$route.params.id;
    },
    islogin() {
      return this.$store.state.user.islogin;
    },
    user() {
      return this.$store.state.user.user;
    },
    username() {
      if (this.islogin === false) {
        return "暂未登陆";
      }
      return this.$store.state.user.user.username;
    },
  },
  data() {
    return {
      mypostform: {
        ratingpost: 0,
        text: "",
      },
      userscorelist: [],
    };
  },
  methods: {
    SubmitMyViwer() {
      this.put("/scripts/" + this.id + "/score", {
        score: this.mypostform.ratingpost * 10,
        message: this.mypostform.text,
      })
        .then((response) => {
          console.log(response, "response");
          if (response.data.code === 0) {
            this.$q.notify({
              position: "top-right",
              message: "提交成功！",
              position: "top",
            });
            this.getallscroe(1);
            
          } else {
            this.$q.notify({
              position: "top-right",
              message: response.data.msg,
              position: "top",
            });
          }
        })
        .catch((error) => {});
    },
    getallscroe(page = 1) {
      this.userscorelist =[]
      this.get("/scripts/" + this.id + "/score")
        .then((response) => {
          console.log(response, "response");
          if (response.data.code === 0) {
            for (let index = 0; index < response.data.list.length; index++) {
              if (response.data.list[index].avatar === "") {
                response.data.list[index].avatar =
                  "https://bbs.tampermonkey.net.cn/uc_server/images/noavatar_middle.gif";
              }
              response.data.list[index].score =
                response.data.list[index].score / 10;
              response.data.list[index].createtime = this.$options.filters[
                "formatDate"
              ](response.data.list[index].createtime, "年", "月", "日");
            }
            this.userscorelist = response.data.list;
          }
        })
        .catch((error) => {});
    },
    GetMyScore() {
      this.get("/scripts/" + this.id + "/score/self")
        .then(response => {
          if (response.data.code === 0) {
            this.mypostform.ratingpost = response.data.data.score / 10;
            this.mypostform.text = response.data.data.message;
          }
        })
        .catch((error) => {});
    },
  },
  created() {
    this.getallscroe(1);
    if (this.islogin) {
      this.GetMyScore();
    }
  },
};
</script>

<style lang="scss" scoped>
</style>
