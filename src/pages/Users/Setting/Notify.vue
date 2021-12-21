<template>
  <div class="page-padding padding-normal">
    <q-card style="margin: 30px 0px">
      <div class="column">
        <q-checkbox
          v-model="options.at"
          label="艾特我时发送邮件通知"
          color="cyan"
        />
        <q-checkbox
          v-model="options.create_script"
          label="关注的用户创建脚本时发送邮件通知"
          color="cyan"
        />
        <q-checkbox
          v-model="options.score"
          label="当我的脚本被评分时发送通知"
          color="cyan"
        />

        <q-checkbox
          v-model="options.script_update"
          label="关注的脚本更新时发送通知"
          color="cyan"
        />
        <q-checkbox
          v-model="options.script_issue"
          label="关注的脚本创建反馈时发送通知"
          color="cyan"
        />
        <q-checkbox
          v-model="options.script_issue_comment"
          label="关注的反馈有新评论时发送通知"
          color="cyan"
        />
      </div>
    </q-card>
  </div>
</template>

<script>
import { fetchUserConfig, updateUserNotifyConfig } from '@App/apis/user';
import { useMeta } from 'quasar';
import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    useMeta({ title: '通知设置' });
    return {};
  },
  async created() {
    if (process.env.CLIENT) {
      let config = (await fetchUserConfig()).data.data;
      this.options = config.notify;
      this.$watch(
        () => {
          return this.options;
        },
        () => {
          void updateUserNotifyConfig(this.options);
        },
        { deep: true }
      );
      return;
    }
  },
  data() {
    return {
      options: {},
    };
  },
});
</script>

<style >
</style>
