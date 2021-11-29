<template>
  <q-header bordered class="bg-grey-1 text-black" height-hint="64">
    <q-toolbar class="GNL__toolbar">
      <q-toolbar-title shrink class="row items-center no-wrap">
        <img
          :src="require('src/assets/cat.png')"
          style="width: 36px; vertical-align: middle; margin: 0px 10px 0px 12px"
        />
        <!-- <div class="text-h5">ScriptCat</div> -->
      </q-toolbar-title>
      <q-input
        dense
        class="GNL__toolbar-input"
        outlined
        v-model="SearchText"
        color="bg-grey-7"
        placeholder="脚本猫，让你的浏览器可以做更多的事情"
        v-on:keyup.enter="Search"
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
          <q-btn flat dense aria-label="Menu" icon="menu">
            筛选
            <q-menu anchor="bottom end" self="top end">
              <div class="q-pa-md" style="width: 500px">
                <div class="row items-center">
                  <div class="col-3 text-subtitle2">脚本类型</div>
                  <q-input dense v-model="exactPhrase" />
                  <div class="col-3 text-subtitle2">排序方式</div>
                  <div class="col-9">
                    <q-input dense v-model="hasWords" />
                  </div>

                  <div class="col-12 q-pt-lg row justify-end">
                    <q-btn
                      flat
                      dense
                      no-caps
                      color="grey-7"
                      size="md"
                      style="min-width: 68px"
                      label="确认"
                      v-close-popup
                    />
                  </div>
                </div>
              </div>
            </q-menu>
          </q-btn>
        </template>
      </q-input>
      <q-space />

      <div class="q-gutter-sm row items-center no-wrap">
        <q-btn v-if="$q.screen.gt.sm" dense flat icon="apps">
          <q-tooltip>Google Apps</q-tooltip>
        </q-btn>
        <q-btn round dense flat color="grey-8" icon="notifications">
          <!-- <q-badge color="red" text-color="white" floating>
              2
            </q-badge> -->
          <q-tooltip>to be design</q-tooltip>
        </q-btn>
        <q-btn round flat>
          <q-avatar size="26px">
            <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
          </q-avatar>
          <q-tooltip>Account</q-tooltip>
        </q-btn>
      </div>
    </q-toolbar>
  </q-header>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { fasGlobeAmericas, fasFlask } from '@quasar/extras/fontawesome-v5';
export default defineComponent({
  name: 'SearchLayout',
  setup() {
    const leftDrawerOpen = ref(false);
    const search = ref('');
    const showAdvanced = ref(false);
    const showDateOptions = ref(false);
    const exactPhrase = ref('');
    const hasWords = ref('');
    const excludeWords = ref('');
    const byWebsite = ref('');
    const byDate = ref('Any time');
    const router = useRouter();
    const SearchText = ref('');
    function onClear() {
      exactPhrase.value = '';
      hasWords.value = '';
      excludeWords.value = '';
      byWebsite.value = '';
      byDate.value = 'Any time';
    }
    function changeDate(option: string) {
      byDate.value = option;
      showDateOptions.value = false;
    }
    function Search() {
      return router.push({
        name: 'search',
        query: {
          keyword: '222',
        },
      });
    }
    return {
      leftDrawerOpen,
      search,
      showAdvanced,
      showDateOptions,
      exactPhrase,
      hasWords,
      excludeWords,
      byWebsite,
      byDate,
      SearchText,
      links1: [
        { icon: 'web', text: 'Top stories' },
        { icon: 'person', text: 'For you' },
        { icon: 'star_border', text: 'Favourites' },
        { icon: 'search', text: 'Saved searches' },
      ],
      links2: [
        { icon: 'flag', text: 'Canada' },
        { icon: fasGlobeAmericas, text: 'World' },
        { icon: 'place', text: 'Local' },
        { icon: 'domain', text: 'Business' },
        { icon: 'memory', text: 'Technology' },
        { icon: 'local_movies', text: 'Entertainment' },
        { icon: 'directions_bike', text: 'Sports' },
        { icon: fasFlask, text: 'Science' },
        { icon: 'fitness_center', text: 'Health ' },
      ],
      links3: [
        { icon: '', text: 'Language & region' },
        { icon: '', text: 'Settings' },
        { icon: 'open_in_new', text: 'Get the Android app' },
        { icon: 'open_in_new', text: 'Get the iOS app' },
        { icon: '', text: 'Send feedback' },
        { icon: 'open_in_new', text: 'Help' },
      ],
      onClear,
      changeDate,
      Search,
    };
  },
});
</script>

<style lang="sass">
.GNL
  &__toolbar
    height: 64px
  &__drawer-item
    line-height: 24px
    border-radius: 0 24px 24px 0
    margin-right: 12px
    .q-item__section--avatar
      .q-icon
        color: #5f6368
    .q-item__label
      color: #3c4043
      letter-spacing: .01785714em
      font-size: .875rem
      font-weight: 500
      line-height: 1.25rem
  &__drawer-footer-link
    color: inherit
    text-decoration: none
    font-weight: 500
    font-size: .75rem
    &:hover
      color: #000
</style>

<style lang="scss" scoped>
.GNL__toolbar-input {
  width: 900px;
  margin-left: 242px;
}
@media screen and (max-width: 554px) {
  .GNL__toolbar-input {
    width: 100%;
    margin-left: 10px;
  }
}
</style>
