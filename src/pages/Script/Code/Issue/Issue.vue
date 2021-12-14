<template>
  <q-card-section class="issue">
    <q-card bordered flat style="margin-bottom: 20px">
      <div>
        <q-input
          dense
          class="GNL__toolbar-input"
          outlined
          v-model="SearchText"
          color="bg-grey-7"
          placeholder="搜索反馈"
          v-on:keyup.enter="Search"
          style="display: inline-block"
        >
          <template v-slot:prepend>
            <q-icon v-if="SearchText === ''" name="done" />
            <q-icon
              v-else
              name="clear"
              class="cursor-pointer"
              @click="SearchText = ''"
            />
          </template>
          <template v-slot:append>
            <q-btn
              icon="search"
              flat
              dense
              outline
              color="primary"
              @click="Search"
            />
          </template>
        </q-input>
        <q-select
          name="accepted_genres"
          v-model="accepted"
          multiple
          :options="options"
          color="primary"
          filled
          clearable
          dense
          label="筛选标签"
          style="width: 100px; display: inline-block"
        />
        <q-btn color="primary" label="创建反馈" />
      </div>
    </q-card>
    <q-card bordered flat>
      <q-card bordered style="padding: 10px">
        <a href="/123">2 打开</a>
        <a href="/123">3 处理</a>
      </q-card>
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

        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-avatar>
              <img src="https://cdn.quasar.dev/img/avatar2.jpg" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label
              lines="1"
              class="text-weight-bold"
              style="color: #895ae1"
              >反馈标题
              <q-chip color="red" text-color="white" size="xs">
                BUG
              </q-chip></q-item-label
            >
            <q-item-label caption lines="2" style="color: #895ae1">
              <a href="/123" style="color: rgba(0, 0, 0, 0.54)" target="_blank"
                >用户名</a
              >
              创建1天前 关闭
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
    <div class="flex flex-center">
      <TablePagination
        v-bind="page"
        :maxpage="maxPage"
        :maxlens="6"
        :max="10"
      />
    </div>
  </q-card-section>
</template>

<script lang="ts">
import { Cookies } from 'quasar';
import { defineComponent } from 'vue';
import TablePagination from 'components/TablePagination.vue';

export default defineComponent({
  components: { TablePagination },
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
      console.log(this.$store.state.issues.issueList);
      return this.$store.state.issues.issueList;
    },
    total() {
      return this.$store.state.issues.total;
    },
    maxPage() {
      return Math.ceil(this.$store.state.scripts.total / 20);
    },
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
