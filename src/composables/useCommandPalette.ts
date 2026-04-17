import { computed, ref } from "vue"

export interface Command {
  id: string
  label: string
  description?: string
  icon?: string
  keywords?: string[]
  group?: string
  action: () => void | Promise<void>
}

const isOpen = ref(false)
const query = ref("")
const commands = ref<Command[]>([])
const activeIndex = ref(0)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return commands.value
  return commands.value.filter((cmd) => {
    const haystack = `${cmd.label} ${cmd.description || ""} ${(cmd.keywords || []).join(" ")}`.toLowerCase()
    return haystack.includes(q)
  })
})

const groupedCommands = computed(() => {
  const groups: Record<string, Command[]> = {}
  filtered.value.forEach((cmd) => {
    const key = cmd.group || "General"
    if (!groups[key]) groups[key] = []
    groups[key].push(cmd)
  })
  return Object.entries(groups).map(([group, items]) => ({ group, items }))
})

export function useCommandPalette() {
  const open = () => {
    isOpen.value = true
    query.value = ""
    activeIndex.value = 0
  }
  const close = () => {
    isOpen.value = false
    query.value = ""
  }
  const toggle = () => {
    if (isOpen.value) close()
    else open()
  }
  const register = (cmds: Command[]) => {
    const existingIds = new Set(commands.value.map((c) => c.id))
    const toAdd = cmds.filter((c) => !existingIds.has(c.id))
    commands.value = [...commands.value, ...toAdd]
  }
  const unregister = (ids: string[]) => {
    const remove = new Set(ids)
    commands.value = commands.value.filter((c) => !remove.has(c.id))
  }
  const execute = async (cmd: Command) => {
    close()
    await cmd.action()
  }
  const moveSelection = (delta: number) => {
    const max = filtered.value.length
    if (!max) return
    activeIndex.value = (activeIndex.value + delta + max) % max
  }
  const executeActive = () => {
    const cmd = filtered.value[activeIndex.value]
    if (cmd) execute(cmd)
  }

  return {
    isOpen,
    query,
    commands,
    filtered,
    groupedCommands,
    activeIndex,
    open,
    close,
    toggle,
    register,
    unregister,
    execute,
    moveSelection,
    executeActive,
  }
}
