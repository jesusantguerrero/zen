<template>
<div>
  <modal-base v-model:is-open="state.isOpenLocal" title="Edit task" @closed="clearForm()" @click-outside="clearForm()" :click-to-close="false">
      <template #title>
           <div class="flex justify-between pr-5">
                  <div class="flex items-center w-full text-left">
                      <button class="px-2 py-1 mx-3 rounded-md " :class="typeColor"> 
                          <i :class="icon"> </i>
                      </button>

                      <div class="w-full text-left">
                      <h1
                          class="w-full px-2 text-lg font-bold" 
                      >
                        Edit task
                      </h1>
                      </div>
                  </div>

                  <div class="flex items-center task-item__controls" v-if="!isReminder">
                      <div class="text-xl transition-colors cursor-pointer hover:text-red-400">
                        <i class="my-auto fa fa-times" @click="close()"></i>
                      </div>
                  </div>
              </div>
      </template>

      <template #body>
          <form 
              class="items-center px-4 py-3 bg-white border-2 border-transparent cursor-default task-form dark:bg-gray-700 md:rounded-md"
              @submit.prevent
          >   
              <div class="flex justify-between">
                  <div class="flex items-center w-full">
                      <div class="w-full">
                      <input 
                          type="text" 
                          class="w-full px-2 border-b-2 border-gray-100 focus:outline-none dark:bg-transparent dark:text-gray-300 dark:border-gray-600 dark:focus:border-gray-500"  
                          :placeholder="placeholder" 
                          v-model="task.title"
                      >
                      </div>
                  </div>
                  <div class="w-32">
                    <date-select
                      placeholder="Due date"
                      class="w-full"
                      v-model="task.due_date"              
                    />
                  </div>
              </div>

                
              <div class="w-full p-3 pb-20 task-item__body">
                  <textarea 
                    ref="descriptionInput"
                    v-model="task.description"
                    class="w-full h-20 pt-2 resize-none task-item__description focus:outline-none dark:bg-transparent dark:text-gray-300" 
                    placeholder="Add a short description"
                    @input="setHeight">
                  </textarea>
                  
                  <div class="flex pt-5 text-left task-item__checklist">
                    <ChecklistContainer 
                      v-model="state.checklistTitle"
                      v-model:items="task.checklist" 
                      :task="task" 
                      :allow-edit="true" 
                      class="w-10/12"
                    />
                    <div class="w-2/12 px-2 text-sm" v-if="task.matrix == 'delegate'">
                      <h4 class="text-sm font-bold text-gray-500"> Delegated to: </h4>
                      <person-select
                        v-if="task.matrix=='delegate'"
                        v-model="task.contacts"
                        :items="contacts"
                        :multiple="true" 
                        @selected="addContact"
                        @added="createContact"
                      /> 
                    </div>
                  </div>
              </div>

              <div class="text-left" v-if="false">
                <el-upload
                  :auto-upload="false"
                  list-type="picture-card"
                  :file-list="task.files"
                  :on-change="handleUpload"
                >
                  <template #file="{file}">
                    <div>
                      <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
                    </div>
                  </template>
                  <i class="el-icon-plus"></i>
                </el-upload>
                <el-dialog v-model="dialogVisible">
                  <img width="100%" :src="dialogImageUrl" alt="" />
                </el-dialog>
              
              </div>
          </form>
      </template>

      <template #footer>
        <div class="flex items-center justify-between pt-4 border-t-2 dark:border-gray-500">
          <tags-select
              v-model="task.tags"
              :tags="tags"
              :multiple="true" 
              @selected="addTag"
              @added="createTag"
          /> 

          <div class="text-right">
              <button class="px-5 py-2 mr-2 text-white bg-gray-400 rounded-md hover:bg-gray-500 focus:outline-none" 
              @click.prevent="close()"> 
                Cancel
              </button>
              <button class="px-5 py-2 text-white bg-green-400 rounded-md hover:bg-green-500 focus:outline-none" 
              @click.prevent="save()"> 
                Save 
              </button>
          </div>
        </div>
      </template>
  </modal-base>
</div>
</template>

<script setup>
import { ref, watch, computed, reactive, toRefs } from "vue"
import { useTaskFirestore } from "../../../utils/useTaskFirestore"
import { useDateTime } from "../../../utils/useDateTime"
import { useCustomSelect } from "../../../utils/useCustomSelect"
import TagsSelect from "../../atoms/TagsSelect.vue"
import PersonSelect from "../../atoms/PersonSelect.vue"
import ModalBase from "../../molecules/ModalBase.vue";
import ChecklistContainer from "../ListContainer.vue";
import { ElMessageBox, ElNotification } from "element-plus"
import { firebaseInstance, firebaseState } from "../../../utils/useFirebase"
import DateSelect from "../../atoms/DateSelect.vue"

const props = defineProps({
    isOpen: Boolean,
    taskData: Object,
        mode: {
      Type: String,
      default: 'task'
    },
    placeholder: {
      default: "Add a title"
    },
    type: String,
    allowEdit: Boolean
})

const emit = defineEmits({
    "update:isOpen": Boolean,
    "saved": Object,
    "closed": Boolean
})

const state = reactive({
  isOpenLocal: false,
  checklistTitle: ""
})

watch(()=> props.isOpen, (isOpen) => {
    state.isOpenLocal = isOpen;
}, { immediate: true })

watch(()=> state.isOpenLocal, (isOpen) => {
    emit("update:isOpen", isOpen)
    if (isOpen) {
      setHeight()
    }
})

// FormData
const descriptionInput = ref(null);
const setHeight = () => {
  setTimeout(() => {
    const description = descriptionInput.value;
    if (!description) {
      return
    }
    description.style.height = "";
    description.style.height = description.scrollHeight + "px"
  }, 10)
}

const task = reactive({
  uid: false,
  title: "",
  description: "",
  due_date: "",
  duration: "",
  tags: [],
  contacts: [],
  checklist: [],
  tracks: [],
  files: [],
  done: false,
  commit_date: null,
  matrix: props.type || "backlog",
})

const { taskData } = toRefs(props);

const setTaskData = (taskData) => {
  if (taskData && task) {
    const data = Object.assign(taskData, {});
    
    Object.keys(data).forEach((key) => {
      const objectData = data[key]
      task[key] = Array.isArray(objectData) ? [...objectData] : objectData
    });
  }
}

watch(()=> props.isOpen, (isOpen) => {
  if(taskData.value || state.isOpenLocal) {
    setTaskData(taskData.value)
  }
}, { immediate: true, deep: true })


const isReminder = computed(() => {
  return props.mode == 'reminder'
})

const icon = computed(() => {
  return 'fa fa-edit'
})

const typeColor = computed(() => {
  const colors = {
    todo: 'bg-green-100 text-green-500',
    schedule: 'bg-blue-100 text-blue-500',
    reminder: 'bg-blue-100 text-blue-500',
    delegate: 'bg-yellow-100 text-yellow-500',
    delete: 'bg-red-100 text-red-500',
    backlog: 'bg-gray-100 text-gray-500'
  }

  return colors[props.type] || colors['todo']
})

// functionnality flow
const clearForm = () => {
  task.uid = false;
  task.title = "";
  task.description = "";
  task.due_date = "";
  task.duration = "";
  task.matrix = props.type || "backlog";
  task.tags = [];
  task.contacts = [];
  task.checklist = [];
}

const handleUpload = (res) => {
  const storageRef = firebaseInstance.storage().ref();
  const uploadTask = storageRef.child(`${firebaseState.user.uid}/${res.name}`).put(res.raw, {
    contentType: res.raw.type
  })

  uploadTask.on('state_changed', snap => {
    const progress = (snap.bytesTransferred / snap.totalBytes) * 100;
  }, 
  (err) => { 
    ElNotification({
      title: "Upload failed",
      message: err.message,
      type: "error",
    })
  }, 
  () => {
    uploadTask.snapshot.ref.getDownloadURL().then(url => {
      delete res.raw;
      task.files.push({
        name:res.name,
        url
      })
    })
  })
}

const { updateTask } = useTaskFirestore()
const { formatDate } = useDateTime()

const confirmChecklist = async () => {
  let canSave = true;
  if (state.checklistTitle) {
    canSave = await ElMessageBox.confirm(`There are an unsaved checklist item`, "Are you sure?", {
      confirmButtonText: "Add item and save",
      cancelButtonText: "Remove item and save"
    }).then(() => true).catch(() => false)

    if (canSave) {
      task.checklist.push({ 
        title: state.checklistTitle,
        done: false
      });
    } 
  }
  
  state.checklistTitle = "";
}

const save = async () => {
  await confirmChecklist();
  // check item

  const formData =  {...task}
  formData.tracks = [];
  formData.due_date = formData.due_date && typeof formData.due_date == 'object' ? formatDate(formData.due_date , "yyyy-MM-dd") : formData.due_date
  updateTask(formData).then(() => {
    emit('saved', formData)
    clearForm()
    state.isOpenLocal = false
  })
}

const close = () => {
    emit('closed')
    state.isOpenLocal = false
    clearForm()
}

// tags
const {list: tags, addToList: createTag, selectItem: addTag} = useCustomSelect(task, 'tags')
const {list: contacts, addToList: createContact, selectItem: selectContact} = useCustomSelect(task, 'contacts')
</script>

<style lang="scss" scoped>
.task-form {
  min-height: 400px;
  width: 100%;
}
</style>

