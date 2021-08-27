<template>
  <div
    class="fixed top-0 z-40 h-screen py-20 transition bg-white border"
    :class="[state.showIntegration ? 'right-0' : '-right-96']"
  >
    <div class="flex">
      <div class="integration__screen" v-if="state.selectedIntegration">
        <div class="font-bold">Jira Integration</div>
        <div class="flex justify-center px-5 pt-5 space-x-2">
          <div v-for="item in state.list">
            <el-avatar
              :src="item.avatarUrl"
              :size="36"
              class="cursor-pointer"
              @click="fetchProjects(item)"
            />
          </div>
        </div>
        <template v-if="!state.issues.length">
          <i class="fa fa-spinner fa-pulse" v-if="state.isLoading" />
          <div
            class="px-5 overflow-auto h-96 ic-scroller"
            v-else
          >
            <div
              v-for="project in state.projects"
              class="py-2 text-sm text-left cursor-pointer"
              @click="fetchIssues(project)"
            >
              {{ project.name }}
            </div>
          </div>
        </template>
        <div class="px-5 pt-5 space-y-2" v-else>
          <div class="flex space-x-2">
            <AtButton type="success" class="w-full" @click="importSelectedIssues">
              Import
              <i v-if="state.isImporting" class="mr-1 fa fa-spinner fa-pulse"></i>
            </AtButton>
            <tags-select
                  class="w-full"
                  v-model="state.fastSearch"
                  @update:modelValue="fetchIssues(state.selectedProject, $event[0].value)"
                  :tags="quickSearches"
                  :multiple="false"
                  placeholder="Issue filter"
              /> 
          </div>

          <div class="flex justify-between h-10 space-x-1 rounded-md" v-if="false">
            <input type="search" v-model="state.search" class="w-full h-full px-2 bg-gray-100 rounded-md focus:outline-none" placeholder="Search with jql">
            <at-button class="bg-gray-700" @click="searchIssues">
              <i class="fa fa-search"></i>
            </at-button>
          </div>

          <i class="fa fa-spinner fa-pulse" v-if="state.isLoading" />
          <template v-else>
            <div
              v-for="issue in state.issues"
              class="px-5 py-2 text-sm text-left border rounded-md cursor-pointer"
              :class="{ 'border border-green-500': isIssueSelected(issue) }"
              @click="toggleSelectedIssue(issue)"
            >
              {{ issue.key }} {{ issue.fields.summary }}
            </div>
          </template>
        </div>
      </div>

      <div class="w-12 space-y-2">
        <el-tooltip
          :content="integration.service"
          placement="left"
          v-for="integration in state.integrations"
        >
          <div
            :title="integration.service"
            class="flex justify-center transition-colors cursor-pointer hover:text-green-500"
            @click="toggleIntegration(integration)"
          >
            <IconJira v-if="integration.service == 'jira'" class="w-8" />
            <i class="fa fa-calendar" v-else />
          </div>
        </el-tooltip>
        <div class="cursor-pointer"><i class="fa fa-plus"></i></div>
      </div>
    </div>
  </div>

  <div class="fixed z-50 flex space-x-2 group right-5 bottom-5" v-if="state.integrations.length">
    <div
      title="integrations"
      class="flex items-center justify-center w-16 h-16 text-3xl text-white bg-green-400 rounded-full shadow-md cursor-pointer"
      @click="toggleShowIntegration()"
    >
      <i class="fa fa-robot"></i>
    </div>
  </div>
</template>

<script setup>
import { onUnmounted, reactive } from "vue";
import { useCollection } from "../../utils/useCollection";
import { functions } from "../../utils/useFirebase";
import { AtButton } from "atmosphere-ui";
import TagsSelect from "../atoms/TagsSelect.vue";
import {
getIssues,
  getProjects,
  getSites,
  parseJiraIssue,
} from "../../domain/integrations/jira";
import { ElNotification } from "element-plus";
import { useTaskFirestore } from "../../utils/useTaskFirestore";
import IconJira from "../atoms/integrations/IconJira.vue";

const state = reactive({
  list: [],
  isLoading: false,
  projects: [],
  issues: [],
  search: "",
  fastSearch: [],
  selectedIssues: [],
  selectedProject: null,
  selectedCloud: null,
  integrations: [],
  selectedIntegration: null,
  showIntegration: false,
});

const quickSearches = [{
  uid: 'futuresprint',
  name: 'In future sprints',
  value: '(Sprint in futureSprints()) and assignee = currentUser()',
  colors: []
},
{
  uid: 'thissprint',
  name: 'in open sprint',
  colors: [],
  value: '(Sprint in openSprints() AND sprint NOT IN futureSprints()) and assignee = currentUser()'
}];

const { getAll } = useCollection();

let connectionsRef = getAll("connections").onSnapshot(snap => {
  const list = [];
  snap.forEach((connection) => {
    list.push({ uid: connection.id, ...connection.data() });
  });
  state.integrations = list;
});

onUnmounted(() => {
  connectionsRef()
})

const getIntegrations = functions.httpsCallable("getServiceResources");

const fetchLists = async (integration) => {
  const { data, error } = await getSites(integration);
  if (!error) {
    state.selectedIntegration = integration;
    state.list = data;
    return;
  }
  ElNotification({
    title: "Error",
    message: message,
    type: "error",
  });
};

const fetchProjects = async (cloud) => {
  const { data, error } = await getProjects(state.selectedIntegration, cloud);
  if (!error) {
    state.selectedCloud = cloud;
    state.projects = data;
    return;
  }
  ElNotification({
    title: "Error",
    message: message,
    type: "error",
  });
};

const fetchIssues = async (project = state.selectedProject, search = state.search) => {
  const jql = search ? `project = ${project.key} AND ${search}` : null;
  state.isLoading = true;
  const { data, error } = await getIssues(state.selectedIntegration, state.selectedCloud, project, jql)
  state.isLoading = false;
    if (!error) {
        state.selectedProject = project;
        state.issues = data;
        return;
    }

    ElNotification({
       title: "Error",
        message: error,
        type: "error",
    });
};

const toggleIntegration = (integration) => {
  if (state.selectedIntegration == integration) {
    state.selectedIntegration = null;
    state.issues = [];
    state.selectedProject = null;
    state.selectedCloud = null;
    state.search = "";
  } else {
    state.selectedIntegration = integration;
    state.selectedCloud = integration.data.site;
    state.projects = integration.data.projects;
  }
};

const toggleShowIntegration = () => {
  state.showIntegration = !state.showIntegration;
  state.selectedIntegration = null;
};

const toggleSelectedIssue = (issue) => {
  const index = state.selectedIssues.findIndex((i) => i.key === issue.key);
  if (index > -1) {
    state.selectedIssues.splice(index, 1);
  } else {
    state.selectedIssues.push(issue);
  }
};

const isIssueSelected = (issue) => {
  return state.selectedIssues.findIndex((i) => i.key === issue.key) > -1;
};

const { saveTaskBatch } = useTaskFirestore();
const importSelectedIssues = () => {
  const tasks = state.selectedIssues.map(parseJiraIssue);
  state.isImporting = true;
  saveTaskBatch(tasks)
    .then(() => {
      ElNotification({
        title: "Import issues",
        message: "Import issues success",
        type: "success",
      });
      state.isImporting = false;
      state.selectedIssues = [];
    })
    .catch(() => {
      ElNotification({
        title: "Import issues",
        message: "Import issues failed",
        type: "error",
      });
      state.isImporting = false;
    });
};
</script>

<style scoped>
.integration__screen {
  width: 332px;
}
</style>
