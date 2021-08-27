<template>
<div>
  <modal-base v-model:is-open="isOpenLocal"  @closed="clearForm()" @click-outside="clearForm()" :click-to-close="false" content-class="md:w-4/12">
      <template #title>
           <div class="flex justify-between py-5 pr-5">
                  <div class="flex items-center w-full text-left">
                      <div class="w-full text-left">
                      <h1
                          class="w-full px-2 text-xl font-bold text-gray-500" 
                      >
                        <i class="fa fa-users"></i>
                        Create new space
                      </h1>
                      <small class="block px-2 text-sm">Members of the same space can share tasks</small>
                      </div>
                  </div>

                  <div class="flex items-center task-item__controls">
                      <div class="text-xl transition-colors cursor-pointer hover:text-red-400">
                        <i class="my-auto fa fa-times" @click="close()"></i>
                      </div>
                  </div>
              </div>
      </template>

      <template #body>
          <form 
              class="items-center px-4 py-3 text-base bg-white border-2 border-transparent cursor-default md:rounded-md"
              @submit.prevent
          >   

            <div class="space-y-2 text-left">
              <label for="" class="font-bold"> Email </label>
              <input 
                  v-model="emailValue"
                  type="email" 
                  class="w-full bg-white focus:outline-none" 
                  :class="{'border-b-2 border-gray-100 focus:border-gray-200 px-2': true}"
              >
              <span>{{ errorMessage }}</span>
            </div>
            <div class="mt-5 space-y-2 text-sm text-left">
              You are already sharing this board with:
              <ul>
                <li v-for="person in sharingList">
                  {{ person.name}} {{ (person.email) }}
                </li>
              </ul>
            </div>
          </form>
      </template>

      <template #footer>
        <div class="flex items-center justify-end text-base">
          <div class="text-right">
              <button class="px-5 py-2 text-white bg-green-400 rounded-md hover:bg-green-500 focus:outline-none" 
              @click.prevent="onSubmit"> 
                Send invite
              </button>
          </div>
        </div>
      </template>
  </modal-base>
</div>
</template>

<script setup>
import { ref, watch, reactive, inject } from "vue"
import ModalBase from "../../molecules/ModalBase.vue";
import { functions } from "../../../utils/useFirebase";
import { useField} from 'vee-validate';
import { email, required } from "@vee-validate/rules"
import { ElNotification } from "element-plus";

const props = defineProps({
    isOpen: Boolean,
    placeholder: {
      default: "Add a title"
    },
    type: String
})

const emit = defineEmits({
    "update:isOpen": Boolean,
    "saved": Object,
    "closed": Boolean
})

const isOpenLocal = ref(false)

watch(()=> props.isOpen, (isOpen) => {
    isOpenLocal.value = isOpen;
}, { immediate: true })

watch(()=> isOpenLocal.value, (isOpen) => {
    emit("update:isOpen", isOpen)
})

const sharingData = reactive({
  quadrants: ['todo', 'schedule', 'delegate', 'delete'],
  email: '',
  matrixes: ['todo', 'schedule', 'delegate', 'delete']
})

const sharingList = inject("sharing", []);

const clearForm = () => {
  sharingData.email = ""
  sharingData.matrixes = []
}

const { errorMessage, value: emailValue, validate } = useField('email', [required, email]);

const onSubmit = async () => {
  const isValid = await validate();
  if (isValid) {
    sharingData.email = emailValue.value
    save();
  }
}

const save = () => {
  const formData =  {...sharingData}
  const shareMatrix = functions.httpsCallable('shareMatrix');
  shareMatrix(formData).then((done) => {
    emit('saved', sharingData)
    clearForm()
    isOpenLocal.value = false
  }).catch(() =>
    ElNotification({
      title: "Error",
      text: "There was an error saving the data",
      type: "error",
    })
  )
}

const close = () => {
    emit('closed')
    isOpenLocal.value = false
    clearForm()
}
</script>

<style lang="scss" scoped>
.task-form {
  height: 400px;
  width: 100%;
}
</style>

