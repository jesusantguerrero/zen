<template>
<div class="checklist-container text-sm" ref="checklistContainer">
    <h4 class="font-bold text-gray-500">
        Checklist ({{ doneItems }} / {{ items ? items.length : 0 }})
    </h4>
   <draggable v-model="items" handle=".handle">
        <div
            v-for="(check, index) in items"
            :key="check.id"
            class="checklist__item h-8 justify-between cursor-default hover:bg-gray-50 flex items-center my-2 px-2 rounded-sm bg-white"
        >   
            <div class="w-full flex items-center">
                <i class="fa fa-arrows-alt checklist-item__move handle mr-2 opacity-0"  v-if="allowEdit"></i>
                <input
                    type="checkbox"
                    class="form-control-check mx-2 checkbox-done"
                    v-model="check.done"
                    @change.stop="trackChanges"
                />
                <input
                    type="text"
                    class="bg-transparent focus:outline-none w-full ml-2 cursor-default"
                    :disabled="!allowEdit"
                    v-model="check.title"
                />
            </div>
            
            <button class="w-5">
                <i
                    class="fa fa-trash checklist-item__delete text-gray-400 cursor-pointer opacity-0 hover:text-red-300"
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
            @keydown.enter.exact.prevent="saveItem()" 
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
import { defineProps, ref, defineEmit, onMounted, onUnmounted, computed } from "vue";
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

const doneItems = computed(() => {
    return Number(props.items && props.items.filter(item => item.done).length || 0)
})

const checklistContainer = ref(null)
const hasChanges = ref(false)

const trackChanges = () => {
    hasChanges.value = true;
}


const { updateTask } = useTaskFirestore()

const updateItems = () => {
    if (hasChanges.value && props.task && props.task.uid) {
        updateTask({
            uid: props.task.uid,
            checklist: [...props.items]
        })
        hasChanges.value = false
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

<style lang="scss" scoped>
.checklist-item__move {
    @apply rounded-md;
    cursor: grab;
    
}

.ghost .checklist-item__move {
    cursor: grabbing;

}
.sortable-chosen {
    @apply border-green-400;
    border-width: 1px;
    cursor: grabbing !important;
}

.checklist__item {
    &:hover {

        .checklist-item__move,
        .checklist-item__delete {
            opacity: 1;
        }
    }
}
</style>