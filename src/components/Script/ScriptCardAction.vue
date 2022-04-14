<template>
  <q-btn-group flat>
    <q-btn
      flat
      icon="star"
      size="sm"
      color="light-blue-10"
      type="a"
      :target="target"
      :to="{ name: 'comment', params: { id: id } }"
    >
      <q-tooltip>评分</q-tooltip>
    </q-btn>
    <q-separator vertical inset />
    <q-btn
      flat
      icon="chat"
      size="sm"
      color="light-blue-10"
      type="a"
      :target="target"
      :to="{ name: 'issue', params: { id: id } }"
    >
      <q-tooltip>反馈</q-tooltip>
    </q-btn>
    <q-separator vertical inset="1" />
    <q-btn
      class="share-script-btn"
      flat
      icon="share"
      size="sm"
      color="light-blue-10"
      @click="shareScript"
    >
      <q-tooltip>分享</q-tooltip>
    </q-btn>
    <q-separator vertical inset="1" />
    <!-- <q-btn flat icon="more_horiz" size="sm" color="light-blue-10">
      <q-tooltip>更多</q-tooltip>
    </q-btn> -->
    <!-- <q-separator vertical inset="2" /> -->
  </q-btn-group>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ClipboardJS from 'clipboard';
export default defineComponent({
  name: 'SubmitCode',
  props: {
    id: {
      type: Number,
      default: 0,
    },
    name: {
      type: String,
      default: '',
    },
    target: {
      type: String,
      default: '_blank',
    },
  },
  methods: {
    shareScript() {
      new ClipboardJS('.share-script-btn', {
        text: () => {
          return (
            this.name +
            '\n' +
            window.location.origin +
            '/script-show-page/' +
            this.id.toString()
          );
        },
      });
      this.$q.notify('复制成功');
    },
  },
});
</script>
