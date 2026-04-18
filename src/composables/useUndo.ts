import { ref, onMounted, onUnmounted } from "vue"
import { ElNotification } from "element-plus"

/**
 * Session-scoped undo/redo for task operations.
 *
 * - push(action) — record an action with its `undo` function (and optional `redo`)
 * - Cmd/Ctrl+Z pops the latest and runs its undo; optionally pushes a redo
 * - State lives only for the session; not persisted across reloads on purpose —
 *   undoing a delete only makes sense while the user's intent is still fresh
 *
 * Each action should describe itself for the toast:
 *   { label: "Task deleted", undo: async () => saveTask(snapshot), redo: ... }
 */

export interface UndoAction {
  label: string
  undo: () => void | Promise<void>
  redo?: () => void | Promise<void>
}

const MAX_STACK = 20

// Global singleton — one stack shared across components in the session.
const undoStack = ref<UndoAction[]>([])
const redoStack = ref<UndoAction[]>([])
const isRunning = ref(false)

export function useUndo() {
  const push = (action: UndoAction) => {
    undoStack.value.push(action)
    if (undoStack.value.length > MAX_STACK) undoStack.value.shift()
    // Clear redo on a fresh action — classic undo semantics
    redoStack.value = []
  }

  const performUndo = async () => {
    if (isRunning.value) return
    const action = undoStack.value.pop()
    if (!action) {
      ElNotification({ type: "info", title: "Nothing to undo", duration: 1500 })
      return
    }
    isRunning.value = true
    try {
      await action.undo()
      if (action.redo) {
        redoStack.value.push(action)
      }
      ElNotification({
        type: "success",
        title: "Undone",
        message: action.label,
        duration: 2000,
      })
    } catch (err: any) {
      ElNotification({
        type: "error",
        title: "Undo failed",
        message: err?.message || "Unknown error",
      })
      // Put it back so the user can retry
      undoStack.value.push(action)
    } finally {
      isRunning.value = false
    }
  }

  const performRedo = async () => {
    if (isRunning.value) return
    const action = redoStack.value.pop()
    if (!action || !action.redo) {
      ElNotification({ type: "info", title: "Nothing to redo", duration: 1500 })
      return
    }
    isRunning.value = true
    try {
      await action.redo()
      undoStack.value.push(action)
      ElNotification({
        type: "success",
        title: "Redone",
        message: action.label,
        duration: 2000,
      })
    } catch (err: any) {
      ElNotification({
        type: "error",
        title: "Redo failed",
        message: err?.message || "Unknown error",
      })
      redoStack.value.push(action)
    } finally {
      isRunning.value = false
    }
  }

  return {
    push,
    performUndo,
    performRedo,
    undoStack,
    redoStack,
    isRunning,
  }
}

/**
 * Register a global Cmd/Ctrl+Z (undo) and Cmd/Ctrl+Shift+Z (redo) keyboard
 * shortcut. Mount this once at the App.vue level.
 */
export function useUndoShortcuts() {
  const { performUndo, performRedo } = useUndo()

  const isTypingTarget = (target: EventTarget | null) => {
    if (!target || !(target as HTMLElement).tagName) return false
    const tag = (target as HTMLElement).tagName
    return (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      (target as HTMLElement).isContentEditable
    )
  }

  const onKeydown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase()
    if (key !== "z") return
    if (!(e.metaKey || e.ctrlKey)) return
    // Don't hijack undo inside text inputs — native undo for text matters
    if (isTypingTarget(e.target)) return
    e.preventDefault()
    if (e.shiftKey) performRedo()
    else performUndo()
  }

  onMounted(() => window.addEventListener("keydown", onKeydown))
  onUnmounted(() => window.removeEventListener("keydown", onKeydown))
}
