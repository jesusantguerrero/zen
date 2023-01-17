<template>
    <section>
        <article>
            <form action="" @submit.prevent="save" class="px-5 pt-5 mx-auto text-left">
                 <h4 class="font-bold">  Max current tasks in Todo </h4>
                 <div class="form-group">
                    <input
                        type="number"
                        min="0"
                        class="form-control"
                        placeholder="0"
                        v-model="formData.matrixMaxTodoTasks"
                    />
                 </div>

                 <h4 class="font-bold"> Matrix Names </h4>
                 <div class="flex">
                    <div class="form-group">
                        <label for="">
                            Todo
                        </label>
                        <input
                            class="form-control"
                            placeholder="Todo"
                            v-model="formData.matrix_todo_name">
                    </div>
                    <div class="form-group">
                        <label for="">
                            Schedule
                        </label>
                        <input
                            class="form-control"
                            placeholder="Schedule"
                            v-model="formData.matrix_schedule_name"
                        >
                    </div>
                    <div class="form-group">
                        <label for="">
                            Delegate
                        </label>
                        <input
                            class="form-control"
                            placeholder="Delegate"
                            v-model="formData.matrix_delegate_name"
                        >
                    </div>
                    <div class="form-group">
                        <label for="">
                            Delete
                        </label>
                        <input
                            class="form-control"
                            placeholder="Delete"
                            v-model="formData.matrix_delete_name"
                        >
                    </div>
                    <div class="form-group">
                        <label for="">
                            Backlog
                        </label>
                        <input
                            class="form-control"
                            placeholder="Backlog"
                            v-model="formData.matrix_backlog_name"
                        >
                    </div>
                 </div>
            </form>
        </article>

        <footer class="flex justify-end w-full px-5 py-3 ">
            <button  class="px-5 py-1 mr-2 text-white bg-gray-500 rounded-md focus:outline-none" @click="emit('cancel')">
                Cancel
            </button>
            <button class="px-5 py-1 text-white bg-green-400 rounded-md focus:outline-none" @click="save()">
                Save
            </button>
        </footer>
    </section>
</template>

<script setup>
import { firebaseState, updateSettings } from "../../_features/app/useFirebase";
import { ElNotification } from "element-plus";
import { reactive } from "vue";

const formData = reactive(firebaseState.settings)

const emit = defineEmits({
    saved: Object,
    cancel: null,
    "update:isOpen": Boolean
}) 


const save = () => {
    updateSettings(formData).then(() => {
        emit('saved', formData)
        ElNotification({
            title: "Updated",
            message: "Configuration Updated"
        })
    })
}

</script>

<style lang="scss">
    .form-control {
        @apply bg-gray-100;
        @apply border-gray-400; 
        @apply px-4;
        width: 100%;
        border-width: 2;
        height: 37px;
        border-radius: 4px;
    }

    h4 {
        @apply mb-2;
    }

    .form-group {
        @apply mx-2;
        @apply mb-4;
    }

    .workflow-item {
        @apply border-2;
        @apply border-gray-300;
        display: inline-block;
        margin: 2px;
        padding: 2px 5px;
        border-radius: 4px;
        cursor: pointer;
    }
</style>