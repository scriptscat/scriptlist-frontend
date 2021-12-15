<template>
  <q-card-section class="issue">
    <q-card bordered flat>
      <q-item-section class="flex flex-left">
        <a href="/123">2 打开</a>
        <a href="/123">3 处理</a>
        <q-btn-group flat>
          <q-btn color="primary"> 创建反馈 </q-btn>
        </q-btn-group>
      </q-item-section>
      <q-separator />
      <q-list separator>
        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-avatar>
              <img src="https://cdn.quasar.dev/img/avatar2.jpg" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label lines="1" class="text-weight-bold"
              >反馈标题
              <q-chip color="red" text-color="white" size="xs">
                BUG
              </q-chip></q-item-label
            >
            <q-item-label caption lines="2">
              <a href="/123" style="color: rgba(0, 0, 0, 0.54)" target="_blank"
                >用户名</a
              >
              创建1天前 打开
            </q-item-label>
          </q-item-section>

          <q-item-section side top
            ><span class="chat"
              ><q-icon name="chat_bubble_outline">1</q-icon><span>1</span></span
            ></q-item-section
          >
        </q-item>
      </q-list>
    </q-card>
  </q-card-section>
</template>

<script lang="ts">
import { Cookies } from 'quasar';
import { defineComponent } from 'vue';

export default defineComponent({
  components: {},
  preFetch({ store, currentRoute, ssrContext }) {
    if (!ssrContext) {
      return;
    }
    const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies;
    return store.dispatch('issues/fetchIssueList', {
      scriptId: currentRoute.params.id,
      page: parseInt(<string>currentRoute.query.page),
      count: 20,
      cookies: cookies,
    });
  },
  computed: {
    list() {
      return this.$store.state.issues.issueList;
    },
    total() {
      return this.$store.state.issues.total;
    },
    maxPage() {
      return Math.ceil(this.$store.state.scripts.total / 20);
    },
  },
  mounted() {
    console.log(this.total);
  },
  data() {
    return {
      SearchText: '',
      page: parseInt(<string>this.$route.query.page) || 1,
    };
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
