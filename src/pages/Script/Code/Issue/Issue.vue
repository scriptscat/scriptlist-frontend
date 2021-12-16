<template>
  <q-card-section class="issue">
    <q-item-section class="flex flex-left"> </q-item-section>
    <q-card-section>
      <q-btn-group flat style="margin: 0px 0px 10px 0px">
        <q-btn color="primary" :to="'issue/new'" outline> 创建反馈 </q-btn>
      </q-btn-group>
      <q-table
        flat
        table-colspan="10"
        :rows-per-page-options="[10]"
        hide-no-data
        square
        bordered
        table-header-class="bg-grey-1"
        style="border-bottom: 1px solid lightgrey"
        :rows="returnGoodsProgressData.datas"
        :columns="returnGoodsProgressData.columns"
        row-key="name"
      >
        <template v-slot:body-cell-catograry="props">
          <q-td :props="props" auto-width>
            <span v-for="(item, index) in props.value" v-bind:key="index">
              <q-chip
                v-if="item === 'bug'"
                square
                outline
                color="red"
                class="bg-red-1 no-border-radius"
                size="sm"
              >
                BUG
              </q-chip>
              <q-chip
                v-else-if="item === 'feature'"
                square
                outline
                color="primary"
                class="bg-blue-1 no-border-radius"
                size="sm"
              >
                新功能
              </q-chip>
              <q-chip
                v-else-if="item === 'question'"
                square
                outline
                color="warning"
                class="bg-orange-1 no-border-radius"
                size="sm"
              >
                问题
              </q-chip>
            </span>
          </q-td>
        </template>
        <template v-slot:body-cell-state="props">
          <q-td :props="props" auto-width>
            <span v-if="props.value === 1">
              <q-icon name="lens" color="deep-orange" class="q-mx-sm" />
              <q-chip
                square
                outline
                color="deep-orange"
                class="bg-deep-orange-1 no-border-radius"
                size="sm"
              >
                待处理
              </q-chip>
            </span>
            <span v-else-if="props.value === 3">
              <q-icon
                name="radio_button_checked"
                color="positive"
                class="q-mx-sm"
              />
              <q-chip
                square
                outline
                color="positive"
                class="bg-positive-1 no-border-radius"
                size="sm"
              >
                完成
              </q-chip>
            </span>
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
    </q-card-section>
    <div v-if="maxPage > 1" class="flex flex-center">
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
import { Cookies } from 'quasar';
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import { useRoute, RouteLocationNormalizedLoaded } from 'vue-router';
import { formatDate } from '@App/utils/utils';
import TablePagination from '@Components/TablePagination.vue';

export default defineComponent({
  components: { TablePagination },
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
    const returnGoodsProgressData = ref({
      columns: [
        {
          name: 'title',
          align: 'left',
          label: '反馈标题',
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

    let _list: DTO.IssueList[] = store.state.issues.issueList;
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
              store.state.scripts.script.id.toString() +
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
          store.state.scripts.script.id.toString() +
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
      page,
      returnGoodsProgressData,
      dateformat,
      uid,
      id,
      list,
    };
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
