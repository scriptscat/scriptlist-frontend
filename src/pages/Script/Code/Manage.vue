<template>
  <q-card-section>
    <div style="display: none">
      <div class="title-wrap">推荐脚本</div>
      <div>在安装该脚本后向安装者推荐您所输入的脚本。</div>
      <div class="title-wrap">推荐脚本网址</div>
      <q-input
        outlined
        v-model="recommendaddress"
        style="margin-bottom: 10px"
        dense
      >
      </q-input>
      <div>
        <q-btn
          :loading="loading.uniteloading"
          label="设置推荐脚本"
          color="primary"
        />
      </div>
      <q-separator style="margin: 10px 0" />
    </div>
    <div class="title-wrap">源代码同步</div>
    <div style="margin-bottom: 10px">
      自动从输入的地址中进行源代码同步操作。
    </div>
    <q-input
      outlined
      v-model="intervalgetscript"
      style="margin-bottom: 10px"
      dense
    >
    </q-input>
    <div>脚本同步方式</div>
    <div>
      <div>
        <q-radio
          v-model="intervalmethod"
          :val="1"
          label="自动，系统将在未来时间内定期进行更新检查"
        />
      </div>
      <div>
        <q-radio
          v-model="intervalmethod"
          :val="2"
          label="手动，仅在你手动点击按钮的时候进行更新检查"
        />
      </div>
    </div>
    <div>同步脚本附加信息</div>
    <div style="margin: 10px 0">
      默认的附加信息，匹配@name语言(强制markdown)
    </div>
    <div>
      <q-input outlined v-model="addtext" style="margin-bottom: 10px" dense>
      </q-input>
    </div>
    <div v-if="dtscontrol">
      <div style="margin: 10px 0">库同步地址</div>
      <div>
        <q-input
          outlined
          v-model="dtscontext"
          style="margin-bottom: 10px"
          dense
        >
        </q-input>
      </div>
    </div>
    <div>
      <q-btn
        @click="PushPartlyConfig"
        :loading="loading.uniteloading"
        label="更新设置并且立刻同步"
        color="primary"
      />
    </div>
    <q-separator style="margin: 10px 0" />
    <div style="display: none">
      <div class="title-wrap">作者</div>
      <div style="margin-bottom: 10px">
        您可以邀请其他作者共同开发并管理脚本，注意开放管理权限对于一些存在道德问题的人是危险的。
      </div>
      <q-input outlined v-model="author" style="margin-bottom: 10px" dense>
      </q-input>
      <q-btn :loading="loading.uniteloading" label="发送邀请" color="primary" />
    </div>
    <div class="setting-item">
      <div class="title-wrap">脚本管理</div>
      <div class="row">
        <q-btn
          v-if="archive"
          label="取消归档"
          size="md"
          color="orange"
          @click="onArchive"
          :loading="loading.archive"
        >
          <q-tooltip> 取消归档,继续维护 </q-tooltip>
        </q-btn>
        <q-btn
          v-else
          label="归档脚本"
          size="md"
          color="orange"
          @click="onArchive"
          :loading="loading.archive"
        >
          <q-tooltip>
            设置脚本为归档,提示用户不再维护,且脚本不能更新和反馈
          </q-tooltip>
        </q-btn>
        <q-btn
          label="删除脚本"
          size="md"
          color="red"
          style="margin-left: 10px"
          @click="onDelete"
        >
          <q-tooltip> 请注意!!!删除后不能再恢复!!! </q-tooltip>
        </q-btn>
      </div>
    </div>
    <div class="setting-item">
      <div class="title-wrap">管理日志</div>
      <div>暂未开放</div>
    </div>
    <div style="display: none">
      <div class="title-wrap">与另一脚本比较</div>
      <div style="margin-bottom: 10px">要比较的脚本地址</div>
      <q-input
        outlined
        v-model="compareaddress"
        style="margin-bottom: 10px"
        dense
      >
      </q-input>
      <div style="margin-bottom: 10px">上下文行数</div>
      <q-input
        dense
        v-model.number="compareline"
        type="number"
        outlined
        style="max-width: 200px"
      />
      <q-btn
        :loading="loading.uniteloading"
        style="margin-top: 10px"
        label="比较"
        color="primary"
      />
    </div>
  </q-card-section>
</template>

<script lang="ts">
import {
  archive,
  deleteScript,
  getScriptInfo,
  unarchive,
  updateSetting,
} from '@App/apis/scripts';
import { handleResponseError } from '@App/utils/utils';
import { defineComponent } from 'vue';

export default defineComponent({
  computed: {
    id() {
      return parseInt(<string>this.$route.params.id);
    },
    script() {
      return this.$store.state.scripts.script || <DTO.Script>{};
    },
  },
  methods: {
    GetPartlyConfig() {
      getScriptInfo(this.id, false)
        .then((response) => {
          if (response.data.code === 0) {
            if (response.data.data.type !== 3) {
              this.dtscontrol = false;
            } else {
              this.dtscontrol = true;
            }
            if (!response.data.data.setting) {
              return;
            }
            this.intervalgetscript = response.data.data.setting.sync_url;
            this.intervalmethod = response.data.data.setting.sync_mode;
            this.addtext = response.data.data.setting.content_url;
            this.dtscontext = response.data.data.setting.definition_url;
            this.archive = response.data.data.archive;
          } else {
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    PushPartlyConfig() {
      this.loading.uniteloading = true;
      handleResponseError(
        this.$q,
        updateSetting(this.id, {
          sync_url: this.intervalgetscript,
          content_url: this.addtext,
          definition_url: this.dtscontext,
          sync_mode: this.intervalmethod,
        })
      )
        .then((response) => {
          this.loading.uniteloading = false;
          console.log(response, 'response');
          if (response.data.code === 0) {
            this.$q.notify({
              message: '保存配置成功!',
              position: 'top',
            });
          }
        })
        .catch(() => {
          this.loading.uniteloading = false;
        });
    },
    onArchive() {
      this.loading.archive = true;
      let p;
      if (this.archive) {
        // 取消归档
        p = unarchive(this.id);
      } else {
        // 归档
        p = archive(this.id);
      }
      handleResponseError(this.$q, p)
        .then((resp) => {
          this.archive = this.archive ? 0 : 1;
          this.loading.archive = false;
          if (resp.data.code === 0) {
            this.$q.notify({
              message: (this.archive ? '归档成功' : '取消归档成功') + '!',
              position: 'top',
            });
          }
        })
        .catch(() => {
          this.loading.archive = false;
        });
    },
    onDelete() {
      if (prompt('请再次输入脚本名以确认是否删除') !== this.script.name) {
        return alert('输入错误,取消删除');
      }
      void handleResponseError(this.$q, deleteScript(this.id)).then((resp) => {
        if (resp.data.code === 0) {
          this.$q.notify({
            color: 'primary',
            icon: 'done',
            message: '删除成功',
            position: 'center',
          });
          void this.$router.push({
            path: '/',
          });
        }
      });
    },
  },
  data() {
    return {
      dtscontrol: false,
      dtscontext: '',
      archive: 0,
      loading: {
        uniteloading: false,
        archive: false,
      },
      recommendaddress: '',
      intervalgetscript: '',
      intervalmethod: '',
      addtext: '',
      author: '',
      compareaddress: '',
      compareline: 3,
    };
  },
  mounted() {
    this.GetPartlyConfig();
  },
});
</script>
<style lang="scss" scoped>
.title-wrap {
  font-size: 18px;
  font-weight: bold;
  margin: 10px 0;
}
</style>
