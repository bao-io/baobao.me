import "@unocss/reset/tailwind.css";
import 'markdown-it-github-alerts/styles/github-colors-light.css'
import 'markdown-it-github-alerts/styles/github-colors-dark-class.css'
import 'markdown-it-github-alerts/styles/github-base.css'
import 'shikiji-twoslash/style-rich.css'
import "./styles/main.css";
import "./styles/prose.css";
import "./styles/markdown.css";

import "uno.css";

import { ViteSSG } from "vite-ssg";
import NProgress from "nprogress";
import App from "./App.vue";
import autoRoutes from "pages-generated";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat.js";
import { setupRouterScroller } from 'vue-router-better-scroller'

const routes = autoRoutes.map((i) => {
  return {
    ...i,
    alias: i.path.endsWith("/") ? `${i.path}index.html` : `${i.path}.html`,
  };
});

export const createApp = ViteSSG(App, { routes }, ({ router, isClient }) => {
  dayjs.extend(LocalizedFormat);
  if (isClient) {
    const html = document.querySelector('html')!
    setupRouterScroller(router, {
      selectors: {
        html(ctx) {
          // only do the sliding transition when the scroll position is not 0
          if (ctx.savedPosition?.top)
            html.classList.add('no-sliding')
          else
            html.classList.remove('no-sliding')
          return true
        },
      },
      behavior: 'auto',
    })

    router.beforeEach(() => {
      NProgress.start();
    });
    router.afterEach(() => {
      NProgress.done();
    });
  }
});
