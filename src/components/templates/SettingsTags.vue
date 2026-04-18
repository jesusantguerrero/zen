<template>
  <div class="px-6 py-6 text-left text-gray-700 dark:text-gray-200">
    <header class="mb-4">
      <h3 class="text-lg font-bold">Tags</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Tags are cross-cutting labels. If you're using a tag like a project (client, product, workstream),
        promote it to a real project to unlock weekday scheduling, single-select semantics, and better reporting.
      </p>
    </header>

    <div v-if="!tagsList.length" class="py-10 text-sm text-center text-gray-400 border-2 border-dashed rounded-md border-gray-200 dark:border-base-lvl-3">
      No tags yet.
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="tag in tagsList"
        :key="tag.uid"
        class="flex items-center p-3 space-x-3 border-2 rounded-md border-gray-200 dark:border-base-lvl-3"
      >
        <div
          class="w-5 h-5 rounded"
          :class="tag.colors && tag.colors[1]"
          :style="tag.colors && tag.colors[1] ? {} : { background: '#9ca3af' }"
        />
        <span class="flex-1 capitalize text-gray-700 dark:text-gray-200">{{ tag.name }}</span>
        <button
          type="button"
          class="h-8 px-3 text-xs text-gray-500 transition-colors border-2 rounded-md hover:border-accent hover:text-accent focus:outline-none dark:border-base-lvl-3 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="promoting[tag.uid]"
          title="Create a project from this tag and move linked tasks"
          @click="promoteTag(tag)"
        >
          <i v-if="promoting[tag.uid]" class="mr-1 fa fa-spinner fa-pulse" />
          <i v-else class="mr-1 fa fa-arrow-up" />
          Promote to project
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, reactive } from "vue"
import { ElMessageBox, ElNotification } from "element-plus"
import { db, firebaseState } from "@/plugins/useFirebase"
import { useProjectsFirestore, PROJECT_COLORS } from "@/plugins/firebase/useProjectsFirestore"

const tags = inject<any>("tags", { value: [] })
const { createProject } = useProjectsFirestore()

const tagsList = computed(() => {
  const raw = tags && typeof tags === "object" && "value" in tags ? tags.value : tags
  return Array.isArray(raw) ? raw : []
})

const promoting = reactive<Record<string, boolean>>({})

// Pick a deterministic project color based on the tag's name — if we can't
// infer a good color from the tag's Tailwind classes.
const colorForTag = (tag: any): string => {
  const name = (tag?.name || "").toString()
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return PROJECT_COLORS[Math.abs(hash) % PROJECT_COLORS.length]
}

const promoteTag = async (tag: any) => {
  try {
    await ElMessageBox.confirm(
      `Create a new project "${tag.name}"?\n\nAll tasks using this tag will be linked to the new project, and the tag will be removed from those tasks.`,
      "Promote tag to project",
      { confirmButtonText: "Promote", cancelButtonText: "Cancel", type: "info" }
    )
  } catch {
    return
  }

  promoting[tag.uid] = true
  try {
    // 1. Create the project
    const project = await createProject({
      name: tag.name,
      color: colorForTag(tag),
    })

    // 2. Find all tasks with this tag
    const uid = firebaseState.user?.uid
    if (!uid) throw new Error("Not authenticated")
    const snap = await db
      .collection("tasks")
      .where("user_uid", "==", uid)
      .get()

    const batch = db.batch()
    let affected = 0
    snap.forEach((doc) => {
      const data = doc.data()
      const taskTags = Array.isArray(data.tags) ? data.tags : []
      const hasTag = taskTags.some((t: any) => t.uid === tag.uid)
      if (!hasTag) return
      const nextTags = taskTags.filter((t: any) => t.uid !== tag.uid)
      batch.update(doc.ref, { project_uid: project.uid, tags: nextTags })
      affected += 1
    })
    if (affected > 0) await batch.commit()

    // 3. Delete the original tag doc
    await db.collection("tags").doc(tag.uid).delete().catch(() => {})

    ElNotification({
      type: "success",
      title: "Project created",
      message: `"${tag.name}" is now a project${affected ? ` with ${affected} linked task${affected === 1 ? '' : 's'}` : ''}.`,
    })
  } catch (err: any) {
    ElNotification({
      type: "error",
      title: "Could not promote",
      message: err?.message || "Unknown error",
    })
  } finally {
    promoting[tag.uid] = false
  }
}
</script>
