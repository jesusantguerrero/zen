<script setup lang="ts">
import { ref } from "vue";
import { ElMessageBox, ElNotification } from "element-plus";
import { useRouter } from "vue-router";
import { useDataExport, ExportFormat } from "@/composables/useDataExport";
import { deleteAccount } from "@/plugins/useFirebase";

const { exportCollection } = useDataExport();
const busy = ref(false);
const router = useRouter();

const runExport = async (
  collection: "tasks" | "tracks",
  format: ExportFormat
) => {
  try {
    busy.value = true;
    const count = await exportCollection(collection, format);
    ElNotification({
      type: "success",
      title: "Export ready",
      message: `Exported ${count} ${collection} as ${format.toUpperCase()}`,
    });
  } catch (err) {
    console.error(err);
    ElNotification({ type: "error", message: "Export failed" });
  } finally {
    busy.value = false;
  }
};

const confirmDelete = async () => {
  try {
    await ElMessageBox.confirm(
      "This will permanently delete your account and all your tasks, tracks, and settings. This cannot be undone.",
      "Delete account",
      {
        confirmButtonText: "Delete forever",
        cancelButtonText: "Cancel",
        type: "warning",
      }
    );
  } catch {
    return;
  }

  try {
    busy.value = true;
    await deleteAccount();
    ElNotification({ type: "success", message: "Account deleted" });
    router.push({ name: "login" });
  } catch (err: any) {
    console.error(err);
    if (err?.code === "auth/requires-recent-login") {
      ElNotification({
        type: "warning",
        title: "Sign in again",
        message: "Please log out and log back in before deleting your account.",
      });
    } else {
      ElNotification({
        type: "error",
        message: err?.message || "Could not delete account",
      });
    }
  } finally {
    busy.value = false;
  }
};
</script>

<template>
  <section class="py-5 px-16 text-left dark:text-gray-200">
    <h1 class="pb-10 text-2xl font-bold">Data &amp; account</h1>

    <article class="mb-10">
      <h4 class="mb-2 font-bold">Export your data</h4>
      <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Download your tasks and tracks. JSON preserves nested fields; CSV is
        flat.
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          class="px-4 py-2 border border-gray-300 rounded-md dark:border-base-lvl-3 hover:border-gray-400 disabled:opacity-50"
          :disabled="busy"
          @click="runExport('tasks', 'json')"
        >
          Tasks (JSON)
        </button>
        <button
          class="px-4 py-2 border border-gray-300 rounded-md dark:border-base-lvl-3 hover:border-gray-400 disabled:opacity-50"
          :disabled="busy"
          @click="runExport('tasks', 'csv')"
        >
          Tasks (CSV)
        </button>
        <button
          class="px-4 py-2 border border-gray-300 rounded-md dark:border-base-lvl-3 hover:border-gray-400 disabled:opacity-50"
          :disabled="busy"
          @click="runExport('tracks', 'json')"
        >
          Tracks (JSON)
        </button>
        <button
          class="px-4 py-2 border border-gray-300 rounded-md dark:border-base-lvl-3 hover:border-gray-400 disabled:opacity-50"
          :disabled="busy"
          @click="runExport('tracks', 'csv')"
        >
          Tracks (CSV)
        </button>
      </div>
    </article>

    <article
      class="p-4 border border-red-400/40 rounded-md bg-red-50/40 dark:bg-red-500/10"
    >
      <h4 class="mb-2 font-bold text-red-500">Danger zone</h4>
      <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">
        Deleting your account removes your tasks, tracks, settings, connections,
        and notifications. This cannot be undone.
      </p>
      <button
        class="px-4 py-2 font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-50"
        :disabled="busy"
        @click="confirmDelete"
      >
        Delete my account
      </button>
    </article>
  </section>
</template>
