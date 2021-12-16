<template>
  <article
    class="viewer markdown-body"
    v-html="markdownHtml"
    ref="markdown"
  ></article>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { marked } from 'marked';
import 'prismjs/themes/prism.css';
import Prism from 'prismjs';
import 'github-markdown-css/github-markdown.css';

export default defineComponent({
  name: 'SubmitCode',
  props: {
    content: {
      type: String,
      default: '',
    },
  },
  computed: {
    markdownHtml() {
      return marked(this.content, {
        baseUrl: this.$route.path + (this.$route.path.endsWith('/') ? '' : '/'),
        mangle: true,
        gfm: true,
      });
    },
  },
  created() {
    if (process.env.CLIENT) {
      void this.$nextTick(() => {
        Prism.highlightAllUnder(<HTMLElement>this.$refs.markdown, true);
      });
    }
  },
});
</script>

