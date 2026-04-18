<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { useOnboarding } from "@/composables/useOnboarding"

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: "update:isOpen", value: boolean): void
  (e: "closed"): void
}>()

const { seedSampleTasks, isSeeding, hasSeededSamples, hideWelcome } = useOnboarding()
const router = useRouter()

const isOpenLocal = ref(false)
watch(
  () => props.isOpen,
  (v) => (isOpenLocal.value = v),
  { immediate: true }
)

interface Step {
  id: string
  title: string
  body: string
  bullets?: string[]
  primary: string
  secondary?: string
}

const steps: Step[] = [
  {
    id: "intro",
    title: "Welcome to Zen",
    body:
      "Zen runs the developer workflow: Plan → Decide → Work → Standup. Four sections, one loop, no tab-switching.",
    bullets: [
      "🧭 Matrix to decide what matters",
      "⏱ Pomodoro to protect your focus",
      "✅ Standup to prove you shipped",
    ],
    primary: "Show me around",
    secondary: "Skip tour",
  },
  {
    id: "matrix",
    title: "Step 1 — Plan",
    body:
      "The Eisenhower Matrix forces a decision: is this urgent + important (TODO), important-not-urgent (SCHEDULE), urgent-not-important (DELEGATE), or neither (DELETE)?",
    bullets: [
      "TODO = do first, today",
      "SCHEDULE = plan and protect time",
      "DELEGATE = hand off or batch",
      "DELETE = drop without guilt",
    ],
    primary: "Next",
  },
  {
    id: "zenboard",
    title: "Step 2 — Work",
    body:
      "The Zenboard is your daily home. You'll see today's TODO on the left, a Pomodoro timer attached to each task, and a lineup of what's next on the right.",
    bullets: [
      "Shift+K to quick-add a task",
      "Cmd/Ctrl+K for the command palette",
      "Shift+F for full-screen focus mode",
    ],
    primary: "Next",
  },
  {
    id: "standup",
    title: "Step 3 — Standup",
    body:
      "Each morning, Zen auto-builds your standup from yesterday's completed tasks and tracked time. Paste it into Slack in 10 seconds.",
    primary: "Next",
  },
  {
    id: "samples",
    title: "Give you a head start?",
    body:
      "We can prefill your matrix with 7 sample tasks (across all 4 quadrants) so you can see the flow in action. Mark them done as you go — or delete any that don't fit.",
    bullets: [
      "Sample tasks teach the mechanics",
      "You can delete them anytime",
      "Skip this if you want a clean slate",
    ],
    primary: "Yes, prefill",
    secondary: "Skip — start empty",
  },
]

const index = ref(0)
const current = computed(() => steps[index.value])
const isLast = computed(() => index.value === steps.length - 1)

const next = () => {
  if (!isLast.value) index.value += 1
}
const prev = () => {
  if (index.value > 0) index.value -= 1
}
const finish = async (seed: boolean) => {
  if (seed && !hasSeededSamples.value) {
    await seedSampleTasks()
  }
  await hideWelcome()
  isOpenLocal.value = false
  emit("update:isOpen", false)
  emit("closed")
  router.push({ name: "zenboard" })
}

const handlePrimary = async () => {
  if (current.value.id === "samples") {
    await finish(true)
  } else {
    next()
  }
}
const handleSecondary = async () => {
  if (current.value.id === "intro") {
    await finish(false)
  } else if (current.value.id === "samples") {
    await finish(false)
  } else {
    prev()
  }
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpenLocal"
      class="fixed inset-0 z-[120] flex items-center justify-center px-4 bg-black/70"
    >
      <div class="w-full max-w-lg overflow-hidden bg-white rounded-xl shadow-2xl dark:bg-base-lvl-2">
        <!-- Progress bar -->
        <div class="flex h-1 bg-gray-100 dark:bg-base-lvl-1">
          <div
            v-for="(step, i) in steps"
            :key="step.id"
            class="flex-1 transition-colors"
            :class="i <= index ? 'bg-accent' : ''"
          ></div>
        </div>

        <div class="p-8 text-left">
          <div class="mb-2 text-xs font-bold tracking-wide text-gray-400 uppercase">
            {{ index + 1 }} of {{ steps.length }}
          </div>
          <h2 class="mb-3 text-2xl font-bold text-gray-800 dark:text-gray-100">
            {{ current.title }}
          </h2>
          <p class="mb-4 text-sm text-gray-600 dark:text-gray-300">
            {{ current.body }}
          </p>
          <ul v-if="current.bullets" class="mb-6 space-y-2 text-sm">
            <li
              v-for="bullet in current.bullets"
              :key="bullet"
              class="flex items-start text-gray-700 dark:text-gray-200"
            >
              <span class="mr-2 text-accent">•</span>
              <span>{{ bullet }}</span>
            </li>
          </ul>

          <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-base-lvl-3">
            <button
              v-if="current.secondary"
              type="button"
              class="text-sm text-gray-500 transition-colors hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none disabled:opacity-50"
              :disabled="isSeeding"
              @click="handleSecondary"
            >
              {{ current.secondary }}
            </button>
            <div v-else />
            <button
              type="button"
              class="h-10 px-6 text-sm font-semibold text-white transition-colors rounded-md bg-accent hover:opacity-90 focus:outline-none disabled:opacity-50"
              :disabled="isSeeding"
              @click="handlePrimary"
            >
              <i v-if="isSeeding" class="mr-2 fa fa-spinner fa-pulse" />
              {{ current.primary }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
