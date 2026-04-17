<script setup lang="ts">
import { computed } from "vue"
import SiteHeader from "../landing/SiteHeader.vue"
import SiteFooter from "../landing/SiteFooter.vue"

interface PostModule {
  frontmatter?: Record<string, string>
}

// Import metadata from all posts, eagerly
const modules = import.meta.glob<PostModule>("./posts/*.md", { eager: true })

const posts = computed(() => {
  return Object.entries(modules)
    .map(([path, mod]) => {
      const slug = path.match(/\/([^/]+)\.md$/)?.[1] ?? ""
      return {
        slug,
        title: mod.frontmatter?.title ?? slug,
        date: mod.frontmatter?.date ?? "",
        excerpt: mod.frontmatter?.excerpt ?? "",
        author: mod.frontmatter?.author ?? "",
        tags: (mod.frontmatter?.tags as any as string[]) ?? [],
      }
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
})

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
      <header class="mb-12 text-left">
        <h1 class="text-4xl font-bold text-gray-800 dark:text-gray-100">Blog</h1>
        <p class="mt-3 text-gray-500 dark:text-gray-400">
          Notes on building Zen, developer workflow, and productivity without the fluff.
        </p>
      </header>

      <ul class="space-y-8">
        <li
          v-for="post in posts"
          :key="post.slug"
          class="pb-8 border-b border-gray-100 dark:border-base-lvl-3 last:border-none last:pb-0"
        >
          <article class="text-left">
            <div class="flex items-center mb-2 space-x-3 text-xs text-gray-400">
              <time>{{ formatDate(post.date) }}</time>
              <span v-if="post.tags && post.tags.length">·</span>
              <span v-for="tag in post.tags" :key="tag" class="uppercase tracking-wide">
                {{ tag }}
              </span>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
              <router-link
                :to="`/blog/${post.slug}`"
                class="transition-colors hover:text-accent"
              >
                {{ post.title }}
              </router-link>
            </h2>
            <p class="mt-2 text-gray-600 dark:text-gray-400">{{ post.excerpt }}</p>
            <router-link
              :to="`/blog/${post.slug}`"
              class="inline-block mt-3 text-sm font-semibold text-accent hover:underline"
            >
              Read →
            </router-link>
          </article>
        </li>
      </ul>
    </main>
    <SiteFooter />
  </div>
</template>
