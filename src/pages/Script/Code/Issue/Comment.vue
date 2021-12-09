<template>
  <q-card-section class="issue">
    <q-card bordered flat style="margin-bottom: 20px">
      <q-item-section>
        <q-item-label lines="1" class="text-h5" style="padding: 6px"
          >反馈标题
          <q-chip color="red" text-color="white" size="xs"> BUG </q-chip>
          <q-btn color="white" text-color="black" size="sm" label="编辑" />
        </q-item-label>
        <q-item-label caption lines="2">
          <q-chip>打开</q-chip>
          <a href="/123" style="color: rgba(0, 0, 0, 0.54)" target="_blank"
            >用户名</a
          >
          创建1天前 打开 · 10 评论
        </q-item-label>
      </q-item-section>
    </q-card>
    <div class="row">
      <div class="col-8">
        <q-timeline color="secondary">
          <q-timeline-entry avatar="https://cdn.quasar.dev/img/avatar5.jpg">
            <template v-slot:title> 用户名 </template>
            <template v-slot:subtitle>评论在 10 天前 </template>
            <q-card class="my-card" flat bordered style="margin-bottom: 10px">
              <q-card-section horizontal>
                <q-card-section>
                  反馈内容（markdown） 反馈内容（markdown） 反馈内容（markdown）
                  反馈内容（markdown） 反馈内容（markdown） 反馈内容（markdown）
                  反馈内容（markdown） 反馈内容（markdown） 反馈内容（markdown）
                </q-card-section>
              </q-card-section>
            </q-card>
          </q-timeline-entry>

          <q-timeline-entry
            title="用户名"
            subtitle="评论在 10 天前"
            avatar="https://cdn.quasar.dev/img/avatar5.jpg"
          >
            <q-card class="my-card" flat bordered style="margin-bottom: 10px">
              <q-card-section horizontal>
                <q-card-section>
                  反馈内容（markdown） 反馈内容（markdown） 反馈内容（markdown）
                  反馈内容（markdown） 反馈内容（markdown） 反馈内容（markdown）
                  反馈内容（markdown） 反馈内容（markdown） 反馈内容（markdown）
                </q-card-section>
              </q-card-section>
            </q-card>
          </q-timeline-entry>
          <q-timeline-entry icon="check_circle">
            <template v-slot:subtitle> 用户名 在 11 天前 完成</template>
          </q-timeline-entry>
          <q-timeline-entry icon="local_offer">
            <template v-slot:subtitle> 用户名 在 10 天前 添加 xx 标签</template>
          </q-timeline-entry>
        </q-timeline>
      </div>
      <div class="col-4">
        <p>侧边栏内容（打标签、关注、删除反馈什么的）</p>
      </div>
    </div>
  </q-card-section>
</template>

<script lang="ts">
import { Cookies } from 'quasar';
import { defineComponent } from 'vue';
export default defineComponent({
  preFetch({ store, currentRoute, ssrContext }) {
    if (!ssrContext) {
      return;
    }
    const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies;
    return store.dispatch('issues/fetchCommentList', {
      id: currentRoute.params.id,
      page: 1,
      count: 20,
      cookies: cookies,
    });
  },

  components: {
    // issueList() {
    //   return this.$store.state.issues.issueList;
    // },
    // total() {
    //   return this.$store.state.issues.total;
    // },
  },
});
</script>

<style>
.issue a {
  text-decoration: none;
}

.issue a:hover {
  text-decoration: underline;
}

.chat .q-icon:hover {
  color: rgb(95, 164, 255);
}
</style>
