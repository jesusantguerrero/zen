import { computed, ref } from "vue"
import { useTaskFirestore, type ITask } from "@/plugins/firebase/useTaskFirestore"
import { firebaseState, updateSettings } from "@/plugins/useFirebase"

/**
 * Curated first-login sample tasks. Each teaches a specific mechanic:
 *  - a TODO quick-win the user can complete in < 1 min to see confetti + streak
 *  - tasks across all 4 quadrants so the matrix "fills in" visibly
 *  - hints at pomodoro, stages, metrics, goals
 */
const SAMPLE_TASKS: Array<Partial<ITask> & { stage?: string }> = [
  { title: "👋 Mark this task done to see Zen celebrate", matrix: "todo", order: 0, tags: [] },
  { title: "Start a pomodoro — tap the play button on any task", matrix: "todo", order: 1, tags: [] },
  { title: "Review yesterday's commits", matrix: "todo", order: 2, stage: "in-dev" as any, tags: [] },
  { title: "Plan next week's focus blocks", matrix: "schedule", order: 0, tags: [] },
  { title: "Set a daily pomodoro goal (Metrics → Daily goal)", matrix: "schedule", order: 1, tags: [] },
  { title: "Ask the team for the updated API spec", matrix: "delegate", order: 0, tags: [] },
  { title: "Reply to that non-urgent newsletter", matrix: "delete", order: 0, tags: [] },
]

export const SAMPLE_TASK_MARKER = "zen_sample_v1"

const isSeeding = ref(false)

export function useOnboarding() {
  const { saveTask } = useTaskFirestore()

  const hasSeededSamples = computed(() =>
    Boolean(firebaseState.settings?.samples_seeded)
  )

  const seedSampleTasks = async () => {
    if (hasSeededSamples.value || isSeeding.value) return
    if (!firebaseState.user?.uid) return
    isSeeding.value = true
    try {
      for (const task of SAMPLE_TASKS) {
        await saveTask({
          ...task,
          tracks: [],
          checklist: [],
          source: SAMPLE_TASK_MARKER,
        } as any)
      }
      await updateSettings({ samples_seeded: true } as any)
    } finally {
      isSeeding.value = false
    }
  }

  const hideWelcome = async () => {
    await updateSettings({ hide_welcome: true } as any)
  }

  const markStepDone = async (step: string) => {
    const current = (firebaseState.settings?.onboarding_steps as any) || {}
    if (current[step]) return
    await updateSettings({
      onboarding_steps: { ...current, [step]: true },
    } as any)
  }

  return {
    SAMPLE_TASK_MARKER,
    SAMPLE_TASKS,
    hasSeededSamples,
    seedSampleTasks,
    isSeeding,
    hideWelcome,
    markStepDone,
  }
}
