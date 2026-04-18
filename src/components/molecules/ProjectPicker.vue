<script setup lang="ts">
import { computed, nextTick, ref } from "vue"
import { ElPopover } from "element-plus"
import ProjectBadge from "./ProjectBadge.vue"
import {
  useProjectsFirestore,
  PROJECT_COLORS,
  type IProject,
} from "@/plugins/firebase/useProjectsFirestore"

const props = defineProps<{
  modelValue: string | null | undefined
  projects: IProject[]
  allowCreate?: boolean
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: string | null): void
  (e: "created", project: IProject): void
}>()

const { createProject } = useProjectsFirestore()

const selected = computed(() => {
  const id = props.modelValue
  if (!id) return null
  return props.projects.find((p) => p.uid === id) || null
})

const sortedProjects = computed(() =>
  [...props.projects]
    .filter((p) => !p.archived)
    .sort((a, b) => a.name.localeCompare(b.name))
)

const searchQuery = ref("")
const searchInput = ref<HTMLInputElement | null>(null)

const filteredProjects = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return sortedProjects.value
  return sortedProjects.value.filter((p) =>
    p.name.toLowerCase().includes(q)
  )
})

const creating = ref(false)
const newName = ref("")
const newColor = ref(PROJECT_COLORS[0])

const pick = (uid: string | null) => {
  emit("update:modelValue", uid)
  searchQuery.value = ""
}

const onPopoverShow = () => {
  searchQuery.value = ""
  creating.value = false
  // Autofocus when there are enough projects that search is useful
  if (sortedProjects.value.length >= 5) {
    nextTick(() => searchInput.value?.focus())
  }
}

const startCreate = () => {
  creating.value = true
  newName.value = searchQuery.value // prefill with current search
  newColor.value = PROJECT_COLORS[0]
}

const cancelCreate = () => {
  creating.value = false
}

const saveCreate = async () => {
  const name = newName.value.trim()
  if (!name) return
  const project = await createProject({ name, color: newColor.value })
  emit("created", project)
  emit("update:modelValue", project.uid)
  creating.value = false
  searchQuery.value = ""
}

const onSearchEnter = () => {
  // Enter on a single match = pick it; no match + allowCreate = start create
  if (filteredProjects.value.length === 1) {
    pick(filteredProjects.value[0].uid)
  } else if (!filteredProjects.value.length && props.allowCreate && searchQuery.value.trim()) {
    startCreate()
  }
}
</script>

<template>
  <el-popover
    trigger="click"
    placement="top-start"
    popper-class="dark:bg-gray-900 dark:text-gray-300"
    :width="300"
    :show-arrow="false"
    @show="onPopoverShow"
  >
    <template #reference>
      <button
        type="button"
        class="flex items-center h-8 px-2 space-x-2 text-xs text-gray-500 transition-colors border-2 border-gray-200 rounded-md hover:border-gray-400 focus:outline-none dark:bg-transparent dark:text-gray-300 dark:border-base-lvl-3"
      >
        <i class="fa fa-folder-open" />
        <span v-if="!selected">Project</span>
        <ProjectBadge v-else :project="selected" compact />
      </button>
    </template>

    <div class="space-y-1">
      <!-- Search -->
      <div v-if="!creating && sortedProjects.length" class="flex items-center px-2 py-1.5 border-b border-gray-100 dark:border-base-lvl-3">
        <i class="mr-2 text-xs text-gray-400 fa fa-search" />
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          placeholder="Search projects…"
          class="flex-1 text-xs bg-transparent focus:outline-none dark:text-gray-200"
          @keyup.enter="onSearchEnter"
          @keyup.escape="searchQuery = ''"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
          title="Clear"
          @click="searchQuery = ''"
        >
          <i class="text-xs fa fa-times" />
        </button>
      </div>

      <div class="p-1 space-y-1">
        <button
          v-if="!searchQuery && !creating"
          type="button"
          class="flex items-center w-full px-2 py-1.5 text-xs text-left rounded hover:bg-gray-100 dark:hover:bg-base-lvl-1"
          :class="!modelValue ? 'text-accent font-semibold' : 'text-gray-500 dark:text-gray-400'"
          @click="pick(null)"
        >
          <i class="w-4 fa fa-times-circle" />
          <span class="ml-1">No project</span>
        </button>

        <div v-if="!creating && filteredProjects.length" class="overflow-y-auto max-h-64">
          <button
            v-for="project in filteredProjects"
            :key="project.uid"
            type="button"
            class="flex items-center w-full px-2 py-1.5 text-xs text-left rounded hover:bg-gray-100 dark:hover:bg-base-lvl-1"
            :class="modelValue === project.uid ? 'bg-gray-100 dark:bg-base-lvl-1 font-semibold' : ''"
            @click="pick(project.uid)"
          >
            <span
              class="inline-block w-2 h-2 mr-2 rounded-full"
              :style="{ backgroundColor: project.color }"
            ></span>
            <span class="flex-1 text-gray-700 dark:text-gray-200">{{ project.name }}</span>
            <i v-if="modelValue === project.uid" class="ml-2 text-accent fa fa-check" />
          </button>
        </div>

        <div
          v-else-if="!creating && !filteredProjects.length && searchQuery"
          class="px-2 py-3 text-xs text-center text-gray-400"
        >
          No match for "{{ searchQuery }}"
        </div>

        <div
          v-else-if="!creating && !sortedProjects.length"
          class="px-2 py-3 text-xs text-center text-gray-400"
        >
          No projects yet
        </div>

        <div v-if="allowCreate" class="pt-1 border-t border-gray-100 dark:border-base-lvl-3">
          <template v-if="!creating">
            <button
              type="button"
              class="flex items-center w-full px-2 py-1.5 text-xs text-left rounded hover:bg-gray-100 dark:hover:bg-base-lvl-1 text-accent"
              @click="startCreate"
            >
              <i class="w-4 fa fa-plus" />
              <span class="ml-1 font-semibold">
                <template v-if="searchQuery">New project "{{ searchQuery }}"</template>
                <template v-else>New project</template>
              </span>
            </button>
          </template>
          <template v-else>
            <div class="p-2 space-y-2">
              <input
                v-model="newName"
                type="text"
                placeholder="Project name"
                maxlength="40"
                class="w-full h-8 px-2 text-xs border-2 rounded border-gray-200 dark:bg-base-lvl-1 dark:border-base-lvl-3 dark:text-gray-200 focus:outline-none focus:border-accent"
                @keyup.enter="saveCreate"
                @keyup.escape="cancelCreate"
              />
              <div class="flex flex-wrap gap-1">
                <button
                  v-for="color in PROJECT_COLORS"
                  :key="color"
                  type="button"
                  class="w-5 h-5 transition-all rounded-full focus:outline-none"
                  :class="newColor === color ? 'ring-2 ring-offset-1 ring-gray-400 dark:ring-offset-base-lvl-2' : ''"
                  :style="{ backgroundColor: color }"
                  @click="newColor = color"
                />
              </div>
              <div class="flex justify-end space-x-1">
                <button
                  type="button"
                  class="px-2 py-1 text-xs text-gray-500 rounded hover:bg-gray-100 dark:hover:bg-base-lvl-1"
                  @click="cancelCreate"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  class="px-2 py-1 text-xs font-semibold text-white rounded bg-accent hover:opacity-90 focus:outline-none disabled:opacity-50"
                  :disabled="!newName.trim()"
                  @click="saveCreate"
                >
                  Create
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </el-popover>
</template>
