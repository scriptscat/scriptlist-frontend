<template>
  <q-card-section class="issue">
    <q-btn-group
      flat
      style="margin: 0px 0px 10px 0px; width: 100%"
      class="flex justify-between"
    >
      <q-btn v-if="script.archive" color="primary" outline>
        创建反馈
        <q-tooltip> 脚本以归档,不能反馈 </q-tooltip>
      </q-btn>
      <q-btn v-else color="primary" :to="'issue/new'" outline> 创建反馈 </q-btn>
      <q-card flat class="single flex justify-end">
        <q-select
          disable
          outlined
          v-model="state"
          :options="stateOptions"
          @update:model-value="stateChange"
          borderless
          dense
          options-dense
          label="状态"
          style="min-width: 120px"
          class="no-shadow"
        >
        </q-select>
        <q-select
          disable
          outlined
          v-model="issueTag"
          :options="issueTagOptions"
          @update:model-value="issueTagChange"
          borderless
          dense
          options-dense
          label="标签"
          style="min-width: 120px; margin-left: 10px"
        >
        </q-select>
      </q-card>
    </q-btn-group>
    <q-table
      no-data-label="暂无相关反馈"
      flat
      table-colspan="10"
      :rows-per-page-options="[20]"
      square
      bordered
      table-header-class=""
      style="border-bottom: 1px solid lightgrey"
      :rows="returnGoodsProgressData.datas"
      :columns="returnGoodsProgressData.columns"
      row-key="name"
    >
      <template v-slot:body-cell-catograry="props">
        <q-td :props="props" auto-width>
          <IssueLabel :labels="props.value" />
        </q-td>
      </template>
      <template v-slot:body-cell-state="props">
        <q-td :props="props" auto-width>
          <IssueStatus :status="props.value" />
        </q-td>
      </template>
      <template v-slot:body-cell-title="props">
        <q-td :props="props">
          <span>
            <div v-html="props.value" />
          </span>
        </q-td>
      </template>
    </q-table>
    <div v-if="maxPage > 1" class="flex flex-center" style="margin-top: 10px">
      <TablePagination
        v-bind="page"
        :reloadPage="reload"
        :maxpage="maxPage"
        :maxlens="6"
        :max="10"
      />
    </div>
  </q-card-section>
</template>

<script lang="ts">
import { Cookies, useMeta } from 'quasar';
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import { useRoute, RouteLocationNormalizedLoaded } from 'vue-router';
import { formatDate } from '@App/utils/utils';
import TablePagination from '@Components/TablePagination.vue';
import IssueLabel from '@Components/IssueLabel.vue';
import IssueStatus from '@App/components/IssueStatus.vue';

export default defineComponent({
  components: { TablePagination, IssueLabel, IssueStatus },
  preFetch({ store, currentRoute, ssrContext }) {
    if (!ssrContext) {
      return;
    }
    const cookies = process.env.SERVER ? Cookies.parseSSR(ssrContext) : Cookies;
    return store.dispatch('issues/fetchIssueList', {
      scriptId: currentRoute.params.id,
      page: parseInt(<string>currentRoute.query.page || '1'),
      count: 20,
      cookies: cookies,
    });
  },
  computed: {
    maxPage() {
      return Math.ceil(this.$store.state.issues.total / 20);
    },
  },
  setup() {
    useMeta({
      title: '反馈',
    });
    const returnGoodsProgressData = ref({
      columns: [
        {
          name: 'title',
          align: 'left',
          label: '标题',
          field: 'title',
        },
        {
          name: 'catograry',
          align: 'center',
          label: '标签',
          field: 'catograry',
        },
        {
          name: 'state',
          align: 'center',
          label: '状态',
          field: 'state',
          sortable: true,
        },
      ],
      datas: <
        {
          title: string;
          catograry: Array<string>[];
          state: number;
          todo: number;
        }[]
      >[],
    });
    const store = useStore();
    const route = useRoute();
    const dateformat = formatDate;
    const uid = ref();
    const id = computed(() => {
      return store.state.user.user.uid;
    });
    const script = computed(() => {
      return store.state.scripts.script || <DTO.Script>{};
    });
    let _list: DTO.Issue[] = store.state.issues.issueList;
    const list = computed({
      get: () => {
        return _list;
      },
      set: (val) => {
        returnGoodsProgressData.value.datas = [];
        val.forEach((val) => {
          returnGoodsProgressData.value.datas.push({
            todo: val.id,
            title:
              '<div class="text-caption" style="font-size:15px;"><a href="/script-show-page/' +
              script.value.id.toString() +
              '/issue/' +
              val.id.toString() +
              '/comment" class="issue-link">' +
              val.title +
              '</a></div>' +
              '<div class="text-caption text-grey">' +
              dateformat(val.createtime * 1000) +
              ' ' +
              val.username +
              '</div>',
            catograry: val.labels,
            state: val.status,
          });
        });
        _list = val;
      },
    });

    list.value.forEach((val) => {
      returnGoodsProgressData.value.datas.push({
        todo: val.id,
        title:
          '<div class="text-caption" style="font-size:15px;"><a href="/script-show-page/' +
          script.value.id.toString() +
          '/issue/' +
          val.id.toString() +
          '/comment" class="issue-link">' +
          val.title +
          '</a></div>' +
          '<div class="text-caption text-grey">' +
          dateformat(val.createtime * 1000) +
          ' ' +
          val.username +
          '</div>',
        catograry: val.labels,
        state: val.status,
      });
    });

    const page = ref(Number(route.query.page) || 1);
    return {
      script,
      page,
      returnGoodsProgressData,
      dateformat,
      uid,
      id,
      list,
      stateOptions: [],
      state: ref({ label: '建设中' }),
      issueTagOptions: [
        { label: '反馈BUG', value: 'bug' },
        { label: '请求新功能', value: 'feature' },
        { label: '提出问题', value: 'question' },
      ],
      issueTag: ref({ label: '建设中', value: '建设中' }),
    };
  },
  unmounted() {
    void this.$store.commit('issues/resetPreFetch');
  },
  mounted() {
    if (!this.$store.state.issues.preFetch) {
      void this.reload(this.$route);
    }
  },
  methods: {
    async reload(currentRoute: RouteLocationNormalizedLoaded) {
      await this.$store.dispatch('issues/fetchIssueList', {
        scriptId: currentRoute.params.id,
        page: parseInt(<string>currentRoute.query.page || '1'),
        count: 20,
      });
      this.list = this.$store.state.issues.issueList;
    },
    issueTagChange() {
      return '';
    },
    stateChange() {
      return '';
    },
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

.issue-link {
  color: gray;
  font-size: 16px;
}
</style>
