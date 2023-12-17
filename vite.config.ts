import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";
import Markdown from "unplugin-vue-markdown/vite";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import Pages from "vite-plugin-pages";
import UnoCSS from "unocss/vite";
import { resolve } from "node:path";
import fs from "fs-extra";
import matter from "gray-matter";
import MarkdownItShikiji from "markdown-it-shikiji";
//@ts-ignore
import markdownItRuby from "markdown-it-ruby";

export default defineConfig({
  optimizeDeps: {
    include: [
      "vue",
      "vue-router",
      "@vueuse/core",
      "dayjs",
      "dayjs/plugin/localizedFormat",
    ],
  },
  resolve: {
    alias: [{ find: "~/", replacement: `${resolve(__dirname, "src")}/` }],
  },
  plugins: [
    UnoCSS(),
    Vue({
      include: [/\.vue$/, /\.md$/],
      reactivityTransform: true,
      script: {
        defineModel: true,
      },
    }),
    Markdown({
      wrapperComponent: (id) => "WrapperPost",
      wrapperClasses: "prose m-auto slide-enter-content",
      headEnabled: true,
      exportFrontmatter: false,
      exposeFrontmatter: false,
      exposeExcerpt: false,
      markdownItOptions: {
        quotes: "\"\"''",
      },
      async markdownItSetup(md) {
        md.use(
          await MarkdownItShikiji({
            themes: {
              dark: "vitesse-dark",
              light: "vitesse-light",
            },
            defaultColor: false,
            cssVariablePrefix: "--s-",
            transformers: [],
          })
        ).use(markdownItRuby);
      },
    }),
    AutoImport({
      dts: true,
      imports: ["vue", "vue-router", "@vueuse/core"],
    }),
    Pages({
      extensions: ["vue", "md"],
      dirs: "pages",
      extendRoute(route) {
        const path = resolve(__dirname, route.component.slice(1));

        if (!path.includes("projects.md") && path.endsWith(".md")) {
          const md = fs.readFileSync(path, "utf-8");
          const { data } = matter(md);
          route.meta = Object.assign(route.meta || {}, { frontmatter: data });
        }

        return route;
      },
    }),
    Components({
      extensions: ["vue", "md"],
      dts: true,
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      directoryAsNamespace: true,
    }),
  ],
  build: {
    rollupOptions: {
      onwarn(warning, next) {
        if (warning.code !== "UNUSED_EXTERNAL_IMPORT") next(warning);
      },
    },
  },
  ssgOptions: {
    formatting: "minify",
    format: "cjs",
  },
});
