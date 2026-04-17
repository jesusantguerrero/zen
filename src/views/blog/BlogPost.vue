<script setup lang="ts">
import { computed } from "vue"
import { useRoute } from "vue-router"
import SiteHeader from "../landing/SiteHeader.vue"
import SiteFooter from "../landing/SiteFooter.vue"

interface PostModule {
  default: any
  frontmatter?: Record<string, string>
}

const modules = import.meta.glob<PostModule>("./posts/*.md", { eager: true })

const route = useRoute()
const slug = computed(() => (route.params.slug as string) || "")

const current = computed(() => {
  for (const [path, mod] of Object.entries(modules)) {
    const thisSlug = path.match(/\/([^/]+)\.md$/)?.[1]
    if (thisSlug === slug.value) return { path, mod }
  }
  return null
})

const PostComponent = computed(() => current.value?.mod.default || null)
const frontmatter = computed(() => current.value?.mod.frontmatter || {})

const formatDate = (iso: string) => {
  if (!iso) return ""
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return iso
  }
}
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-base-lvl-1">
    <div class="px-10 bg-secondary md:px-0">
      <SiteHeader class="w-full mb-10" />
    </div>
    <main class="max-w-3xl px-6 py-16 mx-auto">
      <router-link
        to="/blog"
        class="inline-block mb-8 text-sm text-gray-400 transition-colors hover:text-accent"
      >
        ← All posts
      </router-link>

      <template v-if="PostComponent">
        <header class="mb-10 text-left">
          <div class="flex items-center mb-3 space-x-3 text-xs text-gray-400">
            <time>{{ formatDate(frontmatter.date) }}</time>
            <span v-if="frontmatter.author">·</span>
            <span v-if="frontmatter.author">{{ frontmatter.author }}</span>
          </div>
        </header>
        <article
          class="prose prose-lg text-left dark:prose-invert prose-headings:text-gray-800 dark:prose-headings:text-gray-100 prose-a:text-accent max-w-none"
        >
          <component :is="PostComponent" />
        </article>
      </template>

      <div v-else class="py-20 text-center text-gray-400">
        <h1 class="text-2xl font-bold">Post not found</h1>
        <router-link to="/blog" class="inline-block mt-4 text-sm font-semibold text-accent hover:underline">
          ← Back to blog
        </router-link>
      </div>
    </main>
    <SiteFooter />
  </div>
</template>
