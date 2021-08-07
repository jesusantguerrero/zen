<template>
  <div class="pt-24 pb-20 mx-5 md:pt-28 md:mx-28">
    <div class="text-left md:flex">
      <div
        class="zen__view md:block md:w-8/12"
        :class="[state.mobileMode == 'zen' ? 'block' : 'hidden', !showSummary ? 'mx-auto' : 'md:mr-20']"
      >
        <header class="flex justify-between font-bold text-gray-400">
          <h1 class="text-2xl font-bold text-gray-400 md:block">
            Hi, {{ "Jesus" }}<br>
          </h1>
          <small class="text-sm">See your day in a glance</small>
        </header>

      <div
        class="zen__view md:block md:w-full md:mr-20"
        :class="[state.mobileMode == 'zen' ? 'block' : 'hidden']"
      >
        <header>
          <div class="flex justify-between mt-5">
            <tab-header v-model="state.tabSelected" :tabs="state.tabs" class="overflow-hidden rounded-md"/>

            <div class="flex space-x-2 itemx-center">
              <div class="items-center h-10 md:flex">
                <input
                  type="search"
                  v-model.trim="searchOptions.text"
                  class="h-10 px-2 text-sm border-2 border-gray-200 rounded-md w-44 dark:bg-gray-900 dark:border-gray-500 dark:text-gray-300 focus:outline-none"
                  placeholder="Search task"
                />

                <tags-select
                  v-model="searchOptions.tags"
                  :multiple="true"
                  placeholder="Filter by tag"
                  :tags="tags"
                  class="w-full h-full px-2 py-2 bg-white border-2 border-gray-200 rounded-md md:ml-2 dark:bg-gray-900 dark:border-gray-500"
                  :allow-add="false"
                />
              </div>
            </div>
          </div>
        </header>

        <div class="mt-5">
          <quick-add
            @saved="addTask"
            type="todo"
            :allow-edit="true"
            v-if="state.tabSelected == 'todo'"
          />

          <task-group
            v-if="state.tabSelected == 'todo'"
            :show-title="false"
            title="Todo"
            class="py-3"
            type="todo"
            placeholder="Click a task select"
            :allow-select="false"
            :tasks="state.matrix.todo.list"
            :search="searchOptions.text"
            :show-select="true"
            :show-controls="true"
            :is-item-as-handler="true"
            :tags="selectedTags"
            @change="handleDragChanges"
            @deleted="destroyTask"
            @edited="setTaskToEdit"
            @down="moveTo($event, 'schedule')"
          >
          </task-group>

          <task-group
              v-if="state.tabSelected == 'stale'"
              title="Dailies"
              color="text-blue-400"
              :search="''"
              :tags="[]"
              :tasks="state.stale"
              :show-controls="false"
              :max-height="0"
              :is-compact="true"
              :is-quadrant="false"

            >
              <template #empty v-if="!state.overdues.length">
              <div class="w-8/12 mx-auto mt-10 text-center md:w-6/12">
                <img src="../assets/undraw_following.svg" class="mx-auto w-12/12 md:w-5/12"> 
                <div class="mt-10 font-bold text-gray-500 md:mt-5"> There's no tasks</div>
              </div>
            </template>
          </task-group>
        </div>
      </div>
      </div>

      <div
        class="zen__comming-up lineup md:block md:mt-0 md:w-4/12"
        :class="[state.mobileMode == 'lineup' ? 'block' : 'hidden']"
        v-if="showSummary"
      >
        <header class="items-center justify-between mb-2 overflow-hidden font-bold text-gray-400 md:flex">
          <h1 class="text-2xl">Summary</h1><br>
          <small class="text-sm">Your plans</small>
        </header>

        <div class="space-y-5">
          <!-- Plan ahead -->
          <div class="py-4">
              <div class="justify-between font-bold text-gray-500">
                <h4 class="mb-0">
                  Make a plan for today
                </h4>
                <small>We suggest planning your daily work through plan ahead</small>
              </div>
          </div>
          <!-- Matrix summary -->
          <div class="py-4 quick__add">
            <h4 class="font-bold text-gray-500"> Matrix summary</h4>
            <div class="grid gap-4 font-bold text-white lg:grid-cols-2">
              <div class="flex items-center justify-center h-20 rounded-md shadow-md cursor-pointer ring ring-offset-2 ring-transparent" 
                v-for="(matrix, matrixName) in state.matrix"
                :key="matrixName"
                :class="matrix.classes">
                  <span class="mr-2 capitalize">{{ matrixName}}</span>
                 ({{ matrix.list.length }})
              </div>
            </div>
          </div>

          <!-- Shared -->
           <div class="py-4 quick__add" v-if="false">
              <div class="flex justify-between mb-5 font-bold text-gray-500">
                <h4>
                  Shared with me
                </h4> 
                <div class="items-center h-10 md:flex">
                  <input
                    type="search"
                    v-model.trim="searchOptions.text"
                    class="w-full h-10 px-2 text-sm border-2 border-gray-200 rounded-md focus:outline-none"
                    placeholder="Search contact"
                  />
                </div>
              </div>
              <div class="flex space-x-2">
                <div v-for="person in  shared" :key="person.uid" class="text-center cursor-pointer">
                  <el-avatar class="block"> {{ person.name }} </el-avatar>
                </div>
              </div>
          </div>

          <div class="py-4">
              <div class="flex justify-between mb-5 font-bold text-gray-500">
                <h4>
                  Your yesterday's work
                </h4> 
              </div>
              <background-icon-card
                class="text-gray-400 bg-white h-46"
                icon="fas fa-clock"
                value="Quick Standup"
              >
                <template #content>
                  <div class="overflow-auto text-left">
                      <h2 class="w-full mb-5 text-xl font-bold text-center"> Smart Standup</h2>
                      <p v-for="task in state.committed.list" :key="`task-${task.id}`">
                        <label class="checkbox-label">
                        <input
                            type="checkbox"
                            class="mr-5"
                            name=""
                            @change="onTaskUpdated(task)"
                            :id="task.id"
                            v-model="task.done"
                        />

                        <span>
                            {{ task.title }} {{ task.tags.join(',') }}
                        </span>
                        </label>
                    </p>
                  </div>
                </template>

                <template #action>
                  <Button class="text-white bg-gray-500 "> Go to standup </Button>
                </template>
              </background-icon-card>
          </div>
        </div>
      </div>
    </div>

    <standup-modal
      :is-open="!state.standup.length && state.tasksloaded && state.matrix.todo.list.length"
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

    <welcome-modal
      :is-open="state.isWelcomeOpen"
      @closed="closeWelcomeModal"
    />

    <task-modal
      v-model:is-open="state.isTaskModalOpen"
      :task-data="taskToEdit"
      @saved="onEdittedTask"
      @closed="taskToEdit = null"
    />
  </div>
</template>

<script>
import { inject, onUnmounted, reactive, ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { ElNotification, ElMessageBox } from "element-plus";
import { useTaskFirestore } from "../utils/useTaskFirestore";
import { useDateTime } from "../utils/useDateTime";
import { useCollection } from "../utils/useCollection";
import { firebaseState, updateSettings } from "../utils/useFirebase";
import { startFireworks } from "../utils/useConfetti";
import BadgeItem from "../components/atoms/BadgeItem.vue";
import Button from "../components/atoms/Button.vue";
import BackgroundIconCard from "../components/molecules/BackgroundIconCard.vue";
import TagsSelect from "../components/atoms/TagsSelect.vue";
import TabHeader from "../components/atoms/TabHeader.vue";
import TaskGroup from "../components/organisms/TaskGroup.vue";
import WelcomeModal from "../components/organisms/modals/WelcomeModal.vue";
import StandupModal from "../components/organisms/modals/StandupModal.vue";
import TaskModal from "../components/organisms/modals/TaskModal.vue";
import QuickAdd from "../components/molecules/QuickAdd.vue";
import differenceInCalendarDays from "date-fns/differenceInCalendarDays";
import { startOfYesterday } from "date-fns";
import format from "date-fns/format";
import subDays from "date-fns/subDays/index";

export default {
  components:{
    BadgeItem,
    Button,
    BackgroundIconCard,
    TagsSelect,
    TabHeader,
    TaskGroup,
    WelcomeModal,
    StandupModal,
    TaskModal,
    QuickAdd
  },
  setup() {
    const {
      saveTask,
      deleteTask,
      getCommitedTasks,
      updateTask,
      getTaskByMatrix,
      updateTaskBatch,
    } = useTaskFirestore();

  // state and ui
  const state = reactive({
    matrix: {
      todo: {
        ref: null,
        list: [],
        classes: "bg-green-400 ring-offset-green-500",
        loaded: false
      },
      schedule: {
        ref: null,
        list: [],
        classes: "bg-blue-400 ring-offset-blue-500",
        loaded: false
      },
      delegate: {
        ref: null,
        list: [],
        classes: "bg-yellow-400 ring-offset-yellow-500",
        loaded: false
      },
      delete: {
        ref: null,
        list: [],
        classes: "bg-red-400 ring-offset-red-500",
        loaded: false
      },
    },
    standup: [],
    standupSummary: [],
    showReminder: false,
    isWelcomeOpen: false,
    isTaskModalOpen: false,
    isTimeTrackerModalOpen: true,
    track: null,
    mobileMode: "zen",
    tabSelected: 'todo',
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
      ref: null
    },
    tasksloaded: computed(() => {
      return Object.values(state.matrix).map(item => item.loaded).every(isLoaded => isLoaded );
    }),
    overdues: computed(() => {
      const { formatDate } = useDateTime()
      return Object.entries(state.matrix).reduce((list, matrix) => {
        return [...list,...matrix[1].list.filter((item) => {
          return item.due_date && item.due_date < formatDate();
        })]
      }, [])
    }),
    stale: computed(() => {
        return Object.entries(state.matrix).reduce((list, matrix) => {
        return [...list,...matrix[1].list.filter((item) => {
          item.diff = differenceInCalendarDays(item.created_at.toDate(), new Date());
          return item.diff;
        })]
      }, [])
    })
  });

  // Modals check
  state.isWelcomeOpen = state.isWelcomeOpen || !firebaseState.settings || !firebaseState.settings.hide_welcome;

  // search
  const searchOptions = reactive({
    text: "",
    tags: []
  })
  const selectedTags = computed(() => {
    return searchOptions.tags.map(tag => tag.uid)
  })

  const tags = inject("tags", []);

  // Edit task
  const taskToEdit = ref({});
  const setTaskToEdit = (task) => {
    taskToEdit.value = task;
    state.isTaskModalOpen = false;
    state.isTaskModalOpen = true;
  };

  const onEdittedTask = (task) => {
    const index = state[task.matrix].findIndex((localTask) => localTask.uid == task.uid);
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
      state.matrix[matrix].ref = collectionRef.onSnapshot(snap => {
        state.matrix[matrix].list = [];
        snap.forEach((doc) => {
          state.matrix[matrix].list.push({ ...doc.data(), uid: doc.id });
        });
        state.matrix[matrix].loaded = true;
      });
    });
  };

  Object.keys(state.matrix).forEach(matrix => {
    getMatrix(matrix);
  })

    // Daily Standup
    const { getAll, save } = useCollection()
    const fetchStandup = async () => {
      const standups = await getAll('standups').where('date', '==', format(new Date(), 'yyyy-MM-dd')).get();
      state.standup = [];
      standups.forEach( item => {
        state.standup.push({...item.data()})
      })
    }

    onMounted(() => {
      fetchStandup()
    })

    const updateStandup = (date) => {
      save('standups', {
        date: date
      });
    }

    const completeDay = async () => {
        const yesterday = format(subDays(new Date(), 1),"yyyy-MM-dd");
        const now = format(new Date(), "yyyy-MM-dd");
        let completed = state.matrix.todo.list.filter(item => item.done);
        completed = completed.map(item => {
            item.commit_date = yesterday;
            item.done = true;
            return item;
        });
        for (const completedTask of completed) {
            await updateTask(completedTask);
        };
        updateStandup(now)
        state.standup = [{
          date: now
        }]
        startFireworks();
    }

    watch(state.tasksloaded, () => {
      if (state.tasksloaded && !state.standup.length) {
        if (state.matrix.todo.list.length) {
            state.standupSummary = {...state.matrix.todo.list};
            state.isStandupOpen = true;
        } else {
          updateStandup(format(new Date(), "yyyy-MM-dd"))
        }
      } 
    }, { immediate: true });

    const fetchCommitted = () => {
      getCommitedTasks(startOfYesterday()).then(committedRef => {
        state.committed.ref = committedRef.onSnapshot( snap => {
          const list = []
          snap.forEach(doc => {
            list.push({ ...doc.data(), uid: doc.id })
          })
          state.committed.list = list;
        })
      })
    }

    fetchCommitted();

    onUnmounted(() => {
      Object.values(state.matrix).forEach( matrix => {
        if (matrix.ref) {
          matrix.ref();
        }
      })

      if (state.committed.ref) {
        state.committed.ref()
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

    const shared = inject('shared')

    return {
      state,
      taskToEdit,
      setTaskToEdit,
      selectedTags,
      onEdittedTask,
      onTaskUpdated,
      addTask,
      destroyTask,
      tags,
      searchOptions,
      closeWelcomeModal,
      completeDay,
      push,
      handleDragChanges,
      shared
    }
  }
}
</script>

<style lang="scss" scoped>
.zen__datails {
  min-height: 400px;
}
</style>
