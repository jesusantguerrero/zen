<template>
    <div>
        <el-popover
            placement="bottom-end"
            :width="240"
            :show-arrow="false"
            @after-enter="focusInput()"
        >

            <div class="pt-2 pb-5 px-2 w-full">
                <input
                    class="w-full h-8 rounded-md px-2 border-2 border-gray-100" 
                    type="text" 
                    placeholder="Add or create a tag"
                    v-model.trim="state.searchText"
                    ref="input"
                    @keydown.up.prevent="moveCursorUp()"
                    @keydown.down.prevent="moveCursorDown()"
                />

                <div class="tags-container mt-2">
                    <div v-for="tag in filteredTags" 
                        :key="tag" 
                        class="px-2 py-2 border-2 border-white hover:bg-blue-100 cursor-pointer"
                        :class="{'border-blue-400': preSelectedValue == tag}"
                    >
                        {{ tag }}
                    </div>
                </div>

                <div v-if="state.searchText">
                    <button class="px-2 h-8 w-full"> 
                        Add tag:  "{{ state.searchText}}"</button>
                </div>
            </div>


            <template #reference>
            <button 
                ref="button"
                :class="{'text-blue-400': formattedTags }" 
                class="flex focus:outline-none"
                @click.stop="addTag" 
                @mousedown.prevent
                @focus.prevent="focusButton"
            >
                <i class="fa fa-tags cursor-pointer"></i>
                <span class="text-xs" > {{ formattedTags }}</span>
            </button>
            </template>
        </el-popover>
    </div>
</template>

<script setup>
import { computed, defineEmit, reactive, watch, ref } from "vue";

const props = defineProps({
    tags: Array,
    default() {
        return ["rojo", "blanco"]
    }
})
const input = ref(null);
const button = ref(null);

const emit = defineEmit({
    'tag-added': Date
})

const state = reactive({
    searchText: "",
    cursor: 0,
    isOpen: false,
    tags: []
})

// Tags
const formattedTags = computed(() => {
    return state.tags.join(" ")
});

const filteredTags = computed(() => {
    return state.tags.filter(tag => {
        return tag.includes(state.searchText)
    })
});

// Cursor
const focusInput = () => {
    input.value && input.value.focus()
}

const focusButton = (e) => {
    e.target.click()
}

watch(() => filteredTags.value, (tags) => {
    if (state.cursor > filteredTags.value.length - 1) {
        state.cursor = 0;
    }
})

const preSelectedValue = computed(() => {
    return state.cursor <= filteredTags.value.length ? filteredTags.value[state.cursor] : "";
});

const moveCursorUp = () => {
    if (state.cursor > 0 ) {
        state.cursor = state.cursor - 1
    }
}

const moveCursorDown = () => {
    if ((state.cursor + 1) < filteredTags.value.length  ) {
        state.cursor = state.cursor + 1
    }
}

// emits
const selectTag = () => {
    if (filteredTags.length) {
        emit('tag-selected', filteredTags[0])
    }
}

const addTag = () => {
    emit('tag-added', state.searchText);
    state.tags.push(state.searchText)
    state.searchText = "";
}
</script>