<template>
<div>
  <modal-base v-model:is-open="isOpenLocal" title="Edit task" @closed="clearForm()" @click-outside="clearForm()" :click-to-close="false">
      <template #title>
           <div class="flex justify-between pr-5">
                  <div class="flex items-center w-full text-left">
                      <div class="w-full text-left">
                      <h1
                          class="text-lg font-bold w-full px-2" 
                      >
                        Share List
                      </h1>
                      </div>
                  </div>

                  <div class="task-item__controls flex items-center">
                      <div class="text-xl cursor-pointer hover:text-red-400 transition-colors">
                        <i class="fa fa-times my-auto" @click="close()"></i>
                      </div>
                  </div>
              </div>
      </template>

      <template #body>
          <form 
              class="task-form bg-white border-transparent border-2 px-4 py-3 md:rounded-md items-center cursor-default"
              @submit.prevent
          >   

            <div class="mt-10 text-left space-y-2">
              <label for="" class="font-bold"> Email </label>
              <input 
                  v-model="sharingData.email"
                  type="email" 
                  class="focus:outline-none bg-white w-full" 
                  :class="{'border-b-2 border-gray-100 focus:border-gray-200 px-2': true}"
              >
            </div>
          </form>
      </template>

      <template #footer>
        <div class="flex justify-end items-center">
          <div class="text-right">
              <button class="bg-gray-400 hover:bg-gray-500 text-white focus:outline-none px-5 py-2 rounded-md mr-2" 
              @click.prevent="close()"> 
                Cancel
              </button>
              <button class="bg-green-400 hover:bg-green-500 text-white focus:outline-none px-5 py-2 rounded-md" 
              @click.prevent="save()"> 
                Share
              </button>
          </div>
        </div>
      </template>
  </modal-base>
</div>
</template>

<script setup>
import { defineProps, ref, watch, computed, reactive, defineEmit} from "vue"
import ModalBase from "../molecules/ModalBase.vue";
import { firebaseInstance } from "../../utils/useFirebase";

const props = defineProps({
    isOpen: Boolean,
    placeholder: {
      default: "Add a title"
    },
    type: String
})

const emit = defineEmit({
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
  email: 'jesusant@mctekk.com',
  matrixes: ['schedule', 'todo']
})

const clearForm = () => {
  sharingData.user_email = ""
  sharingData.user_uid = ""
  sharingData.matrixes = []
}

const save = () => {
  const formData =  {...sharingData}
  const functions = firebaseInstance.functions()
  functions.useEmulator("localhost", 5001)
  const shareMatrix = functions.httpsCallable('shareMatrix');
  shareMatrix(formData).then(() => {
    emit('saved', sharingData)
    clearForm()
    isOpenLocal.value = false
  }).catch(() =>
    console.log("error")
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

