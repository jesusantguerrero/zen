<template>
    <div class="tag-select">
        <el-popover
            placement="bottom-end"
            :width="240"
            :show-arrow="false"
            popper-class='tag-select'
            @after-enter="focusInput()"
        >

            <div class="pt-2 pb-5 px-2 w-full">
                <input
                    class="w-full h-8 rounded-md px-2 border-2 border-gray-100 focus:outline-none focus:border-gray-200" 
                    type="text" 
                    placeholder="Add or create a tag"
                    v-model.trim="searchText"
                    ref="input"
                    @click.stop
                    @keydown.enter="selectTag()"
                    @keydown.up.prevent="moveCursorUp()"
                    @keydown.down.prevent="moveCursorDown()"
                />

                <div class="tags-container mt-2">
                    <div v-for="tag in filteredList" 
                        :key="tag" 
                        class="px-2 py-2 border-2 border-white hover:bg-blue-100 cursor-pointer"
                        :class="{'border-blue-400': preSelectedValue == tag}"
                        @click.stop="selectTag(tag)"
                    >
                        {{ tag.name }} Joder
                    </div>
                </div>

                <div v-if="searchText && filteredList.length == 0">
                    <button class="px-2 h-8 w-full" @click="addTag"> 
                        Add tag:  "{{ searchText}}"</button>
                </div>
            </div>


            <template #reference>
            <button 
                ref="button"
                :class="{'text-blue-400': formattedTags }" 
                class="flex focus:outline-none"
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
import { computed, defineEmit, reactive, watch, ref, toRefs } from "vue";
import { useFuseSearch } from "../../utils/useFuseSearch"

const props = defineProps({
    tags: [],
    selectedTags: []
})
const input = ref(null);
const button = ref(null);

const emit = defineEmit({
    'added': Object,
    'selected': Object
})

const state = reactive({
    cursor: 0,
    isOpen: false,
})

// Tags
const searchText = ref("")
const { tags, selectedTags } = toRefs(props)
const formattedTags = computed(() => {
    return selectedTags && selectedTags.value.map(item => item.name).join(" ")
});
const { filteredList  } = useFuseSearch(searchText, tags)

// Cursor
const focusInput = () => {
    input.value && input.value.focus()
}

const focusButton = (e) => {
    e.target.click()
}

watch(() => filteredList.value, (tags) => {
    if (state.cursor > filteredList.value.length - 1) {
        state.cursor = 0;
    }
})

const preSelectedValue = computed(() => {
    return state.cursor <= filteredList.value.length ? filteredList.value[state.cursor] : "";
});

const moveCursorUp = () => {
    if (state.cursor > 0 ) {
        state.cursor = state.cursor - 1
    }
}

const moveCursorDown = () => {
    if ((state.cursor + 1) < filteredList.value.length  ) {
        state.cursor = state.cursor + 1
    }
}

// emits
const addTag = () => {
    if (searchText.value) {
        emit('added', {
            name: searchText.value
        });
        emit('selected', {
            name: searchText.value
        });
        searchText.value = "";
    }
}

const selectTag = (tag) => {
    if (filteredList.value.length) {
        emit('selected', tag || filteredList[0])
    } else {
        addTag()
    }
}

</script>