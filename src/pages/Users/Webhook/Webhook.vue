<template>
  <div class="page-padding padding-normal">
    <q-card style="margin: 30px 0px">
      <q-card-actions>
        <div>
          <div class="text-h5">
            <span style="vertical-align: middle">
              <img :src="cat" style="width: 72px" />
            </span>
            Scriptcat(脚本猫)的WebHook设置
          </div>

          <div class="q-px-lg q-pb-md">
            <q-timeline color="primary">
              <div
                class="text-h6"
                style="margin-left: 40px; padding-bottom: 20px"
              >
                与“脚本猫”绑定的Webhook（网页通知事件）可以基于代码仓库的更新而自动更新网站上对应的脚本。
                <br />脚本猫支持 GitHub的push（推送）事件和
                GitHub的release（发布）事件。
                <br />要使用该功能，你必须在脚本猫设定通过地址同步脚本的功能。
                <br />你可以通过导入脚本到脚本猫来添加，或从已提交脚本的“管理”页面来设定同步。
                <br />你的脚本在收到第一次自动推送的事件之前，脚本的同步类型还是会显示为“自动”或“手动”。
              </div>

              <q-timeline-entry
                subtitle="STEP ONE"
                title="访问Github仓库进入Settings"
              />
              <q-timeline-entry
                subtitle="STEP TWO"
                title='点击"Add webhook"，输入下方数据'
                icon="done_all"
              >
                <q-tree
                  :nodes="simple"
                  node-key="label"
                  v-bind:expanded="expanded"
                >
                </q-tree>
                <q-btn
                  label="Refresh your secret"
                  color="primary"
                  @click="RefreshSecret"
                />
              </q-timeline-entry>
            </q-timeline>
          </div>
        </div>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { getWebhook, updateWebhook } from 'src/apis/user';
import http from 'src/utils/http';

export default defineComponent({
  meta: {
    title: 'webhook',
  },
  computed: {
    islogin() {
      return this.$store.state.user.islogin;
    },
    user() {
      return this.$store.state.user.user;
    },
  },
  data() {
    return {
      cat: require('src/assets/cat.png'),
      expanded: ['配置方法', 'Url', 'Content-Type', 'Secret', '选择事件'],
      simple: [
        {
          label: '配置方法',
          children: [
            {
              label: 'Url',
              icon: 'share',
              children: [
                {
                  disabled: true,
                  label: '',
                },
              ],
            },
            {
              label: 'Content-Type',
              children: [
                {
                  disabled: true,
                  label: 'application/json',
                },
              ],
            },
            {
              label: 'Secret',
              children: [
                {
                  disabled: true,
                  label: '',
                },
              ],
            },
            {
              label: '选择事件',
              children: [
                {
                  label:
                    '如果你想让Script的脚本只在"push"行为后更新,请选择"Just the push event"',
                },
                {
                  label:
                    '如果你想让Script的脚本只在"releases"行为后更新,请选择"Let me select individual events"',
                },
              ],
            },
          ],
        },
      ],
    };
  },
  methods: {
    RefreshSecret() {
      updateWebhook()
        .then((response) => {
          if (response.data.msg === 'ok') {
            if (response.data.code === 0) {
              this.simple[0].children[2].children[0].label =
                response.data.data.token;
            }
          }
        })
        .catch((error) => {
          console.trace(error);
        });
    },
  },
  created() {
    if (process.env.CLIENT) {
      if (!this.islogin) {
        this.$q.notify({
          position: 'top-right',
          message: '当前尚未登陆！',
          position: 'top',
        });
        void this.$router.push({ path: '/' });
        return;
      }
    }
    getWebhook()
      .then((response) => {
        if (response.data.msg === 'ok') {
          if (response.data.code === 0) {
            this.simple[0].children[2].children[0].label =
              response.data.data.token;
            this.simple[0].children[0].children[0].label =
              http.baseURL + '/webhook/' + this.user.uid.toString();
          }
        }
      })
      .catch((error) => {
        console.trace(error);
      });
  },
});
</script>

<style lang="scss" scoped>
.title-wrap {
  font-size: 18px;
  font-weight: bold;
  margin: 10px 0;
}
.padding-left {
  padding-left: 20px;
}
</style>
