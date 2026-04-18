<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from "vue"
import { ElNotification, ElMessageBox } from "element-plus"
import {
  useProjectsFirestore,
  PROJECT_COLORS,
  DAYS_OF_WEEK,
  type IProject,
} from "@/plugins/firebase/useProjectsFirestore"

const { createProject, updateProject, deleteProject, listProjects } = useProjectsFirestore()

const state = reactive({
  projects: [] as IProject[],
  showArchived: false,
  isCreating: false,
  newName: "",
  newColor: PROJECT_COLORS[0],
})

let unsubscribe: (() => void) | null = null

onMounted(() => {
  unsubscribe = listProjects().onSnapshot((snap: any) => {
    const list: IProject[] = []
    snap.forEach((doc: any) => list.push({ uid: doc.id, ...doc.data() } as IProject))
    state.projects = list
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

const byName = (a: IProject, b: IProject) => a.name.localeCompare(b.name)
const activeProjects = computed(() => state.projects.filter((p) => !p.archived).sort(byName))
const archivedProjects = computed(() => state.projects.filter((p) => p.archived).sort(byName))

const todayDayIndex = new Date().getDay()
const isScheduledToday = (project: IProject) => {
  const days = project?.schedule?.days
  return Boolean(days && days.includes(todayDayIndex))
}

const createNew = async () => {
  const name = state.newName.trim()
  if (!name) return
  await createProject({ name, color: state.newColor })
  state.newName = ""
  state.newColor = PROJECT_COLORS[0]
  state.isCreating = false
  ElNotification({ type: "success", title: "Project created", message: name })
}

const toggleDay = async (project: IProject, day: number) => {
  const current = new Set(project.schedule?.days || [])
  if (current.has(day)) current.delete(day)
  else current.add(day)
  const days = [...current].sort()
  await updateProject(project.uid, {
    schedule: days.length ? { days } : null,
  })
}

const renameProject = async (project: IProject) => {
  try {
    const { value } = await ElMessageBox.prompt(
      "Rename project",
      project.name,
      { inputValue: project.name, confirmButtonText: "Save", cancelButtonText: "Cancel" }
    )
    const trimmed = (value || "").trim()
    if (!trimmed || trimmed === project.name) return
    await updateProject(project.uid, { name: trimmed })
  } catch {
    // cancelled
  }
}

const setColor = async (project: IProject, color: string) => {
  if (project.color === color) return
  await updateProject(project.uid, { color })
}

const archive = async (project: IProject) => {
  await updateProject(project.uid, { archived: true })
  ElNotification({ type: "success", title: "Project archived" })
}

const unarchive = async (project: IProject) => {
  await updateProject(project.uid, { archived: false })
}

const destroy = async (project: IProject) => {
  try {
    await ElMessageBox.confirm(
      `Delete "${project.name}"? Tasks linked to it will keep their link but the project will be gone.`,
      "Delete project",
      { confirmButtonText: "Delete", cancelButtonText: "Cancel", type: "warning" }
    )
  } catch {
    return
  }
  await deleteProject(project.uid)
  ElNotification({ type: "success", title: "Project deleted" })
}
</script>

<template>
  <div class="px-6 py-6 text-left text-gray-700 dark:text-gray-200">
    <header class="mb-4">
      <h3 class="text-lg font-bold">Projects</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Projects are 1-per-task and represent what you're working on — a client, a product, a side experiment.
        Assign weekdays to auto-highlight the projects scheduled for today on your dashboard.
      </p>
    </header>

    <!-- Create new -->
    <div class="pb-6 mb-6 border-b border-gray-200 dark:border-base-lvl-3">
      <template v-if="!state.isCreating">
        <button
          type="button"
          class="flex items-center h-10 px-4 space-x-2 text-sm font-semibold text-white transition-colors rounded-md bg-accent hover:opacity-90 focus:outline-none"
          @click="state.isCreating = true"
        >
          <i class="fa fa-plus" /> <span>New project</span>
        </button>
      </template>
      <template v-else>
        <div class="flex items-center space-x-2">
          <input
            v-model="state.newName"
            type="text"
            placeholder="Project name (e.g. Kanvas)"
            maxlength="40"
            class="flex-1 h-10 px-3 text-sm border-2 rounded-md border-gray-200 dark:bg-base-lvl-1 dark:border-base-lvl-3 dark:text-gray-200 focus:outline-none focus:border-accent"
            @keyup.enter="createNew"
            @keyup.escape="state.isCreating = false"
          />
          <div class="flex items-center space-x-1">
            <button
              v-for="color in PROJECT_COLORS"
              :key="color"
              type="button"
              class="w-6 h-6 transition-all rounded-full focus:outline-none"
              :class="state.newColor === color ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-base-lvl-2' : ''"
              :style="{ backgroundColor: color }"
              @click="state.newColor = color"
            />
          </div>
          <button
            type="button"
            class="h-10 px-3 text-sm text-gray-500 rounded-md hover:bg-gray-100 dark:hover:bg-base-lvl-1"
            @click="state.isCreating = false"
          >
            Cancel
          </button>
          <button
            type="button"
            class="h-10 px-4 text-sm font-semibold text-white rounded-md bg-accent hover:opacity-90 focus:outline-none disabled:opacity-50"
            :disabled="!state.newName.trim()"
            @click="createNew"
          >
            Create
          </button>
        </div>
      </template>
    </div>

    <!-- Active list -->
    <div v-if="!activeProjects.length" class="py-10 text-sm text-center text-gray-400 border-2 border-dashed rounded-md border-gray-200 dark:border-base-lvl-3">
      No active projects yet.
    </div>

    <ul v-else class="space-y-3">
      <li
        v-for="project in activeProjects"
        :key="project.uid"
        class="p-4 border-2 rounded-md border-gray-200 dark:border-base-lvl-3"
      >
        <div class="flex items-center space-x-3">
          <!-- Color chooser -->
          <el-popover trigger="click" placement="bottom-start" :width="160" :show-arrow="false">
            <template #reference>
              <button
                type="button"
                class="w-5 h-5 rounded-full focus:outline-none"
                :style="{ backgroundColor: project.color }"
                title="Change color"
              />
            </template>
            <div class="flex flex-wrap gap-1 p-1">
              <button
                v-for="color in PROJECT_COLORS"
                :key="color"
                type="button"
                class="w-6 h-6 rounded-full focus:outline-none"
                :class="project.color === color ? 'ring-2 ring-offset-1 ring-gray-400' : ''"
                :style="{ backgroundColor: color }"
                @click="setColor(project, color)"
              />
            </div>
          </el-popover>

          <!-- Name + today badge -->
          <button
            type="button"
            class="flex-1 text-left text-gray-700 transition-colors rounded dark:text-gray-200 hover:text-accent focus:outline-none"
            @click="renameProject(project)"
            :title="'Rename ' + project.name"
          >
            <span class="font-semibold">{{ project.name }}</span>
            <span v-if="isScheduledToday(project)" class="ml-2 text-xs text-accent">
              <i class="fa fa-calendar-day" /> today
            </span>
          </button>

          <!-- Weekday picker -->
          <div class="flex items-center space-x-1" :title="project.schedule?.days?.length ? 'Scheduled days' : 'Assign weekdays'">
            <button
              v-for="day in DAYS_OF_WEEK"
              :key="day.value"
              type="button"
              class="flex items-center justify-center w-7 h-7 text-xs font-semibold transition-all rounded focus:outline-none"
              :class="project.schedule?.days?.includes(day.value)
                ? 'text-white bg-accent'
                : 'text-gray-400 bg-gray-100 dark:bg-base-lvl-1 hover:bg-gray-200 dark:hover:bg-base-lvl-3'"
              :title="day.label"
              @click="toggleDay(project, day.value)"
            >
              {{ day.short }}
            </button>
          </div>

          <!-- Actions menu -->
          <button
            type="button"
            class="w-8 h-8 text-gray-400 transition-colors rounded hover:text-red-500 hover:bg-gray-100 dark:hover:bg-base-lvl-1 focus:outline-none"
            title="Archive"
            @click="archive(project)"
          >
            <i class="fa fa-archive" />
          </button>
          <button
            type="button"
            class="w-8 h-8 text-gray-400 transition-colors rounded hover:text-red-500 hover:bg-gray-100 dark:hover:bg-base-lvl-1 focus:outline-none"
            title="Delete"
            @click="destroy(project)"
          >
            <i class="fa fa-trash" />
          </button>
        </div>
      </li>
    </ul>

    <!-- Archived section -->
    <div v-if="archivedProjects.length" class="mt-8">
      <button
        type="button"
        class="flex items-center mb-2 text-sm text-gray-500 dark:text-gray-400 hover:text-accent focus:outline-none"
        @click="state.showArchived = !state.showArchived"
      >
        <i :class="['mr-2 transition-transform fa fa-chevron-right', { 'rotate-90': state.showArchived }]" />
        {{ archivedProjects.length }} archived
      </button>
      <ul v-if="state.showArchived" class="space-y-2">
        <li
          v-for="project in archivedProjects"
          :key="project.uid"
          class="flex items-center p-3 space-x-3 text-sm border rounded-md opacity-60 border-gray-200 dark:border-base-lvl-3"
        >
          <span class="inline-block w-3 h-3 rounded-full" :style="{ backgroundColor: project.color }"></span>
          <span class="flex-1">{{ project.name }}</span>
          <button
            type="button"
            class="px-3 py-1 text-xs text-gray-500 border rounded hover:text-accent hover:border-accent focus:outline-none"
            @click="unarchive(project)"
          >
            Restore
          </button>
          <button
            type="button"
            class="px-3 py-1 text-xs text-gray-500 border rounded hover:text-red-500 hover:border-red-500 focus:outline-none"
            @click="destroy(project)"
          >
            Delete
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
