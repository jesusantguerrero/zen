<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { ElNotification } from "element-plus"
import { functions, firebaseState } from "@/plugins/useFirebase"

const router = useRouter()

interface AdminUser {
  uid: string
  email: string
  name: string
  enabled: boolean
  limit_count: number
  period: "daily" | "monthly" | "total"
  model: string | null
  used: number
  reset_at: number | null
}

const MODELS = [
  { value: null, label: "Default (env)" },
  { value: "claude-sonnet-4-5", label: "Claude Sonnet 4.5" },
  { value: "claude-opus-4", label: "Claude Opus 4" },
  { value: "claude-haiku-4-5", label: "Claude Haiku 4.5" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4o-mini", label: "GPT-4o mini" },
]

const LIMITS = [3, 10, 20, 50, 100, 500]
const PERIODS: Array<"daily" | "monthly" | "total"> = ["daily", "monthly", "total"]

const state = reactive({
  users: [] as AdminUser[],
  summary: null as null | {
    total_used: number
    total_budget: number
    users_active: number
    next_reset_at: number | null
  },
  isLoading: true,
  search: "",
})

// Gate at mount — redirect non-admins
onMounted(async () => {
  if (!firebaseState.isAdmin) {
    router.replace({ name: "zenboard" })
    return
  }
  await fetchAll()
})

const fetchAll = async () => {
  state.isLoading = true
  try {
    const [listRes, summaryRes] = await Promise.all([
      functions.httpsCallable("adminListUsers")(),
      functions.httpsCallable("adminUsageSummary")(),
    ])
    state.users = (listRes.data as any)?.users || []
    state.summary = (summaryRes.data as any) || null
  } catch (err: any) {
    ElNotification({
      type: "error",
      title: "Could not load users",
      message: err?.message || "Unknown error",
    })
  } finally {
    state.isLoading = false
  }
}

const filteredUsers = computed(() => {
  const q = state.search.trim().toLowerCase()
  if (!q) return state.users
  return state.users.filter(
    (u) =>
      u.email.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      u.uid.toLowerCase().includes(q)
  )
})

const pendingSaves = reactive<Record<string, ReturnType<typeof setTimeout>>>({})

const updateUserAccess = (user: AdminUser, patch: Partial<AdminUser>) => {
  Object.assign(user, patch)
  if (pendingSaves[user.uid]) clearTimeout(pendingSaves[user.uid])
  pendingSaves[user.uid] = setTimeout(async () => {
    delete pendingSaves[user.uid]
    try {
      const res = await functions.httpsCallable("adminUpdateUserAccess")({
        uid: user.uid,
        enabled: user.enabled,
        limit_count: user.limit_count,
        period: user.period,
        model: user.model,
      })
      const returned = res.data as any
      if (returned && typeof returned.reset_at === "number") {
        user.reset_at = returned.reset_at
      }
    } catch (err: any) {
      ElNotification({
        type: "error",
        title: `Save failed for ${user.name}`,
        message: err?.message || "Unknown error",
      })
    }
  }, 500)
}

const resetUser = async (user: AdminUser) => {
  try {
    await functions.httpsCallable("adminResetUser")({ uid: user.uid })
    user.used = 0
    ElNotification({ type: "success", title: `${user.name} reset` })
    // Refresh summary in the background
    functions.httpsCallable("adminUsageSummary")().then((r) => {
      state.summary = (r.data as any) || null
    })
  } catch (err: any) {
    ElNotification({
      type: "error",
      title: "Reset failed",
      message: err?.message || "Unknown error",
    })
  }
}

const formatReset = (ms: number | null) => {
  if (!ms) return "—"
  const diff = ms - Date.now()
  if (diff < 0) return "due now"
  const hours = Math.floor(diff / 3600000)
  if (hours < 24) return `in ${hours}h`
  return `in ${Math.floor(hours / 24)}d`
}
</script>

<template>
  <div class="pt-24 pb-20 mx-5 text-left md:pt-28 md:mx-28">
    <header class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-4">
        <router-link
          to="/zenboard"
          class="text-sm text-gray-400 transition-colors hover:text-accent"
        >
          ←
        </router-link>
        <h1 class="text-2xl font-bold text-gray-400 dark:text-gray-300">
          Admin — Users
        </h1>
      </div>
      <div
        v-if="state.summary"
        class="flex items-center px-3 py-2 space-x-2 text-xs text-gray-500 border-2 border-gray-200 rounded-md dark:text-gray-300 dark:border-base-lvl-3"
      >
        <i class="fa fa-sparkles text-accent" />
        <span class="font-bold text-accent">{{ state.summary.total_used }}</span>
        <span class="text-gray-400">/</span>
        <span>{{ state.summary.total_budget }}</span>
        <span class="text-gray-400">used</span>
        <span class="mx-1 text-gray-400">·</span>
        <span>{{ state.summary.users_active }} active</span>
        <span v-if="state.summary.next_reset_at" class="mx-1 text-gray-400">·</span>
        <span v-if="state.summary.next_reset_at">resets {{ formatReset(state.summary.next_reset_at) }}</span>
      </div>
    </header>

    <div class="flex items-center justify-between mb-4">
      <h2 class="text-sm font-bold tracking-wide uppercase text-gray-500 dark:text-gray-400">
        User AI Access · {{ state.users.length }} users
      </h2>
      <input
        v-model="state.search"
        type="search"
        placeholder="Search email / name / uid"
        class="h-10 px-3 text-sm border-2 rounded-md w-72 border-gray-200 dark:bg-base-lvl-1 dark:border-base-lvl-3 dark:text-gray-200 focus:outline-none focus:border-accent"
      />
    </div>

    <div
      v-if="state.isLoading"
      class="py-20 text-sm text-center text-gray-400"
    >
      Loading users…
    </div>

    <div
      v-else-if="!filteredUsers.length"
      class="py-20 text-sm text-center text-gray-400 border-2 border-dashed rounded-md border-gray-200 dark:border-base-lvl-3"
    >
      No users match "{{ state.search }}"
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="user in filteredUsers"
        :key="user.uid"
        class="flex items-center p-4 space-x-4 bg-white border-2 rounded-md dark:bg-base-lvl-2 border-gray-200 dark:border-base-lvl-3"
      >
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-gray-700 truncate dark:text-gray-200">
            {{ user.name }}
          </div>
          <div class="text-xs text-gray-400">
            {{ user.email }} · {{ user.uid.slice(0, 8) }}…
          </div>
        </div>

        <!-- Enabled toggle -->
        <label class="flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            :checked="user.enabled"
            class="w-4 h-4 mr-1"
            @change="updateUserAccess(user, { enabled: ($event.target as HTMLInputElement).checked })"
          />
          <span class="text-xs text-gray-500 dark:text-gray-400">Enabled</span>
        </label>

        <!-- Limit -->
        <select
          :value="user.limit_count"
          class="h-8 px-2 text-xs text-gray-700 border-2 rounded border-gray-200 dark:bg-base-lvl-1 dark:border-base-lvl-3 dark:text-gray-200 focus:outline-none focus:border-accent"
          @change="updateUserAccess(user, { limit_count: Number(($event.target as HTMLSelectElement).value) })"
        >
          <option v-for="n in LIMITS" :key="n" :value="n">{{ n }}</option>
        </select>

        <!-- Period -->
        <select
          :value="user.period"
          class="h-8 px-2 text-xs text-gray-700 border-2 rounded border-gray-200 dark:bg-base-lvl-1 dark:border-base-lvl-3 dark:text-gray-200 focus:outline-none focus:border-accent"
          @change="updateUserAccess(user, { period: ($event.target as HTMLSelectElement).value as any })"
        >
          <option v-for="p in PERIODS" :key="p" :value="p">{{ p }}</option>
        </select>

        <!-- Model -->
        <select
          :value="user.model || ''"
          class="h-8 px-2 text-xs text-gray-700 border-2 rounded border-gray-200 dark:bg-base-lvl-1 dark:border-base-lvl-3 dark:text-gray-200 focus:outline-none focus:border-accent"
          @change="updateUserAccess(user, { model: ($event.target as HTMLSelectElement).value || null })"
        >
          <option v-for="m in MODELS" :key="m.label" :value="m.value || ''">{{ m.label }}</option>
        </select>

        <!-- Used counter -->
        <div class="text-xs text-gray-500 dark:text-gray-400 shrink-0">
          <span class="font-bold text-accent">{{ user.used }}</span>
          <span class="mx-1 text-gray-400">/</span>
          <span>{{ user.limit_count }}</span>
        </div>

        <!-- Reset -->
        <button
          type="button"
          class="h-8 px-2 text-xs text-gray-500 border-2 rounded hover:border-red-400 hover:text-red-500 border-gray-200 focus:outline-none dark:border-base-lvl-3 shrink-0"
          title="Reset counter"
          @click="resetUser(user)"
        >
          Reset
        </button>
      </li>
    </ul>
  </div>
</template>
