<template>
  <div>
    <q-card flat class="my-card">
      <q-card
        style="padding: 8px; padding-bottom: 0"
        class="single"
        flat
        bordered
      >
        <q-card bordered flat>
          <q-item>
            <q-item-section avatar>
              <q-avatar>
                <img
                  :src="
                    'https://scriptcat.org/api/v1/user/avatar/' + author.uid
                  "
                />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <div class="flex justify-between">
                <div style="width: calc(100% - 120px)">
                  <q-item-label>
                    <a
                      style="color: rgb(40, 86, 172)"
                      target="_blank"
                      :href="'/users/' + author.uid"
                    >
                      {{ author.username }}
                    </a>
                  </q-item-label>
                  <div class="text-body1">
                    <a
                      class="text-black"
                      target="_blank"
                      :href="'/script-show-page/' + author.id"
                    >
                      <b>{{ author.name }}</b>
                    </a>
                  </div>
                </div>
                <div>
                  <q-select
                    outlined
                    v-model="scriptWatch"
                    :options="watchOptions"
                    :disable="!islogin"
                    borderless
                    dense
                    options-dense
                    label="关注"
                    style="width: 120px; height: 10px"
                  >
                  </q-select>
                </div>
              </div>
            </q-item-section>
          </q-item>
          <q-separator />
          <q-card-section class="q-pt-none" style="margin: 10px 0px 0px 0px"
            >{{ author.description }}
          </q-card-section>
          <q-separator />
          <ScriptDataInfo :script="author" />
          <q-separator />
          <q-btn-group flat class="install">
            <q-btn
              class="text-caption"
              type="a"
              :href="
                '/scripts/code/' +
                id +
                '/' +
                encodeURIComponent(author.name) +
                '.user.js'
              "
              color="primary"
              :label="install"
              @click="requestInstall"
            />
            <q-btn
              outline
              class="text-caption"
              type="a"
              target="_blank"
              href="https://bbs.tampermonkey.net.cn/thread-57-1-1.html"
              color="primary"
              label="如何安装?"
            />
            <q-separator
              class="text-caption"
              vertical
              inset="1"
              v-if="
                author.script.meta_json['contributionurl'] || author.post_id
              "
            />
            <q-btn
              v-if="author.script.meta_json['contributionurl']"
              outline
              class="text-caption"
              type="a"
              target="_blank"
              :href="author.script.meta_json['contributionurl'][0]"
              icon="monetization_on"
              color="secondary"
              label="捐赠脚本"
            />
            <q-btn
              v-if="author.post_id"
              outline
              class="text-caption"
              type="a"
              target="_blank"
              :href="
                'https://bbs.tampermonkey.net.cn/thread-' +
                author.post_id +
                '-1-1.html'
              "
              icon="forum"
              color="primary"
              label="论坛帖子"
            />
          </q-btn-group>
          <q-separator />
          <q-item-label
            style="margin: 5px 5px 5px 0px"
            class="flex justify-between"
          >
            <ScriptCardAction :id="id" :name="author.name" target="_self" />
            <div style="display: inline-block">
              <div style="display: inline-block">
                <q-chip
                  size="sm"
                  icon="download"
                  color="primary"
                  text-color="white"
                >
                  {{ author.script.version }}
                  <q-tooltip>
                    脚本最新版本为:{{ author.script.version }}
                  </q-tooltip>
                </q-chip>
              </div>
              <!-- 不受欢迎的功能 -->
              <div
                style="display: inline-block"
                v-for="name in antifeature"
                :key="name[0]"
              >
                <q-chip
                  v-if="name[0] == 'referral-link'"
                  outline
                  size="sm"
                  color="amber"
                  text-color="white"
                >
                  推荐链接
                  <q-tooltip>
                    该脚本会修改或重定向到作者的返佣链接
                  </q-tooltip>
                </q-chip>
                <q-chip
                  v-else-if="name[0] == 'ads'"
                  outline
                  size="sm"
                  color="deep-orange"
                  text-color="white"
                >
                  附带广告
                  <q-tooltip> 该脚本会在你访问的页面上插入广告 </q-tooltip>
                </q-chip>
                <q-chip
                  v-else-if="name[0] == 'payment'"
                  outline
                  size="sm"
                  color="pink"
                  text-color="white"
                >
                  付费脚本
                  <q-tooltip> 该脚本需要你付费才能够正常使用 </q-tooltip>
                </q-chip>
                <q-chip
                  v-else-if="name[0] == 'miner'"
                  outline
                  size="sm"
                  color="orange"
                  text-color="white"
                >
                  挖矿
                  <q-tooltip> 该脚本存在挖坑行为 </q-tooltip>
                </q-chip>
                <q-chip
                  v-else-if="name[0] == 'membership'"
                  outline
                  size="sm"
                  color="amber"
                  text-color="white"
                >
                  会员功能
                  <q-tooltip> 该脚本需要注册会员才能正常使用 </q-tooltip>
                </q-chip>
                <q-chip
                  v-else-if="name[0] == 'tracking'"
                  outline
                  size="sm"
                  color="orange"
                  text-color="white"
                >
                  信息追踪
                  <q-tooltip> 该脚本会追踪你的用户信息 </q-tooltip>
                </q-chip>
              </div>
              <!-- 脚本分类 -->
              <ScriptCategory style="display: inline-block" :script="author" />
            </div>
          </q-item-label>
        </q-card>
      </q-card>
      <q-card-section>
        <MarkdownView id="content" :content="author.content" />
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ScriptCardAction from '@Components/Script/ScriptCardAction.vue';
import MarkdownView from '@Components/MarkdownView.vue';
import ScriptDataInfo from '@Components/Script/ScriptDataInfo.vue';
import ScriptCategory from '@Components/Script/ScriptCategory.vue';
import { unwatch, watch, watchLevel } from '@App/apis/scripts';
import { csrfToken, downloadStatistics } from '@App/apis/other';

export default defineComponent({
  components: {
    ScriptCardAction,
    MarkdownView,
    ScriptDataInfo,
    ScriptCategory,
  },
  computed: {
    id() {
      return parseInt(<string>this.$route.params.id);
    },
    author(): DTO.Script {
      return this.$store.state.scripts.script || <DTO.Script>{};
    },
    islogin() {
      return this.$store.state.user.islogin;
    },
  },
  async created() {
    if (process.env.SERVER || !this.islogin) {
      return;
    }
    let level = (await watchLevel(this.id)).data.data.level;
    this.scriptWatch = this.watchOptions[level];
    this.$watch(
      () => {
        return this.scriptWatch;
      },
      () => {
        if (this.scriptWatch.value) {
          void watch(this.author.id, this.scriptWatch.value);
          this.$q.notify('关注成功');
        } else {
          void unwatch(this.author.id);
          this.$q.notify('取消关注成功');
        }
      }
    );
    this.csrf = (await csrfToken(this.id)).data.csrf;

    this.author.script.meta_json['antifeature']?.forEach((item) => {
      this.antifeature.push(item.split(' '));
    });
  },
  data() {
    return {
      antifeature: <string[][]>[],
      install: '安装此脚本',
      scriptWatch: <OptionItem>{
        value: 0,
        label: '未关注',
      },
      watchOptions: <OptionItem[]>[
        { value: 0, label: '未关注' },
        { value: 1, label: '版本更新' },
        { value: 2, label: '新建issue' },
        { value: 3, label: '任何' },
      ],
      csrf: '',
    };
  },
  methods: {
    to_score(id: number) {
      window.open('/script-show-page/' + id.toString() + '/comment');
    },
    JumpToManage() {
      void this.$router.push({
        name: 'submitscript',
        query: { id: this.id },
      });
    },
    async requestInstall(ev: Event) {
      ev.preventDefault();
      await downloadStatistics(this.id, this.csrf).finally(() => {
        window.open(
          '/scripts/code/' +
            this.id.toString() +
            '/' +
            encodeURIComponent(this.author.name) +
            '.user.js',
          '_self'
        );
      });
    },
  },
  mounted() {
    var api = <
        {
          isInstalled: (
            name: string,
            namespace: string,
            callback: (res: any, rej: any) => void
          ) => void;
        } // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      >(<any>window.external).Scriptcat || (<any>window.external).Tampermonkey;
    if (api != undefined) {
      api.isInstalled(
        this.author.name,
        this.author.namespace,
        (res: { installed: boolean; version: string }) => {
          if (res.installed === true) {
            if (res.version == this.author.script.version) {
              this.install = '重新安装此脚本（版本' + res.version + '）';
            } else {
              this.install = '更新到' + this.author.script.version + '版本';
            }
          } else this.install = '安装此脚本';
        }
      );
    }
  },
});
</script>

<style lang="scss" scoped>
.my-card {
  a {
    text-decoration: none;
  }
}
.install {
  .text-caption {
    color: 'primary';
    font-size: 13px;
    margin: 10px 0px 10px 10px;
  }
}
.title {
  font-size: 26px;
  font-weight: 400;
}
</style>
