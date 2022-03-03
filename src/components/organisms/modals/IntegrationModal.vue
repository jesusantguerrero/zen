<template>
  <div>
    <modal-base
      v-model:is-open="isOpenLocal"
      @closed="clearForm()"
      @click-outside="clearForm()"
      :click-to-close="false"
      :show-header="false"
      content-class="md:w-4/12"
    >
      <template #body>
        <div
          class="items-center px-4 py-3 text-base bg-white border-2 border-transparent cursor-default md:rounded-md"
        >
          <div class="px-5 py-5 mb-10 font-medium text-green-500 border border-green-500 rounded-md bg-green-50">
            Select a site and projects to have a better experience in the future.
          </div>
          <AtSteps 
            v-model="state.step"
            @finished="onSubmit"
          >
            <at-step name="Site" title="Sites" class="py-0 pt-10" :after-change="fetchProjects">
              <div class="flex flex-wrap justify-around" v-if="state.list.length">
                <div v-for="site in state.list" :key="getId(site)" @click="state.selectedSite = site"
                >
                  <div 
                  class="p-1 border cursor-pointer"
                  :class="{'border-4 rounded-md border-green-400': state.selectedSite.id == site.id}">
                    <img :src="site.avatarUrl || site.avatar_url" :alt="site.name || site.login" width="110">
                  </div>
                  {{ site.name || site.login }}
                </div>

              </div> 
              <div v-else>
                <i class="fa fa-spinner fa-pulse" />
              </div>
            </at-step>

            <at-step name="Projects" title="Projects" class="py-0 pt-10">
              Select the projects for the fast access
              <div v-if="!state.projects.length">
                <i class="fa fa-spinner fa-pulse" />
              </div>
              <div class="grid grid-cols-2">
                <div v-for="project in state.projects" :key="project.id" @click="toggleSelectedProject(project)" class="flex flex-col items-center justify-center">
                  <div 
                    class="w-12 h-12 p-1 overflow-hidden border cursor-pointer"
                    :class="{'border-4 rounded-md border-green-400':isProjectSelected(project)}">
                    <img :src="project.avatarUrls['48x48']" v-if="project.avatarUrls['48x48']" :alt="project.name">
                  </div>
                  {{ project.name }}
                </div>

              </div> 
            </at-step>
          </AtSteps>
        </div>
      </template>

      <template #footer>
        <div class="flex items-center justify-end space-x-3 text-base">
            <at-button type="secondary" @click.prevent="prev()">
              Back
            </at-button>
            <at-button type="success" @click.prevent="next()">
              {{ state.step == 1 ? 'Submit' : 'Next' }}
              <i v-if="isLoading" class="ml-2 fa fa-spinner fa-pulse" />
            </at-button>
        </div>
      </template>
    </modal-base>
  </div>
</template>

<script setup>
import { ref, watch, reactive, inject } from "vue";
import ModalBase from "../../molecules/ModalBase.vue";
import { functions } from "../../../utils/useFirebase";
import { ElNotification } from "element-plus";
import { AtSteps, AtStep, AtButton } from "atmosphere-ui";
import "atmosphere-ui/dist/style.css";
import { getProjects, getSites } from "../../../domain/integrations/jira";
import { useCollection } from "../../../utils/useCollection";

const props = defineProps({
  isOpen: Boolean,
  placeholder: {
    default: "Add a title",
  },
  type: String,
});

const emit = defineEmits({
  "update:isOpen": Boolean,
  saved: Object,
  closed: Boolean,
});

const isOpenLocal = ref(false);

const getId = (item) => item.login || item.id;
watch(
  () => props.isOpen,
  (isOpen) => {
    isOpenLocal.value = isOpen;
  },
  { immediate: true }
);

watch(
  () => isOpenLocal.value,
  (isOpen) => {
    emit("update:isOpen", isOpen);
  }
);

const state = reactive({
  step: 0,
  integrations: null,
  selectedProjects: [],
  list: [],
  projects: [],
  selectedSite: {},
  isLoading: false,
});

const { getAll, update } = useCollection();

const connectionsRef = getAll("connections");
connectionsRef.limitToLast(1).orderBy('created_at').get().then((snap) => {
  const list = [];
  snap.forEach((connection) => {
    list.push({ uid: connection.id, ...connection.data() });
  });
  state.integrations = list[0];
  fetchLists(state.integrations);
});

const steps = ref(null);
const next = () => {
  state.step += 1;
};

const prev = () => {
  if (state.step > 0) {
    state.step -= 1;
  }
};

// 
const fetchLists = async (integration) => {
  state.isLoading = true;
  const { data, error } = await getSites(integration);
  state.isLoading = false;
  if (!error) {
    state.list = data;
    state.selectedIntegration = integration;
    state.selectedSite = state.list[0];
    return;
  }
  ElNotification({
    title: "Error",
    message: message,
    type: "error",
  });
};

const fetchProjects = async () => {
  const { data, error } = await getProjects(state.selectedIntegration, state.selectedSite);
  if (!error) {
    state.projects = data;
    return new Promise((resolve) =>  resolve(false));
  }
  ElNotification({
    title: "Error",
    message: message,
    type: "error",
  });
};


const toggleSelectedProject = (project) => {
  const index = state.selectedProjects.findIndex((i) => i.key === project.key);
  if (index > -1) {
    state.selectedProjects.splice(index, 1);
  } else {
    state.selectedProjects.push(project);
  }
};

const isProjectSelected = (project) => {
  return state.selectedProjects.findIndex((i) => i.key === project.key) > -1;
};

const onSubmit = () => {
  update('connections', {
    uid: state.selectedIntegration.uid,
    user_uid: state.selectedIntegration.user_uid,
    data: {
      projects: state.selectedProjects,
      site: state.selectedSite,
    }
  }).then(() => {
    emit("saved", state.selectedIntegration);
    ElNotification({
      title: "Success",
      message: "Integration saved",
      type: "success",
    });
  }).catch((err) => {
    ElNotification({
      title: "Error",
      message: err.message,
      type: "error",
    });
  });

}
</script>

<style lang="scss" scoped>
.task-form {
  height: 400px;
  width: 100%;
}
</style>
