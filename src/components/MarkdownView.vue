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
  name: 'MarkdownView',
  props: {
    id: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
  },
  computed: {
    markdownHtml() {
      return this.$store.state.other.markdown[this.id];
    },
  },
  created() {
    if (process.env.CLIENT) {
      void this.$nextTick(() => {
        Prism.highlightAllUnder(<HTMLElement>this.$refs.markdown, true);
      });
    } else {
      this.$store.commit('other/addMarkdown', {
        id: this.id,
        content: marked(this.content, {
          baseUrl: this.$route.path,
          mangle: true,
          gfm: true,
          renderer: new MarkdownRenderer(),
        }),
      });
    }
  },
});

class MarkdownRenderer extends marked.Renderer {
  link(href: string, title: string, text: string) {
    const baseUrl = this.options.baseUrl || '';
    console.log(href);
    if (!(href.startsWith('http://') || href.startsWith('https://'))) {
      if (href.startsWith('.')) {
        href = baseUrl + href.substring(1);
      } else if (
        href.startsWith('/') ||
        href.startsWith('#') ||
        href.startsWith('?')
      ) {
        href = baseUrl + href;
      } else {
        href = baseUrl + '/' + href;
      }
    }
    return (
      '<a href="' +
      href +
      '"' +
      (title ? ' title="' + title + '"' : '') +
      '>' +
      text +
      '</a>'
    );
  }
}
</script>

