<template>
<div class="checklist-container" ref="checklistContainer">
   <draggable v-model="items" handle=".handle">
        <div
            v-for="(check, index) in items"
            :key="check.id"
            class="h-8 justify-between cursor-default hover:bg-gray-100 flex items-center my-2 px-2"
            :class="[!allowEdit ? 'bg-white' : 'bg-gray-50']"
        >   
            <div class="w-full flex items-center">
                <i class="fa fa-arrows-alt checklist-item__move handle mr-2"  v-if="allowEdit"></i>
                <input
                    type="checkbox"
                    class="form-control-check mx-2"
                    v-model="check.done"
                    @change.stop="trackChanges"
                />
                <input
                    type="text"
                    class="bg-transparent focus:outline-none w-full"
                    :disabled="!allowEdit"
                    v-model="check.title"
                />
            </div>
            
            <button class="w-5">
                <i
                    class="fa fa-trash checklist-item__delete cursor-pointer hover:text-red-300"
                    @click="deleteItem(index)"
                    v-if="allowEdit"
                ></i>
            </button>
        </div>
    </draggable>

    <div class="text flex justify-between items-center border-2 border-gray-100 bg-gray-100 px-2 rounded-md shadow-sm"
        :class="{'border-gray-400': isFocused}"
        v-if="allowEdit"
    >
        <input type="checkbox" disabled class="mr-2">
        <input 
            class="w-full h-8 bg-gray-100 focus:outline-none"
            type="text" 
            ref="input"
            v-model="checkItem.title" 
            @keydown.enter.stop="saveItem()" 
            @focus="isFocused=true"
            @blur="isFocused=false"
            placeholder="+ Add an item and press enter"
        >
    </div>
</div>
</template>

<script setup>
import { onClickOutside } from "@vueuse/core";
import { ElNotification } from "element-plus";
import { useTaskFirestore } from "../../utils/useTaskFirestore"
import { defineProps, ref, defineEmit, onMounted, onUnmounted } from "vue";
import { VueDraggableNext as Draggable } from "vue-draggable-next"

const props = defineProps({
    items: Array,
    task: Object,
    allowEdit: Boolean
})

const emit = defineEmit({
    'updated': Array
})

const isFocused = ref(false)
const input = ref(null)

const checkItem = ref({
    title: "",
    done: false
})

const deleteItem = (index) => {
    props.items.splice(index, 1);
}

const saveItem = () => {
    if (!checkItem.value.title) {
        ElNotification({
            title: "Missing Title",
            message: "Title is required for a checklist item"
        })
        return
    }
    props.items.push(checkItem.value);
    checkItem.value = {
        title: "",
        done: false,
    }
    input.value && input.value.focus();
}


const checklistContainer = ref(null)
const hasChanges = ref(false)

const trackChanges = () => {
    hasChanges.value = true;
}


const { updateTask } = useTaskFirestore()

const updateItems = () => {
    if (hasChanges.value && props.task.uid) {
        updateTask({
            uid: props.task.uid,
            checklist: [...props.items]
        })
        hasChanges.value = false
        console.log("hola")
    }
}


onMounted(() => {
    onClickOutside(checklistContainer, () => {
        updateItems()
    })
})

onUnmounted(() => {
    updateItems()
})

</script>