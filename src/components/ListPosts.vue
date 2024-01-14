<script setup lang="ts">
import { useRouter } from 'vue-router'
import { formatDate } from '~/logics'

const props = defineProps<{
  type?: string
  posts?: Post[]
  extra?: Post[]
}>()

const route = useRoute()
const router = useRouter()
const category = computed(() => route.params.category as string)
const routes = computed<Post[]>(() =>
  router
    .getRoutes()
    .filter(
      i =>
        i.path.startsWith('/posts')
        && i.meta.frontmatter.date
        && !i.meta.frontmatter.draft,
    )
    .filter(i => !i.path.endsWith('.html'))
    .filter(
      i =>
        !category.value || i.meta.frontmatter.category?.includes(category.value),
    )
    .map(i => ({
      path: i.meta.frontmatter.redirect || i.path,
      title: i.meta.frontmatter.title,
      date: i.meta.frontmatter.date,
      lang: i.meta.frontmatter.lang,
      duration: i.meta.frontmatter.duration,
      recording: i.meta.frontmatter.recording,
      upcoming: i.meta.frontmatter.upcoming,
      redirect: i.meta.frontmatter.redirect,
      place: i.meta.frontmatter.place,
    })),
)
const posts = computed(() =>
  [...(props.posts || routes.value), ...(props.extra || [])].sort(
    (a, b) => +new Date(b.date) - +new Date(a.date),
  ),
)

const getYear = (a: Date | string | number) => new Date(a).getFullYear()
const isFuture = (a?: Date | string | number) => a && new Date(a) > new Date()
function isSameYear(a?: Date | string | number, b?: Date | string | number) {
  return a && b && getYear(a) === getYear(b)
}
function isSameGroup(a: Post, b?: Post) {
  return isFuture(a.date) === isFuture(b?.date) && isSameYear(a.date, b?.date)
}

function getGroupName(p: Post) {
  if (isFuture(p.date))
    return 'Upcoming'
  return getYear(p.date)
}
</script>

<template>
  <ul>
    <template v-if="!posts.length">
      <div py2 op50>
        { nothing here yet }
      </div>
    </template>

    <template v-for="(route, idx) in posts" :key="route.path">
      <div
        v-if="!isSameGroup(route, posts[idx - 1])"

        slide-enter pointer-events-none relative h20 select-none
        :style="{
          '--enter-stage': idx - 2,
          '--enter-step': '60ms',
        }"
      >
        <span

          absolute left--3rem top--2rem text-8em color-transparent font-bold text-stroke-2 text-stroke-hex-aaa op10
        >{{ getGroupName(route) }}</span>
      </div>
      <div
        class="slide-enter"
        :style="{
          '--enter-stage': idx,
          '--enter-step': '60ms',
        }"
      >
        <component
          :is="route.path.includes('://') ? 'a' : 'RouterLink'"
          v-bind="
            route.path.includes('://')
              ? {
                href: route.path,
                target: '_blank',
                rel: 'noopener noreferrer',
              }
              : {
                to: route.path,
              }
          "
          class="item mb-6 mt-2 block font-normal no-underline"
        >
          <li class="no-underline" flex="~ col md:row gap-2 md:items-center">
            <div class="text-lg leading-1.2em">
              {{ route.title }}
            </div>

            <div flex="~ gap-2 items-center">
              <span
                v-if="route.redirect"

                i-carbon-arrow-up-right ml--1 mt--1 flex-none align-middle text-xs op50
                title="External"
              />
              <span
                v-if="route.inperson"

                i-ri:group-2-line flex-none align-middle op50
                title="In person"
              />
              <span
                v-if="route.recording || route.video"

                i-ri:film-line flex-none align-middle op50
                title="Provided in video"
              />
              <span
                v-if="route.radio"

                i-ri:radio-line flex-none align-middle op50
                title="Provided in radio"
              />

              <span ws-nowrap text-sm op50>
                {{ formatDate(route.date, true) }}
              </span>
              <span v-if="route.duration" ws-nowrap text-sm op40>· {{ route.duration }}</span>
              <span v-if="route.platform" ws-nowrap text-sm op40>· {{ route.platform }}</span>
              <span v-if="route.place" ws-nowrap text-sm op40 md:hidden>· {{ route.place }}</span>
            </div>
          </li>
          <div v-if="route.place" mt--2 hidden text-sm op50 md:block>
            {{ route.place }}
          </div>
        </component>
      </div>
    </template>
  </ul>
</template>
