<script setup lang="ts">
import { onMounted, reactive, ref } from "vue"
import { ElNotification, ElMessageBox } from "element-plus"
import { functions } from "@/plugins/useFirebase"

interface TokenMeta {
  uid: string
  label: string
  service: string
  created_at: number | null
  last_used_at: number | null
}

const state = reactive({
  tokens: [] as TokenMeta[],
  isLoading: false,
  isCreating: false,
  showCreateDialog: false,
  newLabel: "",
  generatedToken: "" as string,
  showGeneratedDialog: false,
})

const createApiTokenFn = functions.httpsCallable("createApiToken")
const listApiTokensFn = functions.httpsCallable("listApiTokens")
const revokeApiTokenFn = functions.httpsCallable("revokeApiToken")

const fetchTokens = async () => {
  state.isLoading = true
  try {
    const res = await listApiTokensFn()
    state.tokens = (res.data as any)?.tokens || []
  } catch (err: any) {
    ElNotification({
      type: "error",
      title: "Could not load tokens",
      message: err?.message || "Unknown error",
    })
  } finally {
    state.isLoading = false
  }
}

const createToken = async () => {
  state.isCreating = true
  try {
    const res = await createApiTokenFn({ label: state.newLabel || "mcp" })
    const data = res.data as any
    state.generatedToken = data.token
    state.newLabel = ""
    state.showCreateDialog = false
    state.showGeneratedDialog = true
    await fetchTokens()
  } catch (err: any) {
    ElNotification({
      type: "error",
      title: "Could not create token",
      message: err?.message || "Unknown error",
    })
  } finally {
    state.isCreating = false
  }
}

const revokeToken = async (token: TokenMeta) => {
  try {
    await ElMessageBox.confirm(
      `Revoke "${token.label}"? Any MCP client using it will stop working immediately.`,
      "Revoke token",
      {
        confirmButtonText: "Revoke",
        cancelButtonText: "Cancel",
        type: "warning",
      }
    )
  } catch {
    return
  }

  try {
    await revokeApiTokenFn({ uid: token.uid })
    ElNotification({ type: "success", title: "Token revoked" })
    await fetchTokens()
  } catch (err: any) {
    ElNotification({
      type: "error",
      title: "Could not revoke",
      message: err?.message || "Unknown error",
    })
  }
}

const copyGenerated = async () => {
  try {
    await navigator.clipboard.writeText(state.generatedToken)
    ElNotification({ type: "success", title: "Token copied to clipboard" })
  } catch {
    ElNotification({
      type: "warning",
      title: "Copy failed",
      message: "Select the token field manually to copy.",
    })
  }
}

const closeGeneratedDialog = () => {
  state.generatedToken = ""
  state.showGeneratedDialog = false
}

const formatDate = (ms: number | null) => {
  if (!ms) return "never"
  const diff = Date.now() - ms
  if (diff < 60_000) return "just now"
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  if (diff < 2_592_000_000) return `${Math.floor(diff / 86_400_000)}d ago`
  return new Date(ms).toLocaleDateString()
}

onMounted(() => {
  fetchTokens()
})
</script>

<template>
  <div class="px-6 py-6 text-left text-gray-700 dark:text-gray-200">
    <header class="mb-4">
      <h3 class="text-lg font-bold">API tokens</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Generate tokens to drive Zen from external tools — the MCP server, CLIs, scripts, or an AI agent.
        Each token has full access to your account. Revoke anytime.
      </p>
    </header>

    <div class="flex justify-between mb-4">
      <div class="text-xs text-gray-500 dark:text-gray-400">
        {{ state.tokens.length }} active token{{ state.tokens.length === 1 ? "" : "s" }}
      </div>
      <button
        type="button"
        class="flex items-center h-10 px-4 space-x-2 text-sm font-semibold text-white transition-colors rounded-md bg-accent hover:opacity-90 focus:outline-none"
        @click="state.showCreateDialog = true"
      >
        <i class="fa fa-plus" />
        <span>Generate token</span>
      </button>
    </div>

    <div v-if="state.isLoading" class="py-10 text-sm text-center text-gray-400">Loading…</div>

    <div
      v-else-if="!state.tokens.length"
      class="py-10 text-sm text-center text-gray-400 border-2 border-dashed rounded-md border-gray-200 dark:border-base-lvl-3"
    >
      No tokens yet. Generate one to connect an MCP client.
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="token in state.tokens"
        :key="token.uid"
        class="flex items-center p-3 space-x-3 border-2 rounded-md border-gray-200 dark:border-base-lvl-3"
      >
        <div class="flex items-center justify-center w-10 h-10 text-gray-400 bg-gray-100 rounded-md dark:bg-base-lvl-1">
          <i class="fa fa-key" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold truncate">{{ token.label }}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            Created {{ formatDate(token.created_at) }}
            <span class="mx-1">·</span>
            Last used {{ formatDate(token.last_used_at) }}
          </div>
        </div>
        <button
          type="button"
          class="h-8 px-3 text-xs text-gray-500 transition-colors border rounded-md hover:text-red-500 hover:border-red-500 focus:outline-none dark:border-base-lvl-3"
          title="Revoke this token"
          @click="revokeToken(token)"
        >
          Revoke
        </button>
      </li>
    </ul>

    <!-- Create dialog -->
    <div
      v-if="state.showCreateDialog"
      class="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/60"
      @click.self="state.showCreateDialog = false"
    >
      <div class="w-full max-w-md p-6 bg-white rounded-lg shadow-xl dark:bg-base-lvl-2">
        <h4 class="mb-4 text-lg font-bold">Generate new token</h4>
        <label class="block mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
          Label (for your reference)
        </label>
        <input
          v-model="state.newLabel"
          type="text"
          placeholder="e.g. Claude Desktop"
          maxlength="60"
          class="w-full h-10 px-3 mb-4 text-sm border-2 rounded-md border-gray-200 dark:bg-base-lvl-1 dark:border-base-lvl-3 dark:text-gray-200 focus:outline-none focus:border-accent"
          @keyup.enter="createToken"
        />
        <div class="flex justify-end space-x-2">
          <button
            type="button"
            class="h-10 px-4 text-sm text-gray-500 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-base-lvl-1 focus:outline-none"
            @click="state.showCreateDialog = false"
          >
            Cancel
          </button>
          <button
            type="button"
            class="h-10 px-4 text-sm font-semibold text-white transition-colors rounded-md bg-accent hover:opacity-90 focus:outline-none disabled:opacity-50"
            :disabled="state.isCreating"
            @click="createToken"
          >
            <i v-if="state.isCreating" class="mr-1 fa fa-spinner fa-pulse" />
            Generate
          </button>
        </div>
      </div>
    </div>

    <!-- Generated token dialog (shown once) -->
    <div
      v-if="state.showGeneratedDialog"
      class="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-black/60"
    >
      <div class="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-base-lvl-2">
        <h4 class="mb-2 text-lg font-bold">Your new API token</h4>
        <div class="p-3 mb-4 text-sm border rounded-md border-yellow-400/60 bg-yellow-50/50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300">
          <i class="mr-2 fa fa-exclamation-triangle" />
          <strong>Save this now — you won't see it again.</strong>
          If you lose it, revoke it and generate a new one.
        </div>
        <div class="flex items-center mb-4 overflow-hidden border-2 rounded-md border-gray-200 dark:border-base-lvl-3">
          <code class="flex-1 px-3 py-2 overflow-x-auto font-mono text-xs whitespace-nowrap bg-gray-50 dark:bg-base-lvl-1">
            {{ state.generatedToken }}
          </code>
          <button
            type="button"
            class="h-10 px-4 text-sm font-semibold text-white transition-colors bg-accent hover:opacity-90 focus:outline-none"
            @click="copyGenerated"
          >
            <i class="mr-1 fa fa-copy" /> Copy
          </button>
        </div>
        <p class="mb-4 text-xs text-gray-500 dark:text-gray-400">
          Set this as <code>ZEN_API_TOKEN</code> in your MCP client config. See the
          <a href="https://github.com/jesusantguerrero/zen/blob/master/mcp-server/README.md" target="_blank" class="underline text-accent">MCP server README</a>
          for the full config example.
        </p>
        <div class="flex justify-end">
          <button
            type="button"
            class="h-10 px-4 text-sm font-semibold text-white transition-colors rounded-md bg-accent hover:opacity-90 focus:outline-none"
            @click="closeGeneratedDialog"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
