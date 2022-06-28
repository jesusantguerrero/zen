<template>
  <div class="custom-container">
    <div class="h-screen text-left md:flex grid-container mx-28">
      <div
        class="block pt-24 pb-20 md:block md:pl-28 md:pt-28"
      >
        <div class="items-center justify-between mb-10 section-header md:flex">
          <h2
            class="text-2xl font-bold text-left text-gray-400 dark:text-gray-300"
          >
            {{ state.title }}
            <small class="block text-sm">{{ state.description }}</small>
          </h2>
        </div>

        <Metrics class="mt-10" />
      </div>

      <aside class="w-full pt-24 pb-20 md:block md:pl-4 md:pt-28">
        <summary-aside
          :matrix="state.matrix"
          :standup="state.standup"
          :committed="state.committed"
          :is-loaded="state.tasksLoaded"
        />

        <OverdueAside 
          :committed="state.committed"
          :overdue="state.overdue"
        />
      </aside>
    </div>

    <welcome-modal :is-open="state.isWelcomeOpen" @closed="closeWelcomeModal" />
    <standup-modal
        :is-open="!state.standup.length && state.matrix.todo.list.length"
        @closed="completeDay()"
      >
          <template #content>
            <div class="mx-10 text-left">
                <p v-for="task in state.matrix.todo.list" :key="`task-${task.id}`">
                    <label class="checkbox-label">
                    <input
                        type="checkbox"
                        class="mr-5"
                        name=""
                        :id="task.id"
                        v-model="task.done"
                    />

                    <span>
                        {{ task.title }}
                    </span>
                    </label>
                </p>
            </div>
        </template>
    </standup-modal>
  </div>
</template>

<script>
import {
  inject,
  onUnmounted,
  reactive,
  ref,
  computed,
  onMounted,
  watch,
} from "vue";
import { useRouter } from "vue-router";
import { ElNotification, ElMessageBox } from "element-plus";
import { useTaskFirestore } from "../utils/useTaskFirestore";
import { useDateTime } from "../utils/useDateTime";
import { useCollection } from "../utils/useCollection";
import { firebaseState, updateSettings } from "../utils/useFirebase";
import { startFireworks } from "../utils/useConfetti";
import TagsSelect from "../components/atoms/TagsSelect.vue";
import TabHeader from "../components/atoms/TabHeader.vue";
import TaskGroup from "../components/organisms/TaskGroup.vue";
import WelcomeModal from "../components/organisms/modals/WelcomeModal.vue";
import StandupModal from "../components/organisms/modals/StandupModal.vue";
import TaskModal from "../components/organisms/modals/TaskModal.vue";
import QuickAdd from "../components/molecules/QuickAdd.vue";
import BackgroundIconCard from "../components/molecules/BackgroundIconCard.vue";
import differenceInCalendarDays from "date-fns/differenceInCalendarDays";
import { startOfYesterday } from "date-fns";
import format from "date-fns/format";
import subDays from "date-fns/subDays/index";
import Metrics from "../components/templates/MetricsTemplate.vue";
import SummaryAside from "../components/templates/SummarySider.vue";
import MaterialIcon from "../components/atoms/MaterialIcon.vue";
import Button from "../components/atoms/Button.vue";
import OverdueAside from "../components/templates/OverdueAside.vue";

export default {
  components: {
    TagsSelect,
    TabHeader,
    TaskGroup,
    WelcomeModal,
    StandupModal,
    TaskModal,
    QuickAdd,
    Metrics,
    SummaryAside,
    BackgroundIconCard,
    MaterialIcon,
    Button,
    OverdueAside
},
  setup() {
    const {
      saveTask,
      deleteTask,
      getCommittedTasks,
      updateTask,
      getTaskByMatrix,
      updateTaskBatch,
    } = useTaskFirestore();

    // state and ui
    const state = reactive({
      title: "Hi, Jesus",
      description: "See your day in a glance",
      matrix: {
        todo: {
          ref: null,
          list: [],
          classes: "text-green-400",
          loaded: false,
        },
        schedule: {
          ref: null,
          list: [],
          classes: "text-blue-400",
          loaded: false,
        },
        delegate: {
          ref: null,
          list: [],
          classes: "text-yellow-400",
          loaded: false,
        },
        delete: {
          ref: null,
          list: [],
          classes: "text-red-400",
          loaded: false,
        },
      },
      standup: [],
      standupSummary: [],
      showReminder: false,
      showSummary: true,
      isWelcomeOpen: false,
      isTaskModalOpen: false,
      track: null,
      tabSelected: "todo",
      tabs: [
        {
          label: "Lineup",
          name: "todo",
          focusClass: "text-green-400",
        },
        {
          label: "Dailies",
          name: "stale",
          focusClass: "text-yellow-400",
        },
      ],
      committed: {
        list: [],
        ref: null,
      },
      tasksloaded: computed(() => {
        return Object.values(state.matrix)
          .map((item) => item.loaded)
          .every((isLoaded) => isLoaded);
      }),
      overdues: computed(() => {
        const { formatDate } = useDateTime();
        return Object.entries(state.matrix).reduce((list, matrix) => {
          return [
            ...list,
            ...matrix[1].list.filter((item) => {
              return item.due_date && item.due_date < formatDate();
            }),
          ];
        }, []);
      }),
      stale: computed(() => {
        return Object.entries(state.matrix).reduce((list, matrix) => {
          return [
            ...list,
            ...matrix[1].list.filter((item) => {
              item.diff = differenceInCalendarDays(
                item.created_at.toDate(),
                new Date()
              );
              return item.diff;
            }),
          ];
        }, []);
      }),
    });

    // Modals check
    state.isWelcomeOpen =
      state.isWelcomeOpen ||
      !firebaseState.settings ||
      !firebaseState.settings.hide_welcome;

    // Edit task
    const taskToEdit = ref({});
    const setTaskToEdit = (task) => {
      taskToEdit.value = task;
      state.isTaskModalOpen = false;
      state.isTaskModalOpen = true;
    };

    const onEdittedTask = (task) => {
      const index = state[task.matrix].findIndex(
        (localTask) => localTask.uid == task.uid
      );
      state[task.matrix][index] = { ...task };
      taskToEdit.value = null;
    };

    const addTask = (task) => {
      task.order = getNextIndex(state.matrix.todo.list);
      saveTask(task);
    };

    const destroyTask = async (task) => {
      const canDelete = await ElMessageBox.confirm(
        "Are you sure you want to delete this task?",
        "Delete Task"
      );
      if (canDelete) {
        deleteTask(task).then(() => {
          ElNotification({
            type: "success",
            message: "Task deleted",
            title: "Task deleted",
          });
        });
      }
    };

    const onTaskUpdated = (task) => {
      const formData = { ...task };
      formData.tracks = [];
      delete task.duration_ms;

      updateTask(formData).then(() => {
        ElNotification({
          title: "Updated",
          message: "Task updated",
        });
      });
    };

    // Tasks manipulation
    const getMatrix = (matrix) => {
      getTaskByMatrix(matrix).then((collectionRef) => {
        state.matrix[matrix].ref = collectionRef.onSnapshot((snap) => {
          state.matrix[matrix].list = [];
          snap.forEach((doc) => {
            state.matrix[matrix].list.push({ ...doc.data(), uid: doc.id });
          });
          state.matrix[matrix].loaded = true;
        });
      });
    };

    Object.keys(state.matrix).forEach((matrix) => {
      getMatrix(matrix);
    });

    // Daily Standup
    const { getAll, save } = useCollection();
    const fetchStandup = async () => {
      const standups = await getAll("standups")
        .where("date", "==", format(new Date(), "yyyy-MM-dd"))
        .get();
      state.standup = [];
      standups.forEach((item) => {
        state.standup.push({ ...item.data() });
      });
    };

    onMounted(() => {
      fetchStandup();
    });

    const updateStandup = (date) => {
      save("standups", {
        date: date,
      });
    };

    const completeDay = async () => {
      const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
      const now = format(new Date(), "yyyy-MM-dd");
      let completed = state.matrix.todo.list.filter((item) => item.done);
      completed = completed.map((item) => {
        item.commit_date = yesterday;
        item.done = true;
        return item;
      });
      for (const completedTask of completed) {
        await updateTask(completedTask);
      }
      updateStandup(now);
      state.standup = [
        {
          date: now,
        },
      ];
      startFireworks();
    };

    watch(
      state.tasksloaded,
      () => {
        if (state.tasksloaded && !state.standup.length) {
          if (state.matrix.todo.list.length) {
            state.standupSummary = { ...state.matrix.todo.list };
            state.isStandupOpen = true;
          } else {
            updateStandup(format(new Date(), "yyyy-MM-dd"));
          }
        }
      },
      { immediate: true }
    );

    const fetchCommitted = () => {
      getCommittedTasks(startOfYesterday()).then((committedRef) => {
        state.committed.ref = committedRef.onSnapshot((snap) => {
          const list = [];
          snap.forEach((doc) => {
            list.push({ ...doc.data(), uid: doc.id });
          });
          state.committed.list = list;
        });
      });
    };

    fetchCommitted();

    onUnmounted(() => {
      Object.values(state.matrix).forEach((matrix) => {
        if (matrix.ref) {
          matrix.ref();
        }
      });

      if (state.committed.ref) {
        state.committed.ref();
      }
    });

    const getNextIndex = (list) => {
      return Math.max(...list.map((item) => Number(item.order || 0))) + 1;
    };

    const { push } = useRouter();
    const closeWelcomeModal = () => {
      updateSettings({
        hide_welcome: true,
      }).then(() => {
        state.isWelcomeOpen = false;
        push({
          name: "planAhead",
        });
      });
    };

    // Drags
    const handleDragChanges = (e, matrix) => {
      if (e.added) {
        e.added.element.matrix = matrix;
        updateTask(e.added.element).then(() => {
          ElNotification({
            message: `Moved to ${matrix}`,
          });
        });
      }

      if (e.moved) {
        updateTaskBatch(
          state[e.moved.element.matrix].map((task, index) => {
            task.order = index;
            return task;
          })
        );
      }
    };

    const shared = inject("shared");

    return {
      state,
      taskToEdit,
      setTaskToEdit,
      onEdittedTask,
      onTaskUpdated,
      addTask,
      destroyTask,
      closeWelcomeModal,
      completeDay,
      push,
      handleDragChanges,
      shared,
    };
  },
};
</script>

<style lang="scss" scoped>
.zen__datails {
  min-height: 400px;
}

.grid-container {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 350px;
}
</style>
