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
                        Share board
                      </h1>
                      <small class="block px-2 text-sm">Allow other users see your board and suggest tasks to them</small>
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
              @submit.prevent="onSubmit"
          >   

            <div class="space-y-2 text-left">
              <label for="" class="font-bold"> Email </label>
              <input 
                  v-model="emailValue"
                  type="email" 
                  name="email"
                  class="w-full bg-white focus:outline-none" 
                  :class="{'border-b-2 border-gray-100 focus:border-gray-200 px-2': true}"
              >
              <span class="text-red-500">{{ errorMessage }}</span>
            </div>
            <div class="w-full mt-5 space-y-2 text-sm text-left">
              You are already sharing this board with:
              <ul class="w-fulls">
                <li v-for="person in sharingList" class="flex items-center justify-between w-full py-2 border-b">
                  <div class="flex space-x-2">
                    <el-avatar  :size="36" :src="person.photoUrl" >     
                      <span class="text-xs" v-if="!person.photoUrl"><i class="fa fa-user"></i></span>
                    </el-avatar>
                    <div>
                      <h5 class="mb-0">{{ person.receiver_name}}</h5>
                      <small>{{ (person.receiver_email) }}</small>
                    </div>
                  </div>
                  <Button class="bg-gray-100" type="button" @click="remove(person)"> 
                    <i v-if="person.isLoading" class="mr-1 fa fa-spinner fa-pulse"></i> 
                    <i v-else class="mr-1 fa fa-times" />
                    Remove
                  </Button> 
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
                <i v-if="isLoading" class="ml-2 fa fa-spinner fa-pulse" />
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
import Button from "../../atoms/Button.vue";
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
  emailValue.value = ""
  isLoading.value = false
}

const { errorMessage, value: emailValue, validate } = useField('email', email);

const onSubmit = async () => {
  const { valid } = await validate();
  if (valid) {
    sharingData.email = emailValue.value
    save();
  }
}

const remove = (sharingData) => {
  sharingData.isLoading = true;
  const shareMatrix = functions.httpsCallable('shareMatrix');
  shareMatrix({receiverUid: sharingData.uid, 'method': 'delete' }).then(() => {
    ElNotification({
      title: "Success",
      description: "You have successfully removed this person from your board",
      type: "success",
    });
    clearForm()
    emit('saved', sharingData)
  }).catch(() =>
    ElNotification({
      title: "Error",
      description: "There was an error removing the sharing",
      type: "error",
    })
  )
}

const isLoading = ref(false);
const save = () => {
  const formData =  {...sharingData}
  isLoading.value = true;
  const shareMatrix = functions.httpsCallable('shareMatrix');
  shareMatrix({...formData, 'method': 'post' }).then(() => {
    clearForm()
    isOpenLocal.value = false
    isLoading.value = false
    emit('saved', sharingData)
  }).catch((error) => {
    ElNotification({
      message: error.message,
      type: 'error',
      title: 'Error'
    })
    isLoading.value = false
  })
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

