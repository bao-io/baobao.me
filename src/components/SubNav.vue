<script setup lang="ts">
import { useRoute } from "vue-router";

const inactiveStyle = "opacity-20 hover:opacity-50";
const activeStyle = "opacity-100 underline";

const route = useRoute();
const router = useRouter();
const category = computed(() => route.params.category);
const categorys = Array.from(
  new Set(
    router
      .getRoutes()
      .filter(
        (i) =>
          i.path.startsWith("/posts") &&
          i.meta.frontmatter.date &&
          !i.meta.frontmatter.draft
      )
      .filter((i) => !i.path.endsWith(".html"))
      .flatMap((v) => v.meta.frontmatter.category)
      .filter(Boolean)
  )
);
</script>

<template>
  <div class="prose m-auto mb-8 select-none animate-none! op100!">
    <div mb-0 flex="~ col gap-1 sm:row sm:gap-3 wrap" text-3xl>
      <RouterLink
        to="/posts"
        class="!border-none"
        :class="route.path === '/posts' ? activeStyle : inactiveStyle"
      >
        All
      </RouterLink>
      <RouterLink
        v-for="(v, i) in categorys
          .filter((v) => v !== 'Others')
          .concat(categorys.includes('Others') ? ['Others'] : [])"
        :key="i"
        :to="'/categorys/' + v"
        class="!border-none"
        :class="v === category ? activeStyle : inactiveStyle"
      >
        {{ v }}
      </RouterLink>
    </div>
  </div>
</template>
